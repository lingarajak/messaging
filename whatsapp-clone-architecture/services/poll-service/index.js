// Poll Service - V10.7 Updated
const express = require('express');
const app = express();
app.use(express.json());

app.post('/v1/polls', async (req, res) => {
  // V10.7: Support channelId
  const { question, options, chatId, channelId } = req.body;
  const targetId = channelId || chatId;
  const targetType = channelId ? 'channel' : 'chat';
  
  // Save to DB: question, options, target_id, target_type
  const pollId = 'p_' + Date.now();
  
  // Broadcast to target
  // io.to(targetId).emit('poll:new', { pollId, targetType });
  
  res.json({ pollId, targetType });
});

app.listen(4008, () => console.log('poll-service :4008'));