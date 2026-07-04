# WhatsApp-Clone Architecture V8 - Polls & Quizzes
Includes: All V7 + **Polls/Quizzes** with real-time voting

## What's New in V8
1. **Polls**: `services/poll-service/` Create polls with multiple choice. Real-time vote counts via Socket.IO
2. **Quizzes**: Quiz mode with correct answer. Shows results after voting
3. **UI**: Click 📊 → create poll. Vote by clicking option. Animated progress bars show percentages
4. **Features**: Anonymous polls, multiple choice, 30-day expiry, close poll

## New Service
- **poll-service**:4009 - Poll creation, voting, results with Redis

## New UI
- 📊 - Create poll or quiz
- Click option to vote
- Live percentage bars
- Quiz shows correct answer after voting

## Quick Start
```bash
cd services/poll-service && npm install && npm run dev   # :4009
```

## API Examples
```bash
# Create poll
curl -X POST localhost:4009/v1/polls -d '{"question":"Best framework?","options":["React","Vue"],"chatId":"group123"}'

# Vote
curl -X POST localhost:4009/v1/polls/poll:xxx/vote -d '{"optionIndex":0,"userId":"user123"}'

# Create quiz
curl -X POST localhost:4009/v1/polls -d '{"question":"2+2?","options":["3","4","5"],"isQuiz":true,"correctAnswer":1}'
```

## Socket Events
- `poll:create` → creates poll → broadcasts `message:receive` with type: 'poll'
- `poll:vote` → records vote → broadcasts `poll:update` with new counts
