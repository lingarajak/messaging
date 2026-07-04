// Highlights Service - V10.4
const express = require('express');
const app = express();
app.post('/v1/highlights', (req, res) => {
  // Create Highlight collection from Stories
  res.json({ highlightId: 'hl_' + Date.now(), title: req.body.title, stories: req.body.storyIds });
});
app.get('/v1/users/:userId/highlights', (req, res) => {
  // Get user's Highlights for profile
  res.json({ highlights: [{ id: 'hl_1', title: 'Travel', cover: 'url', count: 12 }] });
});
app.listen(4023, () => console.log('highlights-service :4023'));