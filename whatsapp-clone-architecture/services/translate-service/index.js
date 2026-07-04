// Translate Service - V10.7 Updated
const express = require('express');
const { OpenAI } = require('openai');
const app = express();
app.use(express.json());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// V10: Message translation
app.post('/v1/translate', async (req, res) => {
  const { text, to, from } = req.body;
  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `Translate from ${from} to ${to}: ${text}` }]
  });
  res.json({ translated: result.choices[0].message.content });
});

// V10.7: Live call translation
app.post('/v1/calls/:callId/translate', async (req, res) => {
  const { text, from, to } = req.body;
  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `Translate call audio from ${from} to ${to}: ${text}` }]
  });
  res.json({ translated: result.choices[0].message.content });
});

app.listen(4011, () => console.log('translate-service :4011'));