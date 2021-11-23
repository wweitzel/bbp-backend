const express = require('express');

const dbNames = require('../../constants/dbNames');
const Game = require('./brackets.model');
const User = require('../users/users.model');

const router = express.Router({ mergeParams: true });

const gameFields = [
  dbNames.gameColumns.id,
  dbNames.gameColumns.battleId,
  dbNames.gameColumns.bracketType,
  dbNames.gameColumns.roundNumber,
  dbNames.gameColumns.playerOneUserId,
  dbNames.gameColumns.playerTwoUserId,
  dbNames.gameColumns.playerOneParentGameId,
  dbNames.gameColumns.playerTwoParentGameId,
  dbNames.gameColumns.playerOneScore,
  dbNames.gameColumns.playerTwoScore
];

router.get('/', async (req, res) => {
  const games = await Game.query()
    .select(gameFields)
    .where(dbNames.gameColumns.battleId, req.params.battle_id)
    .andWhere(dbNames.gameColumns.bracketType, 'WINNERS')
    .andWhere(dbNames.gameColumns.deletedAt, null);

  const roundsToGames = new Map();

  const userIds = new Set();
  games.forEach((game) => {
    if (!roundsToGames.has(game.roundNumber)) {
      roundsToGames.set(game.roundNumber, []);
    }
    roundsToGames.get(game.roundNumber).push(game);
    if (game.playerOneUserId) {
      userIds.add(game.playerOneUserId);
    }
    if (game.playerTwoUserId) {
      userIds.add(game.playerTwoUserId);
    }
  });

  const users = await User.query()
    .select(dbNames.userColumns.twitchUserId, dbNames.userColumns.twtichUsername)
    .whereIn(dbNames.userColumns.twitchUserId, Array.from(userIds))
    .andWhere(dbNames.userColumns.deletedAt, null);

  const idToUser = new Map();
  users.forEach((user) => {
    idToUser.set(user.twitchUserId, user);
  });

  games.forEach((game) => {
    if (game.playerOneUserId) {
      game.playerOneUsername = idToUser.get(game.playerOneUserId).twitchUsername;
    }
    if (game.playerTwoUserId) {
      game.playerTwoUsername = idToUser.get(game.playerTwoUserId).twitchUsername;
    }
  });

  const brackets = [];

  brackets.push({
    battleId: req.params.battle_id,
    bracketType: 'WINNERS',
    rounds: Object.fromEntries(roundsToGames)
  });
  brackets.push({
    battleId: req.params.battle_id,
    bracketType: 'LOSERS'
  });

  res.json(brackets);
});

module.exports = router;
