const express = require('express');
const OpenAI = require('openai');
const { TranscribeClient, StartTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const Redis = require('ioredis');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const transcribe = new TranscribeClient({ region: 'us-east-1' });

app.use(express.json());

// Chat Summary
app.post('/v1/ai/summarize', async (req, res) => {
  const { chatId, limit = 100 } = req.body;
  const messages = await redis.lrange(`chat:${chatId}:history`, 0, limit);
  const text = messages.map(m => JSON.parse(m).text).join('\n');
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: 'Summarize this chat in 3 bullet points' }, { role: 'user', content: text }],
    max_tokens: 200
  });
  res.json({ summary: completion.choices[0].message.content });
});

// Voice Note Transcription
app.post('/v1/ai/transcribe', async (req, res) => {
  const { s3Key, msgId } = req.body;
  const job = await transcribe.send(new StartTranscriptionJobCommand({
    TranscriptionJobName: `voice-${msgId}`,
    Media: { MediaFileUri: `s3://whatsapp-media/${s3Key}` },
    MediaFormat: 'webm',
    LanguageCode: 'en-US',
    OutputBucketName: 'whatsapp-media'
  }));
  
  // Poll job status - simplified
  await redis.hset(`msg:${msgId}`, 'transcription', 'Transcribing...');
  res.json({ jobName: job.TranscriptionJobName });
});

app.listen(4007, () => console.log('AI service on :4007'));
