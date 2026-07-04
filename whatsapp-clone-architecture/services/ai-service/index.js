const express = require('express');
const OpenAI = require('openai');
const Redis = require('ioredis');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

// Summarize chat
app.post('/v1/ai/summarize', async (req, res) => {
  const { chatId, limit = 100 } = req.body;
  const msgs = await redis.lrange(`chat:${chatId}:history`, -limit, -1);
  const text = msgs.map(m => JSON.parse(m).text).join('\n');
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Summarize this chat in 3 bullet points. Extract action items.' },
      { role: 'user', content: text }
    ]
  });
  
  res.json({ summary: completion.choices[0].message.content });
});

// Suggest reply
app.post('/v1/ai/suggest', async (req, res) => {
  const { chatId, lastMessage } = req.body;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Suggest 3 short replies to this message. Return JSON array.' },
      { role: 'user', content: lastMessage }
    ]
  });
  res.json({ suggestions: JSON.parse(completion.choices[0].message.content) });
});

app.listen(4007, () => console.log('AI service on :4007'));
