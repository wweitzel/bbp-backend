const tableNames = {
  user: 'user',
  battle: 'battle',
  submission: 'battle_submission',
  bracket: 'bracket',
  game: 'game'
};

const orderedTableNames = {
  submission: 'submission',
  battle: 'battle',
  user: 'user',
};

const userColumns = {
  twitchUserId: 'twitch_user_id',
  twtichUsername: 'twitch_username',
  streamer: 'streamer',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

const battleColumns = {
  id: 'id',
  streamerId: 'streamer_id',
  endTime: 'end_time',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
};

const submissionColumns = {
  battleId: 'battle_id',
  submitterId: 'submitter_id',
  soundcloudLink: 'soundcloud_link',
  votes: 'votes',
  rank: 'rank',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
};

const bracketColumns = {
  id: 'id',
  battleId: 'battle_id',
  bracketType: 'bracket_type'
};

const gameColumns = {
  id: 'id',
  battleId: 'battle_id',
  bracketType: 'bracket_type',
  parentGameId: 'parent_game_id',
  roundNumber: 'round_number',
  playerOneUserId: 'player_one_user_id',
  playerTwoUserId: 'player_two_user_id',
  playerOneUsername: 'player_one_username',
  playerTwoUsername: 'player_two_username',
  playerOneScore: 'player_one_score',
  playerTwoScore: 'player_two_score',
  playerOneParentGameId: 'player_one_parent_game_id',
  playerTwoParentGameId: 'player_two_parent_game_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
};

module.exports = {
  tableNames,
  orderedTableNames,
  userColumns,
  battleColumns,
  submissionColumns,
  bracketColumns,
  gameColumns
};
