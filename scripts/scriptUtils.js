const fetch = require('node-fetch');
const crypto = require('crypto');

async function getRequest(url, cookies) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      twitch_access_token: 'some jawn',
      Cookie: cookies
    }
  });
  return res.json();
}

async function postRequest(url, body, cookies) {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      twitch_access_token: 'some jawn',
      Cookie: cookies
    }
  });
  return res.json();
}

function createSignedCookie(key, val) {
  const secret = process.env.COOKIE_SECRET;

  const hash = crypto.createHmac('sha256', secret)
    .update(val)
    .digest('base64')
    .replace(/=+$/, '');

  const encoded = encodeURIComponent(`s:${val}.${hash}`);

  return `${key}=${encoded};`;
}

module.exports = {
  getRequest,
  postRequest,
  createSignedCookie
};
