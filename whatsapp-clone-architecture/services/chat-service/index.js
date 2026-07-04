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

  // Message Forwarding
  socket.on('message:forward', async ({ msgId, to, userId }) => {
    const original = await redis.hgetall(`msg:${msgId}`);
    if (!original.text && !original.mediaKey) return;
    const newMsgId = `msg:${Date.now()}`;
    const forwardData = { ...original, from: userId, to, msgId: newMsgId, forwarded: true, originalFrom: original.from };
    await redis.hset(`msg:${newMsgId}`, forwardData);
    await producer.send({ topic: 'messages', messages: [{ value: JSON.stringify(forwardData) }] });
    io.to(await redis.hget('online_users', to)).emit('message:receive', forwardData);
  });

  // Internal API for scheduler/bots
  app.post('/internal/send', async (req, res) => {
    const { to, message, from, scheduled, isBot } = req.body;
    const msgId = `msg:${Date.now()}`;
    await redis.hset(`msg:${msgId}`, 'from', from, 'to', to, 'text', message, 'timestamp', Date.now());
    const recipientSocket = await redis.hget('online_users', to);
    if (recipientSocket) io.to(recipientSocket).emit('message:receive', { from, message, msgId, scheduled, isBot });
    res.json({ msgId });
  });


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
    const { to, msgId } = data;
    const timer = await redis.hget(`chat:${to}:settings`, 'disappearingTimer');
    if (timer && parseInt(timer) > 0) {
      await redis.expire(`msg:${msgId}`, parseInt(timer));
      data.disappearingTimer = timer;
    }
    
    const { to, ciphertext, msgId, isGroup } = data;
    await redis.hset(`msg:${msgId}`, 'from', userId, 'text', message || '', 'to', to, 'timestamp', Date.now());
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

  
  // Reactions
  socket.on('reaction:add', async ({ msgId, emoji, userId }) => {
    const key = `msg:${msgId}:reactions`;
    await redis.hincrby(key, emoji, 1);
    await redis.sadd(`${key}:${emoji}:users`, userId);
    const reactions = await redis.hgetall(key);
    io.emit('reaction:update', { msgId, reactions });
  });

  
  // Edit Message
  socket.on('message:edit', async ({ msgId, newText, userId }) => {
    const author = await redis.hget(`msg:${msgId}`, 'from');
    if (author !== userId) return;
    await redis.hset(`msg:${msgId}`, 'text', newText, 'edited', 'true', 'editedAt', Date.now());
    io.emit('message:edited', { msgId, newText });
    await redis.hset(`msg:${msgId}`, 'from', userId, 'text', message || '', 'to', to, 'timestamp', Date.now());
    await producer.send({ topic: 'messages', messages: [{ value: JSON.stringify({ type: 'edit', msgId, newText }) }] });
  });

  // Delete Message
  socket.on('message:delete', async ({ msgId, userId, deleteForEveryone }) => {
    const author = await redis.hget(`msg:${msgId}`, 'from');
    if (deleteForEveryone && author !== userId) return;
    if (deleteForEveryone) {
      await redis.hset(`msg:${msgId}`, 'deleted', 'true', 'text', 'This message was deleted');
      io.emit('message:deleted', { msgId, forEveryone: true });
    } else {
      await redis.sadd(`msg:${msgId}:deletedFor`, userId);
      socket.emit('message:deleted', { msgId, forEveryone: false });
    }
  });

  // Pin Message
  socket.on('message:pin', async ({ chatId, msgId, userId, isGroup }) => {
    const key = isGroup ? `group:${chatId}:pinned` : `chat:${chatId}:pinned`;
    await redis.set(key, msgId);
    io.to(chatId).emit('message:pinned', { chatId, msgId });
  });

  // Create Channel/Supergroup
  socket.on('channel:create', async ({ name, description, isPublic, creatorId }) => {
    const channelId = `channel:${Date.now()}`;
    await redis.hset(channelId, 'name', name, 'desc', description, 'creator', creatorId, 'type', 'channel', 'members', JSON.stringify([creatorId]), 'admins', JSON.stringify([creatorId]));
    await redis.sadd(`user:${creatorId}:channels`, channelId);
    if (isPublic) await redis.sadd('public:channels', channelId);
    socket.emit('channel:created', { channelId });
  });

  // Join Channel
  socket.on('channel:join', async ({ channelId, userId }) => {
    const members = JSON.parse(await redis.hget(channelId, 'members') || '[]');
    members.push(userId);
    await redis.hset(channelId, 'members', JSON.stringify(members));
    await redis.sadd(`user:${userId}:channels`, channelId);
    socket.join(channelId);
    io.to(channelId).emit('channel:userJoined', { channelId, userId });
  });

  
  // Set disappearing timer for chat
  socket.on('chat:disappearing', async ({ chatId, timer, userId }) => {
    // timer: 0=off, 86400=24h, 604800=7d, 7776000=90d
    await redis.hset(`chat:${chatId}:settings`, 'disappearingTimer', timer, 'setBy', userId);
    io.to(chatId).emit('chat:disappearingUpdate', { chatId, timer });
  });

  // Override message:send to check disappearing
  const originalSend = socket.on('message:send', async (data) => {});

  
  socket.on('ai:summarize', async ({ chatId }) => {
    const res = await fetch('http://ai-service:4007/v1/ai/summarize', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ chatId })
    });
    const { summary } = await res.json();
    socket.emit('ai:summary', { chatId, summary });
  });

  socket.on('poll:create', async ({ question, options, chatId, isQuiz, correctAnswer }) => {
    const res = await fetch('http://poll-service:4008/v1/polls', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ question, options, chatId, isQuiz, correctAnswer })
    });
    const { pollId } = await res.json();
    io.to(chatId).emit('message:receive', { type: 'poll', pollId, from: userId, msgId: `msg:${Date.now()}` });
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
