'use strict';

/** Answers every unmatched route with a consistent 404 JSON body. */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
}

module.exports = notFound;
