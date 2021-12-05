const fetch = require('node-fetch');
require('dotenv').config();

/**
 * This script needs envionrment variables to be set in a .env file in this directory.
 * See the env.sample for the variables that are required.
 */

// Change this to the name you want to check
const streamerName = 'chrispunsalan';

async function getUserIdFromName(name) {
  let accessToken;
  try {
    let tokens = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, { method: 'post' });
    tokens = await tokens.json();
    accessToken = tokens.access_token;
  } catch (error) {
    console.log(error);
  }

  const apiUrl = `https://api.twitch.tv/helix/users?login=${name}`;
  const response = await fetch(apiUrl, {
    headers: {
      'Client-Id': process.env.TWITCH_CLIENT_ID,
      Authorization: 'Bearer ' + accessToken
    }
  });
  return response.json();
}

async function main() {
  const res = await getUserIdFromName(streamerName);
  console.log(res);
}

main();
