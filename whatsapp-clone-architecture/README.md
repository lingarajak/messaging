# WhatsApp-Clone V10.6 - Cloud + Premium + i18n

## Overview
V10.6 = V10.5 + Shared folders in cloud storage, Premium subscription tier, Native post translations in Channels.

Total: 32 microservices, 60+ features.

## Services
| Port | Service | Purpose | Version |
| --- | --- | --- | --- |
| 4000 | chat-service | Core WebSocket + E2EE + groups + communities + topics | V1 |
| 4001 | search-service | ElasticSearch indexing | V3 |
| 4002 | status-service | 24h Stories + ads + emoji replies + highlights | V3 |
| 4003 | scheduler-service | BullMQ scheduled messages + channel posts | V5 |
| 4004 | bot-service | Telegram-style bot API + Mini Apps SDK | V5 |
| 4005 | payment-service | Stripe in-chat payments + boost + **premium** | V6 |
| 4006 | location-service | Live GPS streaming | V6 |
| 4007 | ai-service | GPT-4o summaries + AWS Transcribe | V9 |
| 4008 | poll-service | Polls/quizzes, real-time results | V9 |
| 4009 | catalog-service | Business products, Redis carts | V9 |
| 4010 | rooms-service | Voice/video rooms, mediasoup SFU | V10 |
| 4011 | translate-service | Real-time message translation | V10 |
| 4012 | moderation-service | AI content safety for groups | V10 |
| 4013 | videonotes-service | 60s circular video notes | V10.1 |
| 4014 | analytics-service | Channels analytics + boost metrics | V10.1 |
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
| 4025 | topics-service | Forum-style Topics in Groups | V10.5 |
| 4026 | boost-service | Paid Channel boosts + perks | V10.5 |
| 4027 | miniapps-service | Mini Apps/Bots Store + SDK | V10.5 |
| 4028 | storage-service | **NEW** Shared folders in cloud storage | V10.6 |
| 4029 | premium-service | **NEW** Premium subscription tier | V10.6 |
| 4030 | channel-translation-service | **NEW** Auto-translate Channel posts | V10.6 |
| Kafka | notification-service | FCM/APNs push | V3 |

## New in V10.6

### 1. Shared Folders in Cloud Storage `:4028`
storage-service provides Telegram-style cloud storage. Users get unlimited cloud for chat media. New: Shared folders with permissions. Create folder → share link → collaborators upload/view. Uses MinIO + Postgres for ACL. API: `POST /v1/storage/folders/share`

### 2. Premium Subscription Tier `:4029`
premium-service manages Premium via Stripe subscriptions. Perks: 4GB uploads, faster downloads, voice-to-text, no ads, animated profiles, 1000 channels, Stories priority. Extends payment-service. Badge on profile. API: `POST /v1/premium/subscribe`

### 3. Native Post Translations in Channels `:4030`
channel-translation-service auto-translates Channel posts using GPT-4o. Subscribers see posts in their language with "See original" toggle. Stored per-language in Postgres. Admin can enable/disable per-channel. API: `POST /v1/channels/{id}/translate`

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

# Start all 32 services :4000 to :4030
cd services/storage-service && npm i && npm run dev              # :4028 NEW
cd ../premium-service && npm i && npm run dev                    # :4029 NEW
cd ../channel-translation-service && npm i && npm run dev        # :4030 NEW
# ... start other 29 services

cd ../../client/web && npm i && npm run dev
```

## UI Updates in V10.6
- Settings → Storage → Shared Folders → create + invite
- Settings → Premium → Subscribe button, shows perks comparison
- Channel posts: 🌐 Translate icon → shows in user language, "Original" button

See Project-History.md for V1-V10.5 changelog.
