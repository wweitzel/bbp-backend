const fetch = require('node-fetch');

// Set to battle id you created
const battleId = 34;

const apiUrl = `http://localhost:5000/api/v1/battles/${battleId}/submissions`;

function createSubmission(userId) {
  return {
    battleId,
    submitterId: userId,
    soundcloudLink: 'https://soundcloud.com/idles/the-new-sensation'
  };
}

async function postRequest(body) {
  const res = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      twitch_access_token: 'some jawn'
    }
  });
  return res.json();
}

async function main() {
  for (let i = 0; i < 10; i++) {
    const submission = await postRequest(createSubmission((i + 1).toString()));
    console.log(submission);
  }
}

main();
