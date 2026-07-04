// Communities Service - V10.1
const express = require('express');
const app = express();
app.post('/v1/communities', (req, res) => {
  // Create Community with announcement channel + groups
  res.json({ communityId: 'comm_' + Date.now(), groups: [] });
});
app.listen(4015, () => console.log('communities-service :4015'));