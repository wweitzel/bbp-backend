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
  if (process.env.NODE_ENV !== 'test' && res.statusCode !== 404) {
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

module.exports = {
  notFound,
  errorHandler
};
