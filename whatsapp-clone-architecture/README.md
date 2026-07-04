# WhatsApp-Clone V10.4 - Privacy + Archive + AI

## Overview
V10.4 = V10.3 + Anonymous Channel admins, Stories Highlights, Voice chat transcription.

Total: 26 microservices, 52+ features.

## Services
| Port | Service | Purpose | Version |
| --- | --- | --- | --- |
| 4000 | chat-service | Core WebSocket + E2EE + groups + communities + usernames | V1 |
| 4001 | search-service | ElasticSearch indexing | V3 |
| 4002 | status-service | 24h Stories + ads + emoji replies + **highlights** | V3 |
| 4003 | scheduler-service | BullMQ scheduled messages + channel posts | V5 |
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
| 4020 | status-engagement-service | Stories emoji reactions + replies | V10.3 |
| 4021 | notification-prefs-service | Per-folder notification rules | V10.3 |
| 4022 | channel-admin-service | **NEW** Anonymous Channel admins | V10.4 |
| 4023 | highlights-service | **NEW** Stories Highlights archive | V10.4 |
| 4024 | transcription-service | **NEW** Live voice chat transcription | V10.4 |
| Kafka | notification-service | FCM/APNs push | V3 |

## New in V10.4

### 1. Anonymous Admins `:4022`
channel-admin-service lets Channel admins post as "Channel Name" instead of personal account. Toggle per-post or set as default. Messages show channel avatar + name, no admin identity exposed. API: `POST /v1/channels/{id}/post-anon`

### 2. Stories Highlights `:4023`
highlights-service creates permanent Story collections on profile. Users save expiring Stories to Highlights with cover + title. Stored in MinIO, metadata in Postgres. Viewable forever until deleted. API: `POST /v1/highlights`

### 3. Voice Chat Transcription `:4024`
transcription-service uses AWS Transcribe Streaming for live captions in rooms-service. Real-time text appears under speakers in voice/video rooms. Stored with room recording. Toggle per-room. API: WebSocket `/v1/transcribe/stream`

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

# Start all 26 services :4000 to :4024
cd services/channel-admin-service && npm i && npm run dev     # :4022 NEW
cd ../highlights-service && npm i && npm run dev              # :4023 NEW
cd ../transcription-service && npm i && npm run dev           # :4024 NEW
# ... start other 23 services

cd ../../client/web && npm i && npm run dev
```

## UI Updates in V10.4
- Channel composer: 👤 Anonymous toggle → posts as "Channel"
- Profile: + button in Highlights section → create collection
- Voice rooms: CC button → live captions overlay on speakers

See Project-History.md for V1-V10.3 changelog.
