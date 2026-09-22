const crypto = require('crypto');

module.exports = async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = 'https://vertex-flux.vercel.app/api/google/callback';
  if (!clientId) return res.status(500).send('GOOGLE_CLIENT_ID eksik.');
  const state = crypto.randomBytes(24).toString('hex');
  res.setHeader('Set-Cookie', `vertex_google_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  const q = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/adwords',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state
  });
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + q.toString());
};
