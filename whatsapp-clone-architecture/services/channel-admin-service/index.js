// Channel Admin Service - V10.4
const express = require('express');
const app = express();
app.post('/v1/channels/:channelId/post-anon', (req, res) => {
  // Post as Channel identity, hide admin userId
  res.json({ messageId: 'msg_' + Date.now(), author: 'Channel', anonymous: true });
});
app.put('/v1/channels/:channelId/admin-mode', (req, res) => {
  // Set default: always post anonymously
  res.json({ anonymousDefault: req.body.enabled });
});
app.listen(4022, () => console.log('channel-admin-service :4022'));