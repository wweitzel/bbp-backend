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
    stack: (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') ? '🥞' : err.stack
  });
}

// TODO: This is not being called anywhere yet.
// Figure out which routes we want to check login for and add this to them.
async function ensureLoggedIn(req, res, next) {
  console.log(req.signedCookies.twitch_access_token);
  console.log(req.headers.twitch_access_token);
  if (req.signedCookies.twitch_access_token) {
    const user = await authUtils.validateToken(req.signedCookies.twitch_access_token);
    if (user.status === 401) {
      const response = await authUtils.refreshToken(req.signedCookies.twitch_refresh_token);
      if (response.status === 200) {
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
      } else {
        res.status(401);
        next(new Error('Un-Authorized: Invalid access/refresh token. Please login again.'));
      }
    }
  } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging') {
    if (req.headers.twitch_access_token) {
      const user = await authUtils.validateToken(req.headers.twitch_access_token);
      if (user.status === 401) {
        res.status(401);
        next(new Error('Un-Authorized: Invalid access token supplied in header. Refresh the token or login again.'));
      }
    } else {
      res.status(401);
      next(new Error('Un-Authorized: No access token provided.'));
    }
  } else {
    res.status(401);
    next(new Error('Un-Authorized: No access token provided.'));
  }
  next();
}

module.exports = {
  notFound,
  errorHandler,
  ensureLoggedIn
};
