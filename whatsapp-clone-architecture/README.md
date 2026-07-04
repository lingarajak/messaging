# WhatsApp-Clone V10.5 - Community + Creator Economy

## Overview
V10.5 = V10.4 + Topics in Groups, Channel Boost, Mini Apps/Bots Store.

Total: 29 microservices, 55+ features.

## Services
| Port | Service | Purpose | Version |
| --- | --- | --- | --- |
| 4000 | chat-service | Core WebSocket + E2EE + groups + communities + topics | V1 |
| 4001 | search-service | ElasticSearch indexing | V3 |
| 4002 | status-service | 24h Stories + ads + emoji replies + highlights | V3 |
| 4003 | scheduler-service | BullMQ scheduled messages + channel posts | V5 |
| 4004 | bot-service | Telegram-style bot API + **Mini Apps SDK** | V5 |
| 4005 | payment-service | Stripe in-chat payments + **boost payments** | V6 |
| 4006 | location-service | Live GPS streaming | V6 |
| 4007 | ai-service | GPT-4o summaries + AWS Transcribe | V9 |
| 4008 | poll-service | Polls/quizzes, real-time results | V9 |
| 4009 | catalog-service | Business products, Redis carts | V9 |
| 4010 | rooms-service | Voice/video rooms, mediasoup SFU | V10 |
| 4011 | translate-service | Real-time message translation | V10 |
| 4012 | moderation-service | AI content safety for groups | V10 |
| 4013 | videonotes-service | 60s circular video notes | V10.1 |
| 4014 | analytics-service | Channels analytics + **boost metrics** | V10.1 |
| 4015 | communities-service | WhatsApp-style Communities | V10.1 |
| 4016 | livekit-e2ee-service | E2EE group calls via LiveKit | V10.1 |
| 4017 | monetization-service | Stories ads + revenue share | V10.2 |
| 4018 | auth-service | Usernames + phone optional | V10.2 |
| 4019 | channel-comments-service | Channel post threads | V10.2 |
| 4020 | status-engagement-service | Stories emoji reactions + replies | V10.3 |
| 4021 | notification-prefs-service | Per-folder notification rules | V10.3 |
| 4022 | channel-admin-service | Anonymous Channel admins | V10.4 |
| 4023 | highlights-service | Stories Highlights archive | V10.4 |
| 4024 | transcription-service | Live voice chat transcription | V10.4 |
| 4025 | topics-service | **NEW** Forum-style Topics in Groups | V10.5 |
| 4026 | boost-service | **NEW** Paid Channel boosts + perks | V10.5 |
| 4027 | miniapps-service | **NEW** Mini Apps/Bots Store + SDK | V10.5 |
| Kafka | notification-service | FCM/APNs push | V3 |

## New in V10.5

### 1. Topics in Groups `:4025`
topics-service adds forum-style threads inside Groups. Each Group can enable Topics → creates General + custom topics. Messages stay organized by topic, unread per-topic, like Discord/Slack. API: `POST /v1/groups/{id}/topics`

### 2. Boost for Channels `:4026`
boost-service lets users pay to boost Channels. Levels unlock perks: custom emoji, more Stories/day, voice-to-text, higher upload limits. Paid via Stripe. Shows boost badge + level on Channel. API: `POST /v1/channels/{id}/boost`

### 3. Mini Apps/Bots Store `:4027`
miniapps-service hosts Mini Apps SDK + Store. Bots can launch web apps in chat via WebApp button. Store at `/apps` with categories, reviews, install. Uses bot-service webhooks. API: `GET /v1/miniapps`

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

# Start all 29 services :4000 to :4027
cd services/topics-service && npm i && npm run dev           # :4025 NEW
cd ../boost-service && npm i && npm run dev                  # :4026 NEW
cd ../miniapps-service && npm i && npm run dev               # :4027 NEW
# ... start other 26 services

cd ../../client/web && npm i && npm run dev
```

## UI Updates in V10.5
- Groups: Topics icon → opens topic list sidebar, each topic has unread count
- Channels: ⚡ Boost button → payment flow, shows Level + perks unlocked
- Chat input: 📱 Mini Apps button → opens Store, installed apps appear as buttons

See Project-History.md for V1-V10.4 changelog.
