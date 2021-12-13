const fetch = require('node-fetch');

function logout(res) {
  res.clearCookie('twitch_access_token', { domain: process.env.COOKIE_DOMAIN });
  res.clearCookie('twitch_refresh_token', { domain: process.env.COOKIE_DOMAIN });
  res.clearCookie('streamer', { domain: process.env.COOKIE_DOMAIN });
  res.clearCookie('twitch_username', { domain: process.env.COOKIE_DOMAIN });
  res.clearCookie('twitch_user_id', { domain: process.env.COOKIE_DOMAIN });
}

async function refreshToken(access_token, refresh_token) {
  const r = await fetch('https://id.twitch.tv/oauth2/token'
    + '?grant_type=refresh_token'
    + '&access_token' + access_token
    + '&refresh_token=' + refresh_token
    + '&client_id=' + process.env.TWITCH_CLIENT_ID
    + '&client_secret=' + process.env.TWITCH_CLIENT_SECRET, { method: 'post' });
  return r.json();
}

async function validateToken(twitchAccessToken) {
  const r = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {
      Authorization: 'Bearer ' + twitchAccessToken
    }
  });
  return r.json();
}

async function validateAndRefreshToken(twitchAccessToken, twitchRefreshToken, res) {
  let user = await validateToken(twitchAccessToken);

  if (user.status === 401) {
    const response = await refreshToken(twitchAccessToken, twitchRefreshToken);
    if (response.access_token) {
      res.cookie('twitch_access_token', response.access_token, {
        httpOnly: true,
        secure: true,
        signed: true,
        domain: process.env.COOKIE_DOMAIN
      });

      res.cookie('twitch_refresh_token', response.refresh_token, {
        httpOnly: true,
        secure: true,
        signed: true,
        domain: process.env.COOKIE_DOMAIN
      });

      user = await validateToken(response.access_token);
      user.twitchAccessToken = response.access_token;
    } else {
      res.status(401);
      logout(res);
      throw new Error('Un-Authorized: Invalid access/refresh token. Please login again.');
    }
  } else {
    user.twitchAccessToken = twitchAccessToken;
  }

  return user;
}

function isStreamer(signedCookies) {
  return signedCookies.streamer === 'true';
}

function userIdEquals(signedCookies, otherUserId) {
  return signedCookies.twitch_user_id === otherUserId;
}

function validateLoggedIn(req, res) {
  if (!req.signedCookies.twitch_access_token) {
    res.status(401);
    throw new Error('Unauthorized. Please login.');
  }
}

module.exports = {
  validateAndRefreshToken,
  validateToken,
  refreshToken,
  isStreamer,
  userIdEquals,
  logout,
  validateLoggedIn
};
