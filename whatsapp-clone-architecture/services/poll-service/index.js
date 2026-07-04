const express = require('express');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
app.use(express.json());

// Create Poll or Quiz
app.post('/v1/polls', async (req, res) => {
  const { question, options, chatId, isQuiz, correctAnswer, multipleChoice, anonymous } = req.body;
  const pollId = `poll:${uuidv4()}`;
  await redis.hset(pollId, 
    'question', question, 
    'options', JSON.stringify(options), 
    'chatId', chatId, 
    'isQuiz', isQuiz || false,
    'multipleChoice', multipleChoice || false,
    'anonymous', anonymous || false,
    'createdAt', Date.now()
  );
  if (isQuiz && correctAnswer !== undefined) {
    await redis.hset(pollId, 'correctAnswer', correctAnswer);
  }
  options.forEach((_, i) => redis.hset(`${pollId}:votes`, i, 0));
  await redis.expire(pollId, 2592000); // 30 days
  res.json({ pollId });
});

// Vote in Poll
app.post('/v1/polls/:pollId/vote', async (req, res) => {
  const { optionIndex, userId } = req.body;
  const { pollId } = req.params;
  
  const multipleChoice = await redis.hget(pollId, 'multipleChoice');
  const voted = await redis.sismember(`${pollId}:voters`, userId);
  
  if (voted && multipleChoice !== 'true') {
    return res.status(400).json({ error: 'Already voted' });
  }
  
  // Remove previous vote if changing vote
  if (voted && multipleChoice !== 'true') {
    const prevVote = await redis.hget(`${pollId}:user:${userId}`, 'vote');
    if (prevVote) await redis.hincrby(`${pollId}:votes`, prevVote, -1);
  }
  
  await redis.hincrby(`${pollId}:votes`, optionIndex, 1);
  await redis.sadd(`${pollId}:voters`, userId);
  await redis.hset(`${pollId}:user:${userId}`, 'vote', optionIndex);
  
  const votes = await redis.hgetall(`${pollId}:votes`);
  const totalVoters = await redis.scard(`${pollId}:voters`);
  res.json({ votes, totalVoters });
});

// Get poll results
app.get('/v1/polls/:pollId', async (req, res) => {
  const poll = await redis.hgetall(req.params.pollId);
  const votes = await redis.hgetall(`${req.params.pollId}:votes`);
  const totalVoters = await redis.scard(`${req.params.pollId}:voters`);
  res.json({ ...poll, votes, totalVoters });
});

// Close poll
app.post('/v1/polls/:pollId/close', async (req, res) => {
  await redis.hset(req.params.pollId, 'closed', 'true');
  res.json({ success: true });
});

app.listen(4009, () => console.log('Poll service on :4009'));
