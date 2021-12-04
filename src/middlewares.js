const authUtils = require('./lib/authUtils');

// Helper function to get the user and set username and userId to be logged by morgan
// eslint-disable-next-line no-unused-vars
async function getUser(req) {
  const user = await authUtils.validateToken(req.headers.twitch_access_token);
  req.username = user.login;
  req.userId = user.user_id;
  return user;
}

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    status: statusCode,
    message: err.message,
    stack: (process.env.NODE_ENV === 'production') ? '🥞' : err.stack
  });
}

async function ensureLoggedIn(req, res, next) {
  if (process.env.ALLOW_TOKEN_IN_HEADER === 'false' && !req.signedCookies.twitch_access_token) {
    res.status(401);
    next(new Error('Un-Authorized: Invalid access/refresh token. Please login again.'));
  }

  if (process.env.ALLOW_TOKEN_IN_HEADER === 'true' && !req.headers.twitch_access_token) {
    res.status(401);
    next(new Error('Dev mode Un-Authorized: Please add a twitch_access_token to localstorage.'));
  }

  next();
}

module.exports = {
  notFound,
  errorHandler,
  ensureLoggedIn
};
