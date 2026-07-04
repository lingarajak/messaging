const express = require('express');
const { Translate } = require('@google-cloud/translate').v2;
const Redis = require('ioredis');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_KEY });

app.use(express.json());

// Translate message
app.post('/v1/translate', async (req, res) => {
  const { text, target, msgId } = req.body;
  const cacheKey = `translate:${msgId}:${target}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ translated: cached, cached: true });
  
  const [translation] = await translate.translate(text, target);
  await redis.setex(cacheKey, 86400, translation); // Cache 24h
  res.json({ translated: translation });
});

// Detect language
app.post('/v1/detect', async (req, res) => {
  const [detection] = await translate.detect(req.body.text);
  res.json({ language: detection.language, confidence: detection.confidence });
});

app.listen(4008, () => console.log('Translate service on :4008'));
