const express = require('express');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
app.use(express.json());

// Create Poll/Quiz
app.post('/v1/polls', async (req, res) => {
  const { question, options, chatId, isQuiz, correctAnswer } = req.body;
  const pollId = `poll:${uuidv4()}`;
  await redis.hset(pollId, 'question', question, 'options', JSON.stringify(options), 'chatId', chatId, 'isQuiz', isQuiz || false);
  if (isQuiz) await redis.hset(pollId, 'correctAnswer', correctAnswer);
  options.forEach((_, i) => redis.hset(`${pollId}:votes`, i, 0));
  res.json({ pollId });
});

// Vote
app.post('/v1/polls/:pollId/vote', async (req, res) => {
  const { optionIndex, userId } = req.body;
  const { pollId } = req.params;
  const voted = await redis.sismember(`${pollId}:voters`, userId);
  if (voted) return res.status(400).json({ error: 'Already voted' });
  
  await redis.hincrby(`${pollId}:votes`, optionIndex, 1);
  await redis.sadd(`${pollId}:voters`, userId);
  const votes = await redis.hgetall(`${pollId}:votes`);
  res.json({ votes });
});

// Get results
app.get('/v1/polls/:pollId', async (req, res) => {
  const poll = await redis.hgetall(req.params.pollId);
  const votes = await redis.hgetall(`${req.params.pollId}:votes`);
  res.json({ ...poll, votes });
});

app.listen(4008, () => console.log('Poll service on :4008'));
