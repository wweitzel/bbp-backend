const fetch = require('node-fetch');

async function getRequest(url) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      twitch_access_token: 'some jawn'
    }
  });
  return res.json();
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

module.exports = {
  getRequest,
  postRequest
};
