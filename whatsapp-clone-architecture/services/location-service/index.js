const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());

// Start live location share
app.post('/v1/location/share', async (req, res) => {
  const { userId, chatId, duration } = req.body; // duration in minutes
  const expiresAt = Date.now() + duration * 60 * 1000;
  await redis.hset(`live:${userId}:${chatId}`, 'expiresAt', expiresAt, 'active', 'true');
  await redis.expire(`live:${userId}:${chatId}`, duration * 60);
  res.json({ shareId: `${userId}:${chatId}`, expiresAt });
});

io.on('connection', (socket) => {
  socket.on('location:update', async ({ userId, chatId, lat, lng }) => {
    const key = `live:${userId}:${chatId}`;
    const active = await redis.hget(key, 'active');
    if (active !== 'true') return;
    
    await redis.hset(key, 'lat', lat, 'lng', lng, 'updatedAt', Date.now());
    await redis.publish(`location:${chatId}`, JSON.stringify({ userId, lat, lng }));
    io.to(chatId).emit('location:update', { userId, lat, lng });
  });
  
  socket.on('location:stop', async ({ userId, chatId }) => {
    await redis.hdel(`live:${userId}:${chatId}`, 'active');
    io.to(chatId).emit('location:stopped', { userId });
  });
});

server.listen(4006, () => console.log('Location service on :4006'));
