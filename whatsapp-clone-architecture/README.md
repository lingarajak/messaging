# WhatsApp-Clone V10.7 - Call i18n + Channel Engagement + Albums

## Overview
V10.7 = V10.6 + Message translation in calls, Polls in Channels, Shared photo albums.

Total: 29 microservices, 58+ features.

## Services
| Port | Service | Purpose | Version |
| --- | --- | --- | --- |
| 4000 | chat-service | Core WebSocket + E2EE + groups + communities + topics | V1 |
| 4001 | search-service | ElasticSearch indexing | V3 |
| 4002 | status-service | 24h Stories + ads + emoji replies + highlights | V3 |
| 4003 | scheduler-service | BullMQ scheduled messages + channel posts | V5 |
| 4004 | bot-service | Telegram-style bot API + Mini Apps SDK | V5 |
| 4005 | payment-service | Stripe in-chat payments + boost payments | V6 |
| 4006 | location-service | Live GPS streaming | V6 |
| 4007 | ai-service | GPT-4o summaries + AWS Transcribe | V9 |
| 4008 | poll-service | Polls/quizzes + **Channel support V10.7** | V9 |
| 4009 | catalog-service | Business products + **Shared Albums V10.7** | V9 |
| 4010 | rooms-service | Voice/video rooms + **call translation V10.7** | V10 |
| 4011 | translate-service | Real-time message + **call translation V10.7** | V10 |
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
| Kafka | notification-service | FCM/APNs push | V3 |

## New in V10.7

### 1. Message Translation in Calls `:4011 + :4010`
translate-service now handles live call audio translation. rooms-service streams transcribed text to translate-service, returns captions in each user's language. Toggle per-room.

### 2. Polls in Channels `:4008`
poll-service extended with target_type/channel. Channel admins create polls that appear as Channel posts. Results aggregated in analytics-service.

### 3. Shared Photo Albums `:4009`
catalog-service renamed to albums-service. Create shared albums in groups/chats. Members upload photos, comment, download all. Stored in MinIO.

## Quick Start
```bash
cd infra && docker-compose up -d
# Start all 29 services :4000 to :4027
```

See Project-History.md for V1-V10.6 changelog.
