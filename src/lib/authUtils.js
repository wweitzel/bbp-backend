const fetch = require('node-fetch');

async function validateToken(token) {
  const r = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  });
  return r.json();
}

async function refreshToken(refresh_token) {
  const r = await fetch('https://id.twitch.tv/oauth2/token'
    + '?grant_type=refresh_token'
    + '&refresh_token=' + refresh_token
    + '&client_id=' + process.env.TWITCH_CLIENT_ID
    + '&client_secret=' + process.env.TWITCH_CLIENT_SECRET, { method: 'post' });
  return r.json();
}

module.exports = {
  validateToken,
  refreshToken
};
