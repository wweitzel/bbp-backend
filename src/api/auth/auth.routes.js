const express = require('express');

const fetch = require('node-fetch');
const authUtils = require('../../lib/authUtils');
const User = require('../users/users.model');
const dbNames = require('../../constants/dbNames');

const router = express.Router();

router.get('/authenticate', async (req, res) => {
  const response = await fetch('https://id.twitch.tv/oauth2/token'
    + '?client_id=' + process.env.TWITCH_CLIENT_ID
    + '&client_secret=' + process.env.TWITCH_CLIENT_SECRET
    + '&grant_type=authorization_code'
    + '&redirect_uri=' + process.env.TWITCH_REDIRECT_URL
    + '&code=' + req.query.code, { method: 'post' });

  const json = await response.json();
  const { access_token } = json;
  const { refresh_token } = json;

  let dbUser;

  if (access_token) {
    console.log('access token found');
    const user = await authUtils.validateToken(access_token);
    console.log('user', user);
    dbUser = await User.query()
      .where(dbNames.userColumns.twitchUserId, user.user_id)
      .andWhere(dbNames.userColumns.deletedAt, null)
      .first();
    if (!dbUser) {
      console.log('storing user');
      const u = {
        twitchUserId: user.user_id,
        twitchUsername: user.login,
        streamer: false
      };
      dbUser = await User.query()
        .insert(u)
        .returning('*');
    } else {
      // Sync our username with twitch username since it can change on twitch
      console.log('syncing db user');
      dbUser = await User.query()
        .findById(dbUser.twitchUserId)
        .patch({
          twitchUsername: user.login
        }).returning('*');
    }

    console.log('setting twtich access');
    res.cookie('twitch_access_token', access_token, {
      httpOnly: true,
      secure: true,
      signed: true
    });

    res.cookie('twitch_refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      signed: true
    });

    res.cookie('streamer', dbUser.streamer, {
      secure: true,
      signed: true
    });

    res.cookie('twitch_username', user.login, {
      secure: true,
      signed: true
    });

    res.cookie('twitch_user_id', user.user_id, {
      secure: true,
      signed: true
    });
  } else {
    console.error('Error logging in ', json);
  }

  res.redirect(process.env.FRONTEND_HOME_URL);
});

router.get('/validate', async (req, res, next) => {
  try {
    if (req.signedCookies.twitch_access_token) {
      await authUtils.validateAndRefreshToken(
        req.signedCookies.twitch_access_token, req.signedCookies.twitch_refresh_token, res
      );
      return res.json({ valid: true });
    }
    return res.json({ valid: false });
  } catch (error) {
    res.status(401);
    return next(error);
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('twitch_access_token');
  res.clearCookie('twitch_refresh_token');
  res.clearCookie('streamer');
  res.clearCookie('twitch_username');
  res.clearCookie('twitch_user_id');
  res.json({});
});

module.exports = router;
