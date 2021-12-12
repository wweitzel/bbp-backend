const { getRequest, postRequest, createSignedCookie } = require('./scriptUtils');
require('dotenv').config();

// Set this is the .env file
const battleId = parseInt(process.env.BATTLE_ID, 10);

const submissionsUrl = `${process.env.API_BASE_URL}/api/v1/battles/${battleId}/submissions`;
const usersUrl = `${process.env.API_BASE_URL}/api/v1/users`;
const twitchAccessTokenCookie = createSignedCookie('twitch_access_token', 'accesstoken');

function createVote(userId) {
  return {
    voterId: userId
  };
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function voteRandomly(submitterId) {
  const url = `${submissionsUrl}/${submitterId}/votes`;
  const voteCount = random(1, 40);

  const users = await getRequest(usersUrl, twitchAccessTokenCookie);

  for (let i = 0; i < voteCount; i++) {
    const voter = users[Math.floor(Math.random() * users.length)];
    const twitchUserIdCookie = createSignedCookie('twitch_user_id', voter.twitchUserId);

    const vote = await postRequest(
      url,
      createVote((voter.twitchUserId).toString()),
      twitchAccessTokenCookie + twitchUserIdCookie
    );
    console.log(vote);
  }
}

async function main() {
  const submissions = await getRequest(submissionsUrl, twitchAccessTokenCookie);

  submissions.forEach(async (submission) => {
    await voteRandomly(submission.submitterId);
  });
}

main();
