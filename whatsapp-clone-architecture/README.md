# WhatsApp-Clone V10.3 - Engagement + Personalization

## Overview
V10.3 = V10.2 + Stories emoji replies, Folder-specific notifications, Scheduled channel posts.

Total: 23 microservices, 48+ features.

## Services
| Port | Service | Purpose | Version |
| --- | --- | --- | --- |
| 4000 | chat-service | Core WebSocket + E2EE + groups + communities + usernames | V1 |
| 4001 | search-service | ElasticSearch indexing | V3 |
| 4002 | status-service | 24h Stories + ads + **emoji replies** | V3 |
| 4003 | scheduler-service | BullMQ scheduled messages + **channel posts** | V5 |
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
| 4017 | monetization-service | Stories ads + revenue share | V10.2 |
| 4018 | auth-service | Usernames + phone optional | V10.2 |
| 4019 | channel-comments-service | Channel post threads | V10.2 |
| 4020 | status-engagement-service | **NEW** Stories emoji reactions + replies | V10.3 |
| 4021 | notification-prefs-service | **NEW** Per-folder notification rules | V10.3 |
| Kafka | notification-service | FCM/APNs push | V3 |

## New in V10.3

### 1. Stories Emoji Replies `:4020`
status-engagement-service handles emoji reactions on Stories. Tap Story → 8 quick emojis + reply box. Sends DM to Story author with Story thumbnail context. API: `POST /v1/stories/{id}/react`

### 2. Folder-Specific Notifications `:4021`
notification-prefs-service stores per-folder rules. Users can set: Work folder = muted 9-5, Family = always notify, Channels = daily digest only. Overrides global settings. API: `PUT /v1/folders/{id}/notify`

### 3. Scheduled Channel Posts `:4003`
scheduler-service extended to support Channel posts. Admins schedule posts with media/polls. Uses same BullMQ as DMs. UI: 📅 button in Channel composer. API: `POST /v1/channels/{id}/schedule`

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
export ADS_PROVIDER_KEY=xxx

# Start all 23 services :4000 to :4021
cd services/status-engagement-service && npm i && npm run dev # :4020 NEW
cd ../notification-prefs-service && npm i && npm run dev     # :4021 NEW
# ... start other 21 services including updated scheduler-service

cd ../../client/web && npm i && npm run dev
```

## UI Updates in V10.3
- Stories: Emoji bar appears on tap, swipe up to reply
- Settings → Notifications → Folders → per-folder toggles
- Channel composer: 📅 Schedule button → date/time picker

See Project-History.md for V1-V10.2 changelog.
