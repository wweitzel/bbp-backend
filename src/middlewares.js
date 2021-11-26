const authUtils = require('./lib/authUtils');

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    status: statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}

// TODO: This is not being called anywhere yet.
// Figure out which routes we want to check login for and add this to them.
async function ensureLoggedIn(req, res, next) {
  console.log(req.signedCookies.access_token);
  if (req.signedCookies.twitch_access_token) {
    const user = await authUtils.validateToken(req.signedCookies.twitch_access_token);
    if (user.status === 401) {
      const response = await authUtils.refreshToken(req.signedCookies.twitch_refresh_token);
      res.cookie('twitch_access_token', response.access_token, {
        httpOnly: true,
        secure: true,
        signed: true
      });

      res.cookie('twitch_refresh_token', response.refresh_token, {
        httpOnly: true,
        secure: true,
        signed: true
      });
    }
    next();
  } else {
    res.status(401);
    next(new Error('Un-Authorized: No access token provided.'));
  }
}

module.exports = {
  notFound,
  errorHandler,
  ensureLoggedIn
};
