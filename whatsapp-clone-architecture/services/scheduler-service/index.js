const express = require('express');
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const queue = new Queue('scheduled-messages', { connection: redis });

app.use(express.json());

// Schedule message
app.post('/v1/schedule', async (req, res) => {
  const { to, message, sendAt, userId } = req.body;
  const delay = new Date(sendAt).getTime() - Date.now();
  if (delay < 0) return res.status(400).json({ error: 'Time in past' });
  
  const job = await queue.add('send', { to, message, userId }, { delay });
  res.json({ jobId: job.id, scheduledFor: sendAt });
});

// Worker processes scheduled jobs
const worker = new Worker('scheduled-messages', async job => {
  const { to, message, userId } = job.data;
  // Call chat-service API to send
  await fetch('http://chat-service:4000/internal/send', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ to, message, from: userId, scheduled: true })
  });
}, { connection: redis });

app.listen(4003, () => console.log('Scheduler on :4003'));
