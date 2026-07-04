const express = require('express');
const { Telegraf } = require('telegraf');
const Redis = require('ioredis');
const axios = require('axios');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
app.use(express.json());

// Create bot
app.post('/v1/bots/create', async (req, res) => {
  const { name, token, webhook } = req.body;
  const botId = `bot:${Date.now()}`;
  await redis.hset(botId, 'name', name, 'token', token, 'webhook', webhook);
  await redis.sadd('bots', botId);
  res.json({ botId, username: `@${name}bot` });
});

// Webhook endpoint for bots
app.post('/v1/bot/:botId/webhook', async (req, res) => {
  const { botId } = req.params;
  const { message } = req.body;
  const bot = await redis.hgetall(botId);
  
  // Forward to bot's webhook
  if (bot.webhook) {
    await axios.post(bot.webhook, { message, botId });
  }
  res.json({ ok: true });
});

// Send message as bot
app.post('/v1/bot/:botId/send', async (req, res) => {
  const { to, text } = req.body;
  const bot = await redis.hgetall(req.params.botId);
  // Call chat-service to send
  await fetch('http://chat-service:4000/internal/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ to, message: text, from: bot.name, isBot: true })
  });
  res.json({ success: true });
});

app.listen(4004, () => console.log('Bot service on :4004'));
