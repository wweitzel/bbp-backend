const tableNames = {
  user: 'user',
  battle: 'battle',
  submission: 'submission',
  bracket: 'bracket',
  match: 'match',
  participant: 'participant'
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
  name: 'name',
  votingEndTime: 'voting_end_time',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
};

const submissionColumns = {
  battleId: 'battle_id',
  submitterId: 'submitter_id',
  soundcloudLink: 'soundcloud_link',
  voteCount: 'vote_count',
  voteUsers: 'vote_users',
  rank: 'rank',
  submitterUsername: 'submitter_username',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
};

const bracketColumns = {
  id: 'id',
  battleId: 'battle_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
};

const matchColumns = {
  id: 'id',
  bracketId: 'bracket_id',
  nextMatchId: 'next_match_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
};

const participantColumns = {
  id: 'id',
  matchId: 'match_id',
  name: 'name',
  isWinner: 'is_winner',
  resultText: 'result_text',
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
  matchColumns,
  participantColumns
};
