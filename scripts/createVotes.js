const { getRequest, postRequest } = require('./scriptUtils');

// Set to battle id you created
const battleId = 7;

const submissionsUrl = `http://localhost:5000/api/v1/battles/${battleId}/submissions`;
const usersUrl = 'http://localhost:5000/api/v1/users';

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
  const voteCount = random(1, 10);

  const users = await getRequest(usersUrl);

  for (let i = 0; i < voteCount; i++) {
    const voter = users[Math.floor(Math.random() * users.length)];
    const vote = await postRequest(url, createVote((voter.twitchUserId).toString()));
    console.log(vote);
  }
}

async function main() {
  const submissions = await getRequest(submissionsUrl);

  submissions.forEach(async (submission) => {
    await voteRandomly(submission.submitterId);
  });
}

main();
