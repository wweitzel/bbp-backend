const fetch = require('node-fetch');

module.exports = {
  async validateToken(token) {
    const r = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });
    return r.json();
  }
};
