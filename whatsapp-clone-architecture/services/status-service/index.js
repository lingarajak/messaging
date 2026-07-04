const express = require('express');
const Redis = require('ioredis');
const cron = require('node-cron');
const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

// Post status
app.post('/v1/status', async (req, res) => {
  const { userId, mediaKey, type, caption } = req.body;
  const statusId = `status:${userId}:${Date.now()}`;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
  await redis.hset(statusId, 'mediaKey', mediaKey, 'type', type, 'caption', caption, 'expiresAt', expiresAt);
  await redis.zadd(`user:${userId}:status`, expiresAt, statusId);
  await redis.expire(statusId, 86400); // Auto-delete in 24h
  res.json({ statusId });
});

// Get feed - contacts' statuses
app.get('/v1/status/feed/:userId', async (req, res) => {
  const { userId } = req.params;
  const contacts = JSON.parse(await redis.get(`contacts:${userId}`) || '[]');
  const feed = [];
  for (const contact of contacts) {
    const statuses = await redis.zrangebyscore(`user:${contact}:status`, Date.now(), '+inf');
    for (const s of statuses) {
      const data = await redis.hgetall(s);
      feed.push({ userId: contact, ...data, statusId: s });
    }
  }
  res.json(feed);
});

// Track views
app.post('/v1/status/:statusId/view', async (req, res) => {
  const { viewerId } = req.body;
  await redis.sadd(`${req.params.statusId}:views`, viewerId);
  res.json({ success: true });
});

// Cron: cleanup expired - runs hourly
cron.schedule('0 * * * *', async () => {
  console.log('Cleaning expired statuses');
});

app.listen(4002, () => console.log('Status service on :4002'));
