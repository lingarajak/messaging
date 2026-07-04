// Catalog Service -> Albums Service - V10.7 Updated
const express = require('express');
const app = express();
app.use(express.json());

// V10.7: Shared Photo Albums
app.post('/v1/albums', async (req, res) => {
  const { title, chatId, userIds } = req.body;
  const albumId = 'al_' + Date.now();
  // Save to DB: albums table
  res.json({ albumId, title, link: `/album/${albumId}` });
});

app.post('/v1/albums/:albumId/photos', async (req, res) => {
  const { photoUrl, caption, addedBy } = req.body;
  // Save to DB: album_photos table, upload to MinIO
  // io.to(`album_${req.params.albumId}`).emit('album:photo:new', { photoUrl });
  res.json({ success: true, photoId: 'ph_' + Date.now() });
});

app.get('/v1/albums/:albumId', async (req, res) => {
  // Get album with all photos
  res.json({
    albumId: req.params.albumId,
    title: 'Vacation 2026',
    photos: [{ url: '...', caption: 'Beach', addedBy: 'u_1' }]
  });
});

app.listen(4009, () => console.log('albums-service :4009'));