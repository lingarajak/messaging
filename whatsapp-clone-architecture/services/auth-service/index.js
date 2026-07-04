// Auth Service - V10.2
const express = require('express');
const app = express();
app.post('/v1/auth/username', (req, res) => {
  // Claim @username, check uniqueness
  res.json({ username: '@' + req.body.handle, userId: 'u_123' });
});
app.get('/v1/users/:handle', (req, res) => {
  // Lookup by @username or phone
  res.json({ userId: 'u_123', username: '@handle', phoneHidden: true });
});
app.listen(4018, () => console.log('auth-service :4018'));