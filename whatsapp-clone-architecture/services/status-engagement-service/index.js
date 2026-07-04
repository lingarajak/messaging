// Status Engagement Service - V10.3
const express = require('express');
const app = express();
app.post('/v1/stories/:storyId/react', (req, res) => {
  // Store emoji reaction, send DM to author with Story context
  res.json({ reactionId: 'r_' + Date.now(), emoji: req.body.emoji, sent: true });
});
app.post('/v1/stories/:storyId/reply', (req, res) => {
  // Send DM reply to Story author
  res.json({ messageId: 'm_' + Date.now(), delivered: true });
});
app.listen(4020, () => console.log('status-engagement-service :4020'));