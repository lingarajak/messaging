// Channel Comments Service - V10.2
const express = require('express');
const app = express();
app.post('/v1/channels/:channelId/posts/:postId/comments', (req, res) => {
  // Add threaded comment to channel post
  res.json({ commentId: 'c_' + Date.now(), thread: [] });
});
app.get('/v1/channels/:channelId/posts/:postId/comments', (req, res) => {
  // Get comment thread
  res.json({ comments: [], count: 0 });
});
app.listen(4019, () => console.log('channel-comments-service :4019'));