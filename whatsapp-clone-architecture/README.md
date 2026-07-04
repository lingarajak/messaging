# WhatsApp-Clone V10.2 - Monetization + Identity + Engagement

## Overview
V10.2 = V10.1 + Stories Ads, Usernames, Channel Comments.

Total: 21 microservices, 45+ features, full SuperApp stack.

## Services
| Port | Service | Purpose | Version |
| --- | --- | --- | --- |
| 4000 | chat-service | Core WebSocket + E2EE + groups + communities + usernames | V1 |
| 4001 | search-service | ElasticSearch indexing | V3 |
| 4002 | status-service | 24h Stories + replies + **ads injection** | V3 |
| 4003 | scheduler-service | BullMQ scheduled messages | V5 |
| 4004 | bot-service | Telegram-style bot API | V5 |
| 4005 | payment-service | Stripe in-chat payments | V6 |
| 4006 | location-service | Live GPS streaming | V6 |
| 4007 | ai-service | GPT-4o summaries + AWS Transcribe | V9 |
| 4008 | poll-service | Polls/quizzes, real-time results | V9 |
| 4009 | catalog-service | Business products, Redis carts | V9 |
| 4010 | rooms-service | Voice/video rooms, mediasoup SFU | V10 |
| 4011 | translate-service | Real-time message translation | V10 |
| 4012 | moderation-service | AI content safety for groups | V10 |
| 4013 | videonotes-service | 60s circular video notes | V10.1 |
| 4014 | analytics-service | Channels analytics dashboard | V10.1 |
| 4015 | communities-service | WhatsApp-style Communities | V10.1 |
| 4016 | livekit-e2ee-service | E2EE group calls via LiveKit | V10.1 |
| 4017 | monetization-service | **NEW** Stories ads + revenue share | V10.2 |
| 4018 | auth-service | **NEW** Usernames + phone optional | V10.2 |
| 4019 | channel-comments-service | **NEW** Channel post threads | V10.2 |
| Kafka | notification-service | FCM/APNs push | V3 |

## New in V10.2

### 1. Stories Ads `:4017`
Monetization service injects ads between user Stories. Supports CPM/CPC, creator revenue share 55/45, skip after 5s. Ads stored in Postgres, served via `status-service`. Dashboard at `/admin/monetization`.

### 2. Usernames `:4018`
Auth service lets users claim `@username`. Phone number becomes optional for signup. Lookup via `GET /v1/users/@handle`. Chat works with userId or username. Backwards compatible with V10.1 phone-based accounts.

### 3. Channel Comments `:4019`
Each Channel post gets a comment thread. Replies are grouped under parent post, not sent to main chat. Supports reactions, replies, pin by admin. Socket: `channel:comment` → stored in Postgres, indexed in ElasticSearch.

## Quick Start
```bash
cd infra && docker-compose up -d

export OPENAI_API_KEY=sk-xxx
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx  
export STRIPE_SECRET_KEY=sk_test_xxx
export MEDIASOUP_ANNOUNCED_IP=your.public.ip
export LIVEKIT_API_KEY=devkey
export LIVEKIT_API_SECRET=secret
export ADS_PROVIDER_KEY=xxx # For Stories ads

# Start all 21 services :4000 to :4019
cd services/auth-service && npm i && npm run dev              # :4018 NEW
cd ../monetization-service && npm i && npm run dev           # :4017 NEW
cd ../channel-comments-service && npm i && npm run dev       # :4019 NEW
# ... start other 18 services

cd ../../client/web && npm i && npm run dev                   # :3000
```

## UI Updates in V10.2
- Stories: "Sponsored" label on ads, skip button after 5s
- Profile: Set `@username`, hide phone number toggle
- Channels: 💬 Comment button under each post → opens thread

See Project-History.md for V1-V10.1 changelog.
