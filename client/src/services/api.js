import axios from 'axios';

/**
 * Single Axios instance for the whole application.
 *
 * By default requests go to `/api` on the current origin - the Vite dev server
 * proxies them to the Express API (see vite.config.js). Setting
 * VITE_API_BASE_URL points the client at a different backend origin instead,
 * so the URL is never hardcoded in components.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const OFFLINE_MESSAGE =
  'Cannot reach the LeaveManager API. Start the whole application with "npm run dev" in the project root (it starts the API on port 5000 and the web app on port 5173), then try again.';

/**
 * A dev proxy answers 500, and most gateways answer 502/503/504, with an HTML
 * or plain-text body when the upstream API is not listening. That is a
 * "backend is down" situation, not a bug inside the API, so it must not be
 * reported as a server error.
 */
const GATEWAY_STATUSES = new Set([500, 502, 503, 504]);

export const UNREACHABLE_MESSAGE =
  'The API did not answer. The web server in front of it returned an error page instead of JSON, which usually means the Express backend is not running. Start the whole application with "npm run dev" in the project root (API on port 5000, web app on port 5173), then try again.';

/** One-line variant for compact surfaces (a modal banner, an inline card). */
export const UNREACHABLE_SHORT = 'The API is not reachable. Start it with "npm run dev" in the project root and try again.';

/** Distinguishes the failure kinds so the UI can react appropriately. */
export const ERROR_KINDS = {
  OFFLINE: 'offline', // no response at all: backend down, wrong port, DNS
  TIMEOUT: 'timeout', // request took longer than the client timeout
  UNREACHABLE: 'unreachable', // a proxy/gateway answered, so the API itself never did
  SERVER: 'server', // the API answered 5xx with something other than our envelope
  REQUEST: 'request', // 4xx handled by the API with a JSON envelope
  ENDPOINT: 'endpoint', // 404 on the route itself: wrong base URL / wrong server
  UNKNOWN: 'unknown',
};

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Normalises Axios failures into a predictable object for the UI.
 *
 * Order matters: a response that is NOT our JSON envelope (an HTML page from a
 * proxy, a gateway 502, a static host 404) must not be reported as "backend not
 * running" - that message is reserved for failures where no response arrived at
 * all, because the fix is completely different.
 */
export function toApiError(error) {
  if (!axios.isAxiosError(error)) {
    return {
      status: 0,
      kind: ERROR_KINDS.UNKNOWN,
      message: error?.message || 'An unexpected error occurred.',
      shortMessage: error?.message || 'An unexpected error occurred.',
      errors: {},
    };
  }

  const response = error.response;

  // 1. The API answered with its JSON envelope - the normal, expected path.
  if (response && isPlainObject(response.data)) {
    return {
      status: response.status,
      kind: response.status >= 500 ? ERROR_KINDS.SERVER : ERROR_KINDS.REQUEST,
      message: response.data.message || 'The request could not be completed.',
      shortMessage: response.data.message || 'The request could not be completed.',
      errors: response.data.errors || {},
    };
  }

  // 2. Something answered, but not with our JSON envelope.
  if (response) {
    const { status } = response;

    if (status === 404) {
      return {
        status,
        kind: ERROR_KINDS.ENDPOINT,
        message: `The API endpoint was not found (404). Check that the backend is running and that VITE_API_BASE_URL points at it (currently "${API_BASE_URL}").`,
        shortMessage: 'The API endpoint was not found (404). Check VITE_API_BASE_URL and that the backend is up.',
        errors: {},
      };
    }
    if (status === 413) {
      return {
        status,
        kind: ERROR_KINDS.REQUEST,
        message: 'That request was too large. Please shorten the text and try again.',
        shortMessage: 'That request was too large. Please shorten the text and try again.',
        errors: {},
      };
    }

    if (GATEWAY_STATUSES.has(status)) {
      return {
        status,
        kind: ERROR_KINDS.UNREACHABLE,
        message: UNREACHABLE_MESSAGE,
        shortMessage: UNREACHABLE_SHORT,
        errors: {},
      };
    }

    return {
      status,
      kind: ERROR_KINDS.SERVER,
      message: `The server returned an unexpected ${status} response. Check the terminal running the backend for the error details.`,
      shortMessage: `The server returned an unexpected ${status} response. Check the backend terminal for details.`,
      errors: {},
    };
  }

  // 3. No response at all - network layer.
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return {
      status: 0,
      kind: ERROR_KINDS.TIMEOUT,
      message: 'The server took too long to respond. Please try again.',
      shortMessage: 'The server took too long to respond. Please try again.',
      errors: {},
    };
  }

  return {
    status: 0,
    kind: ERROR_KINDS.OFFLINE,
    message: OFFLINE_MESSAGE,
    shortMessage: UNREACHABLE_SHORT,
    errors: {},
  };
}

/** True when the API could not be reached at all (used to drive the banner). */
export function isOfflineError(error) {
  return (
    error?.kind === ERROR_KINDS.OFFLINE ||
    error?.kind === ERROR_KINDS.TIMEOUT ||
    error?.kind === ERROR_KINDS.UNREACHABLE
  );
}

/** Lightweight connectivity probe used by the global status banner. */
export async function checkApiHealth() {
  try {
    const { data } = await api.get('/health', { timeout: 5000 });
    return { online: true, data: data?.data ?? null };
  } catch (error) {
    return { online: false, error: toApiError(error) };
  }
}

export default api;
