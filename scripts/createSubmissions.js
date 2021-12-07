const { getRequest, postRequest } = require('./scriptUtils');
require('dotenv').config();

// Set this in the .env file
const battleId = parseInt(process.env.BATTLE_ID, 10);

const submissionUrl = `http://localhost:5000/api/v1/battles/${battleId}/submissions`;
const usersUrl = 'http://localhost:5000/api/v1/users';

function createSubmission(userId) {
  return {
    battleId,
    submitterId: userId,
    soundcloudLink: 'https://soundcloud.com/idles/the-new-sensation'
  };
}

async function main() {
  const users = await getRequest(usersUrl);
  console.log(users.length);

  users.forEach(async (user) => {
    const submission = await postRequest(
      submissionUrl,
      createSubmission((user.twitchUserId).toString())
    );
    console.log(submission);
  });
}

main();
