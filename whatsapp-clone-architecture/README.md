# WhatsApp-Clone V10.1 - SuperApp + Power Features

## Overview
V10.1 = V10 base + 4 major features: Video Notes, Channels Analytics, E2EE Group Calls, Communities.

Total: 18 microservices, 40+ features, production-ready for 50M+ MAU.

## Services
| Port | Service | Purpose | Version |
| --- | --- | --- | --- |
| 4000 | chat-service | Core WebSocket + E2EE + groups + communities hooks | V1 |
| 4001 | search-service | ElasticSearch indexing | V3 |
| 4002 | status-service | 24h Stories with replies | V3 |
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
| 4013 | videonotes-service | **NEW** 60s circular video notes | V10.1 |
| 4014 | analytics-service | **NEW** Channels analytics dashboard | V10.1 |
| 4015 | communities-service | **NEW** WhatsApp-style Communities | V10.1 |
| 4016 | livekit-e2ee-service | **NEW** E2EE group calls via LiveKit | V10.1 |
| Kafka | notification-service | FCM/APNs push | V3 |

## New in V10.1

### 1. Video Notes `:4013`
Telegram-style circular video messages. 60s max, auto-play muted, tap to unmute. H.264 encoding, stored in MinIO. Socket: `video_note:send`

### 2. Channels Analytics `:4014` 
Dashboard at `/admin/channels/{id}`. Metrics: views, reach, forwards, subscriber growth, best posting time, audience demographics. Postgres + Redis caching.

### 3. E2EE Group Calls `:4016`
LiveKit SFU with E2EE option. Signal protocol for group keys. 2-8 people = full E2EE, 9+ = SFU encrypted. Socket: `call:e2ee:start`

### 4. Communities `:4015`
WhatsApp-style hierarchy: Community → Announcement Channel + Member Groups. Admin tools, invite links, member management. Socket: `community:create`

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

# Start all 18 services - ports 4000 to 4016
cd services/chat-service && npm i && npm run dev          # :4000
cd ../search-service && npm i && npm run dev              # :4001
cd ../status-service && npm i && npm run dev              # :4002
cd ../scheduler-service && npm i && npm run dev           # :4003
cd ../bot-service && npm i && npm run dev                 # :4004
cd ../payment-service && npm i && npm run dev             # :4005
cd ../location-service && npm i && npm run dev            # :4006
cd ../ai-service && npm i && npm run dev                  # :4007
cd ../poll-service && npm i && npm run dev                # :4008
cd ../catalog-service && npm i && npm run dev             # :4009
cd ../rooms-service && npm i && npm run dev               # :4010
cd ../translate-service && npm i && npm run dev           # :4011
cd ../moderation-service && npm i && npm run dev          # :4012
cd ../videonotes-service && npm i && npm run dev          # :4013 NEW
cd ../analytics-service && npm i && npm run dev           # :4014 NEW
cd ../communities-service && npm i && npm run dev         # :4015 NEW
cd ../livekit-e2ee-service && npm i && npm run dev        # :4016 NEW
cd ../notification-service && npm i && npm run dev        # Kafka

cd ../../client/web && npm i && npm run dev               # :3000
```

## UI Updates in V10.1
- 📹 Hold to record video note in chat input
- 📊 Analytics button in Channel header → `/admin`
- 🔐 E2EE toggle in group call UI
- 🏘️ Communities tab in sidebar

See Project-History.md for V1-V10 changelog.
