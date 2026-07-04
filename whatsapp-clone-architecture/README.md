# WhatsApp-Clone V10 - SuperApp Edition

## Overview
V10 consolidates all features from V1-V9 and adds Video Rooms, Real-time Translation, and AI Moderation.

Total: 14 microservices, 35+ features, production-ready for 10M+ MAU.

## Services
| Port | Service | Purpose |
| --- | --- | --- |
| 4000 | chat-service | Core WebSocket + E2EE + groups |
| 4001 | search-service | ElasticSearch indexing |
| 4002 | status-service | 24h Stories with replies |
| 4003 | scheduler-service | BullMQ scheduled messages |
| 4004 | bot-service | Telegram-style bot API |
| 4005 | payment-service | Stripe in-chat payments |
| 4006 | location-service | Live GPS streaming |
| 4007 | ai-service | GPT-4o summaries + AWS Transcribe |
| 4008 | poll-service | Polls/quizzes, real-time results |
| 4009 | catalog-service | Business products, Redis carts |
| 4010 | rooms-service | Voice/video rooms, mediasoup SFU |
| 4011 | translate-service | Real-time message translation |
| 4012 | moderation-service | AI content safety for groups |
| Kafka | notification-service | FCM/APNs push |

## Quick Start
```bash
cd infra && docker-compose up -d
export OPENAI_API_KEY=sk-xxx
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
export STRIPE_SECRET_KEY=sk_test_xxx
export MEDIASOUP_ANNOUNCED_IP=your.public.ip

# Start all 14 services - each in new terminal
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
cd ../notification-service && npm i && npm run dev        # Kafka

cd ../../client/web && npm i && npm run dev               # :3000
```

## New in V10
1. **rooms-service**: Telegram-style voice/video rooms with mediasoup SFU
2. **translate-service**: Real-time message translation via GPT-4o  
3. **moderation-service**: AI content moderation using AWS Rekognition + OpenAI

See Project-History.md for complete V1-V9 changelog.
