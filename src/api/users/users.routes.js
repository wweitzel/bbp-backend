const express = require('express');

const fetch = require('node-fetch');
const User = require('./users.model');
const dbNames = require('../../constants/dbNames');
const authUtils = require('../../lib/authUtils');

const router = express.Router();

const fields = [
  dbNames.userColumns.twitchUserId,
  dbNames.userColumns.twtichUsername,
  dbNames.userColumns.streamer,
  dbNames.userColumns.createdAt
];

router.get('/', async (req, res, next) => {
  try {
    const users = await User.query()
      .select(fields)
      .where(dbNames.userColumns.deletedAt, null);
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.query()
      .select(fields)
      .where(dbNames.userColumns.twitchUserId, req.params.id)
      .andWhere(dbNames.userColumns.deletedAt, null);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/subscriptions', async (req, res, next) => {
  try {
    if (!req.signedCookies.twitch_access_token) {
      throw new Error('Must be logged (twtich_access_token cookie set) in to check subscriptions.');
    }

    const { streamerId } = req.query;
    if (!streamerId) {
      throw new Error('Must specify streamerId query param.');
    }

    const user = await authUtils.validateAndRefreshToken(req.signedCookies.twitch_access_token);

    const response = await fetch(`https://api.twitch.tv/helix/subscriptions/user?user_id=${user.user_id}&broadcaster_id=${streamerId}`, {
      headers: {
        Authorization: 'Bearer ' + user.twitchAccessToken,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      }
    });

    const json = await response.json();

    if (json.data) {
      return res.json(json.data[0]);
    }

    res.status(404);
    return res.json(json);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
