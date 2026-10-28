import { describe, expect, it } from 'vitest';
import { ERROR_KINDS, isOfflineError, toApiError } from './api.js';

/**
 * Axios marks its errors with `isAxiosError`, so plain objects are enough to
 * exercise every branch of the classifier without mocking the network.
 */
const axiosError = (overrides = {}) => ({
  isAxiosError: true,
  message: 'Request failed',
  ...overrides,
});

describe('toApiError classification', () => {
  it('keeps the API envelope message for a handled 4xx', () => {
    const error = toApiError(
      axiosError({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'A rejection reason is required.',
            errors: { rejectionReason: 'A rejection reason is required.' },
          },
        },
      }),
    );

    expect(error).toMatchObject({
      status: 400,
      kind: ERROR_KINDS.REQUEST,
      message: 'A rejection reason is required.',
    });
    expect(error.errors).toHaveProperty('rejectionReason');
    expect(error.shortMessage).toBe('A rejection reason is required.');
    expect(isOfflineError(error)).toBe(false);
  });

  it('reports a 409 conflict as a request error, not a network failure', () => {
    const error = toApiError(
      axiosError({
        response: {
          status: 409,
          data: { message: 'This leave request has already been approved and cannot be processed again.' },
        },
      }),
    );

    expect(error.status).toBe(409);
    expect(error.kind).toBe(ERROR_KINDS.REQUEST);
    expect(error.message).toMatch(/already been approved/i);
    expect(isOfflineError(error)).toBe(false);
  });

  it('marks a 500 with a JSON body as a server error', () => {
    const error = toApiError(
      axiosError({ response: { status: 500, data: { message: 'An unexpected error occurred.' } } }),
    );

    expect(error.kind).toBe(ERROR_KINDS.SERVER);
    expect(error.status).toBe(500);
  });

  it('treats a proxy 500 without JSON as a backend that is not running', () => {
    // This is exactly what Vite's dev proxy returns when port 5000 is closed.
    const error = toApiError(
      axiosError({
        response: { status: 500, data: 'Error occurred while trying to proxy: /api/leaves' },
      }),
    );

    expect(error.kind).toBe(ERROR_KINDS.UNREACHABLE);
    expect(isOfflineError(error)).toBe(true);
    expect(error.message).toMatch(/backend is not running/i);
    expect(error.message).toMatch(/npm run dev/);
    // The modal shows the one-liner; the banner shows the full diagnosis.
    expect(error.shortMessage).toMatch(/API is not reachable/i);
    expect(error.shortMessage.length).toBeLessThan(error.message.length);
  });

  it('treats a gateway 502 HTML page as an unreachable API', () => {
    const error = toApiError(
      axiosError({ response: { status: 502, data: '<html><body>Bad Gateway</body></html>' } }),
    );

    expect(error.kind).toBe(ERROR_KINDS.UNREACHABLE);
    expect(isOfflineError(error)).toBe(true);
  });

  it('keeps a non-gateway 5xx as a server error', () => {
    const error = toApiError(axiosError({ response: { status: 501, data: 'Not Implemented' } }));

    expect(error.kind).toBe(ERROR_KINDS.SERVER);
    expect(error.message).toMatch(/501/);
  });

  it('keeps a 503 that carries the API envelope as a server error', () => {
    const error = toApiError(
      axiosError({ response: { status: 503, data: { message: 'Database is busy.' } } }),
    );

    expect(error.kind).toBe(ERROR_KINDS.SERVER);
    expect(error.message).toBe('Database is busy.');
  });

  it('explains a 404 on the endpoint as a configuration problem', () => {
    const error = toApiError(axiosError({ response: { status: 404, data: 'Not Found' } }));

    expect(error.kind).toBe(ERROR_KINDS.ENDPOINT);
    expect(error.message).toMatch(/VITE_API_BASE_URL/);
  });

  it('reports a genuine connection failure as offline with the start command', () => {
    const error = toApiError(axiosError({ code: 'ERR_NETWORK', response: undefined }));

    expect(error.kind).toBe(ERROR_KINDS.OFFLINE);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/npm run dev/);
    expect(error.shortMessage).toMatch(/API is not reachable/i);
    expect(isOfflineError(error)).toBe(true);
  });

  it('reports a timeout separately from a refused connection', () => {
    const error = toApiError(axiosError({ code: 'ECONNABORTED', response: undefined }));

    expect(error.kind).toBe(ERROR_KINDS.TIMEOUT);
    expect(error.message).toMatch(/too long to respond/i);
    expect(isOfflineError(error)).toBe(true);
  });

  it('passes through non-axios errors without throwing', () => {
    const error = toApiError(new Error('boom'));

    expect(error.kind).toBe(ERROR_KINDS.UNKNOWN);
    expect(error.message).toBe('boom');
  });
});
