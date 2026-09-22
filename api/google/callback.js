const crypto = require('crypto');

function cookie(req, name) {
  const raw = req.headers.cookie || '';
  const item = raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));
  return item ? decodeURIComponent(item.slice(name.length+1)) : '';
}
function seal(value, secret) {
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv,tag,encrypted]).toString('base64url');
}

module.exports = async function handler(req, res) {
  const { code, state, error } = req.query || {};
  if (error) return res.status(400).send('Google bağlantısı reddedildi: ' + String(error));
  if (!code || !state || state !== cookie(req, 'vertex_google_state')) return res.status(400).send('Geçersiz OAuth isteği.');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return res.status(500).send('Google OAuth ortam değişkenleri eksik.');
  const redirectUri = 'https://vertex-flux.vercel.app/api/google/callback';
  const body = new URLSearchParams({code,client_id:clientId,client_secret:clientSecret,redirect_uri:redirectUri,grant_type:'authorization_code'});
  const r = await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  const token = await r.json();
  if (!r.ok) return res.status(400).send('Google token alınamadı: ' + String(token.error_description || token.error || 'bilinmeyen hata'));
  if (!token.refresh_token) return res.status(400).send('Google yenileme anahtarı dönmedi. Erişimi kaldırıp yeniden bağlayın.');
  const sealed = seal(token.refresh_token, clientSecret);
  res.setHeader('Set-Cookie',[
    'vertex_google_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    `vertex_google_refresh=${sealed}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
  ]);
  return res.redirect('/?google=connected');
};
