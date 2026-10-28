'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { DEPARTMENTS, LEAVE_TYPES, LEAVE_STATUSES } = require('./validators/common');

/**
 * When `client/dist` has been built the API also serves the React single page
 * application, so one process = one public URL. In development the Vite dev
 * server serves the UI instead and proxies /api here.
 */
function mountClient(app) {
  // Tests exercise the API only; serving the built SPA there would mask the
  // JSON 404 behaviour the suite asserts on.
  if (config.isTest) return false;

  const indexHtml = path.join(config.clientDist, 'index.html');

  if (!fs.existsSync(indexHtml)) {
    return false;
  }

  // Fingerprinted assets can be cached for a long time; index.html must not be,
  // otherwise a redeploy keeps serving an old bundle that references dead files.
  app.use(
    express.static(config.clientDist, {
      index: false,
      etag: true,
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );

  // Client-side routing fallback: every non-API GET renders the SPA shell.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-cache');
    return res.sendFile(indexHtml);
  });

  return true;
}

/**
 * Builds the Express application.
 * Exported separately from `server.js` so Supertest can exercise the real
 * middleware stack without opening a network port.
 */
function createApp() {
  const app = express();

  app.disable('x-powered-by');

  // Trust the first proxy hop so req.protocol / req.host reflect the public URL
  // when the app runs behind Render, Railway, Fly or nginx.
  app.set('trust proxy', 1);

  // CORS policy:
  //   * no Origin header  -> allow (curl, Supertest, health checks, same-origin GET)
  //   * origin in CLIENT_ORIGIN -> allow (separate frontend origin, e.g. the Vite dev server)
  //   * origin host equals this request's host -> allow (the SPA served from this
  //     same process; does not need CORS, but keeps proxied deployments clean)
  //   * anything else -> no CORS headers, so a foreign site cannot read responses
  app.use(
    cors((req, callback) => {
      const origin = req.header('Origin');
      let isSameHost = false;

      if (origin) {
        try {
          isSameHost = new URL(origin).host === req.get('host');
        } catch {
          isSameHost = false;
        }
      }

      const allowed = !origin || config.clientOrigins.includes(origin) || isSameHost;

      callback(null, {
        origin: allowed,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
        maxAge: 600,
      });
    }),
  );

  app.use(express.json({ limit: config.jsonBodyLimit }));

  if (!config.isTest) {
    app.use(morgan(config.isProduction ? 'combined' : 'dev'));
  }

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        uptime: Math.round(process.uptime()),
        environment: config.env,
        servesClient: fs.existsSync(path.join(config.clientDist, 'index.html')),
      },
    });
  });

  app.get('/api/meta', (req, res) => {
    res.status(200).json({
      success: true,
      data: { departments: DEPARTMENTS, leaveTypes: LEAVE_TYPES, statuses: LEAVE_STATUSES },
    });
  });

  app.use('/api/employees', employeeRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/reports', reportRoutes);

  mountClient(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
