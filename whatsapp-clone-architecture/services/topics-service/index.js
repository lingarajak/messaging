// Topics Service - V10.5
const express = require('express');
const app = express();
app.post('/v1/groups/:groupId/topics', (req, res) => {
  // Create topic in group like Discord channels
  res.json({ topicId: 't_' + Date.now(), name: req.body.name, unread: 0 });
});
app.get('/v1/groups/:groupId/topics', (req, res) => {
  // List topics with unread counts
  res.json({ topics: [{ id: 't_general', name: 'General', unread: 12 }] });
});
app.post('/v1/topics/:topicId/messages', (req, res) => {
  // Send message to specific topic
  res.json({ messageId: 'm_' + Date.now(), topicId: req.params.topicId });
});
app.listen(4025, () => console.log('topics-service :4025'));