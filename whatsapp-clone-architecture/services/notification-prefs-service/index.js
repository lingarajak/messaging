// Notification Prefs Service - V10.3
const express = require('express');
const app = express();
app.put('/v1/folders/:folderId/notify', (req, res) => {
  // Set per-folder rules: muted, always, digest, schedule
  res.json({ folderId: req.params.folderId, rules: req.body });
});
app.get('/v1/users/:userId/folders', (req, res) => {
  // Get all folder notification prefs
  res.json({ folders: [{ id: 'work', rule: 'muted_9to5' }] });
});
app.listen(4021, () => console.log('notification-prefs-service :4021'));