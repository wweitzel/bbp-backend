const { getRequest, postRequest, createSignedCookie } = require('./scriptUtils');
require('dotenv').config();

// Set this in the .env file
const battleId = parseInt(process.env.BATTLE_ID, 10);
// How many submissions to create
const numSubmissions = 20;

const submissionUrl = `${process.env.API_BASE_URL}/api/v1/battles/${battleId}/submissions`;
const usersUrl = `${process.env.API_BASE_URL}/api/v1/users`;
const twitchAccessTokenCookie = createSignedCookie('twitch_access_token', 'accesstoken');

const songs = [
  'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-silk',
  'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3',
  'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-4',
  'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-5',
  'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-6',
  'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-7',
  'https://soundcloud.com/freenationals/obituaries-instrumental?in=freenationals/sets/free-nationals-instrumentals',
  'https://soundcloud.com/freenationals/beauty-essex-instrumental?in=freenationals/sets/free-nationals-instrumentals',
  'https://soundcloud.com/freenationals/on-sight-instrumental?in=freenationals/sets/free-nationals-instrumentals',
  'https://soundcloud.com/freenationals/shibuya-instrumental?in=freenationals/sets/free-nationals-instrumentals'
];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomSong() {
  return songs[random(0, songs.length - 1)];
}

function createSubmission(userId) {
  return {
    battleId,
    submitterId: userId,
    soundcloudLink: getRandomSong()
  };
}

async function main() {
  const users = await getRequest(usersUrl, twitchAccessTokenCookie);

  for (let i = 0; i < numSubmissions; i++) {
    const user = users[random(0, users.length - 1)];
    const twitchUserIdCookie = createSignedCookie('twitch_user_id', user.twitchUserId);
    const submission = await postRequest(
      submissionUrl,
      createSubmission((user.twitchUserId).toString()),
      twitchUserIdCookie + twitchAccessTokenCookie
    );
    console.log(submission);
  }
}

main();
