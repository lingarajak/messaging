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

// Reply to story
app.post('/v1/status/:statusId/reply', async (req, res) => {
  const { from, text, reaction } = req.body;
  const replyId = `reply:${req.params.statusId}:${Date.now()}`;
  await redis.hset(replyId, 'from', from, 'text', text || '', 'reaction', reaction || '', 'timestamp', Date.now());
  await redis.zadd(`${req.params.statusId}:replies`, Date.now(), replyId);
  
  // Notify status owner
  const owner = req.params.statusId.split(':')[1];
  await fetch('http://chat-service:4000/internal/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      to: owner,
      from: from,
      type: 'story_reply',
      text: text,
      reaction: reaction,
      storyId: req.params.statusId
    })
  });
  res.json({ replyId });
});

// Get story replies
app.get('/v1/status/:statusId/replies', async (req, res) => {
  const replyIds = await redis.zrange(`${req.params.statusId}:replies`, 0, -1);
  const replies = [];
  for (const id of replyIds) {
    replies.push(await redis.hgetall(id));
  }
  res.json(replies);
});
