const express = require('express');

const fetch = require('node-fetch');
const User = require('../users/users.model');
const dbNames = require('../../constants/dbNames');

const router = express.Router();

async function validateToken(token) {
  const r = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  });
  return r.json();
}

router.get('/authenticate', async (req, res) => {
  const response = await fetch('https://id.twitch.tv/oauth2/token'
  + '?client_id=' + process.env.TWITCH_CLIENT_ID
  + '&client_secret=' + process.env.TWITCH_CLIENT_SECRET
  + '&grant_type=authorization_code'
  + '&redirect_uri=' + process.env.TWITCH_REDIRECT_URL
  + '&code=' + req.query.code, { method: 'post' });

  const json = await response.json();
  const { access_token } = json;

  if (access_token) {
    const user = await validateToken(access_token);
    const dbUser = await User.query()
      .where(dbNames.userColumns.twitchUserId, user.user_id)
      .andWhere(dbNames.userColumns.deletedAt, null)
      .first();
    if (!dbUser) {
      const u = {
        twitchUserId: user.user_id,
        twitchUsername: user.login,
        streamer: false
      };
      await User.query().insert(u);
    } else {
      // Sync our username with twitch username since it can change on twitch
      await User.query()
        .findById(dbUser.twitchUserId)
        .patch({
          twitchUsername: user.login
        });
    }
  }

  res.redirect(process.env.FRONTEND_HOME_URL + '?access_token=' + access_token);
});

module.exports = router;