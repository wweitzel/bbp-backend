const tableNames = {
  user: 'user',
  battle: 'battle',
  submission: 'battle_submission',
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

module.exports = {
  tableNames,
  orderedTableNames,
  userColumns,
  battleColumns,
  submissionColumns
};
