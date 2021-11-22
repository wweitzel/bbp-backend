const express = require('express');

const fetch = require('node-fetch');
const apiKeys = require('../../../api-keys/keys');
const auth = require('./auth.queries');
const User = require('../users/users.model');

const router = express.Router();

router.get('/authenticate', async (req, res) => {
  const response = await fetch('https://id.twitch.tv/oauth2/token'
  + '?client_id=' + apiKeys.TWITCH_CLIENT_ID
  + '&client_secret=' + apiKeys.TWITCH_CLIENT_SECRET
  + '&grant_type=authorization_code'
  + '&redirect_uri=http://localhost:5000/api/v1/auth/authenticate'
  + '&code=' + req.query.code, { method: 'post' });

  const json = await response.json();
  const { access_token } = json;

  if (access_token) {
    const user = await auth.validateToken(access_token);
    const dbUser = await User.query()
      .where('twitch_user_id', user.user_id)
      .first();
    if (!dbUser) {
      const u = {
        twitch_user_id: user.user_id,
        twitch_username: user.login,
        streamer: false
      };
      await User.query().insert(u);
    }
  }

  res.redirect('http://localhost:3000/?access_token=' + access_token);
});

module.exports = router;
