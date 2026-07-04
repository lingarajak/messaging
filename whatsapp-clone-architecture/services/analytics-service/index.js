// Analytics Service - V10.1
const express = require('express');
const app = express();
app.get('/v1/analytics/channel/:id', (req, res) => {
  // Query Postgres for views, reach, growth
  res.json({ views: 45231, reach: 12503, growth: '+12%', bestTime: '18:00 UTC' });
});
app.listen(4014, () => console.log('analytics-service :4014'));