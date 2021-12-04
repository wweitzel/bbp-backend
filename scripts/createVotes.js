const fetch = require('node-fetch');

// Set to battle id you created
const battleId = 34;

const apiUrl = `http://localhost:5000/api/v1/battles/${battleId}/submissions`;

function createVote(userId) {
  return {
    voterId: userId
  };
}

async function postRequest(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      twitch_access_token: 'some jawn'
    }
  });
  return res.json();
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function voteRandomly(submitterId) {
  const url = `${apiUrl}/${submitterId}/votes`;
  const voteCount = random(1, 10);
  for (let i = 0; i < voteCount; i++) {
    const voterId = random(1, 10);
    const vote = await postRequest(url, createVote((voterId).toString()));
    console.log(vote);
  }
}

async function main() {
  // Loop through each submission and give it a random number of votes
  for (let i = 0; i < 10; i++) {
    await voteRandomly((i + 1).toString());
  }
}

main();
