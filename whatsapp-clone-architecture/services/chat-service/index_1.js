const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const { Kafka } = require('kafkajs');
const { SignalProtocolAddress, SessionBuilder, SessionCipher } = require('libsignal-protocol');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const producer = kafka.producer();
const s3 = new AWS.S3({
  endpoint: 'http://localhost:9000',
  accessKeyId: 'minioadmin',
  secretAccessKey: 'minioadmin',
  s3ForcePathStyle: true
});

app.use(express.json());

// E2EE: Store user prekeys
app.post('/v1/keys', async (req, res) => {
  const { userId, identityKey, preKeys } = req.body;
  await redis.hset(`keys:${userId}`, 'identityKey', identityKey);
  await redis.hset(`keys:${userId}`, 'preKeys', JSON.stringify(preKeys));
  res.json({ success: true });
});

// Media upload: pre-signed URL
app.post('/v1/media/upload-url', async (req, res) => {
  const { filename, contentType } = req.body;
  const key = `uploads/${uuidv4()}-${filename}`;
  const url = s3.getSignedUrl('putObject', {
    Bucket: 'whatsapp-media',
    Key: key,
    ContentType: contentType,
    Expires: 300
  });
  res.json({ url, key });
});

// Group management
app.post('/v1/groups', async (req, res) => {
  const { name, members } = req.body;
  const groupId = uuidv4();
  await redis.hset(`group:${groupId}`, 'name', name, 'members', JSON.stringify(members));
  for (const member of members) {
    await redis.sadd(`user:${member}:groups`, groupId);
  }
  res.json({ groupId });
});

io.on('connection', async (socket) => {
  const userId = socket.handshake.auth.userId;
  await redis.hset('online_users', userId, socket.id);
  await redis.setex(`presence:${userId}`, 30, 'online');

  socket.on('message:send', async (data) => {
    const { to, ciphertext, msgId, isGroup } = data;
    await producer.send({
      topic: 'messages',
      messages: [{ key: to, value: JSON.stringify({ from: userId, ...data }) }]
    });
    
    if (isGroup) {
      const members = JSON.parse(await redis.hget(`group:${to}`, 'members'));
      for (const member of members) {
        if (member === userId) continue;
        const sock = await redis.hget('online_users', member);
        if (sock) io.to(sock).emit('message:receive', { from: userId, groupId: to, ciphertext, msgId });
      }
    } else {
      const recipientSocket = await redis.hget('online_users', to);
      if (recipientSocket) io.to(recipientSocket).emit('message:receive', { from: userId, ciphertext, msgId });
    }
  });

  socket.on('typing', async ({ to, isGroup }) => {
    if (isGroup) {
      const members = JSON.parse(await redis.hget(`group:${to}`, 'members'));
      members.forEach(async (m) => {
        const sock = await redis.hget('online_users', m);
        if (sock && m !== userId) io.to(sock).emit('typing', { from: userId, groupId: to });
      });
    } else {
      const sock = await redis.hget('online_users', to);
      if (sock) io.to(sock).emit('typing', { from: userId });
    }
  });

  
  // WebRTC Signaling
  socket.on('call:user', async ({ to, offer }) => {
    const recipientSocket = await redis.hget('online_users', to);
    if (recipientSocket) io.to(recipientSocket).emit('call:incoming', { from: userId, offer });
  });
  
  socket.on('call:answer', async ({ to, answer }) => {
    const recipientSocket = await redis.hget('online_users', to);
    if (recipientSocket) io.to(recipientSocket).emit('call:answered', { from: userId, answer });
  });
  
  socket.on('call:ice-candidate', async ({ to, candidate }) => {
    const recipientSocket = await redis.hget('online_users', to);
    if (recipientSocket) io.to(recipientSocket).emit('call:ice-candidate', { from: userId, candidate });
  });

  socket.on('disconnect', async () => {
    await redis.hdel('online_users', userId);
    await redis.del(`presence:${userId}`);
  });
});

server.listen(4000, async () => {
  await producer.connect();
  console.log('Chat service with E2EE + Groups + Media running on :4000');
});
