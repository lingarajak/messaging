# WhatsApp-Clone Architecture V7 - Rooms + Translate + Story Replies
Includes: All V6 + **Voice/Video Rooms**, **Screen Share**, **Message Translation**, **Story Replies with Reactions**

## What's New in V7
1. **Voice/Video Rooms**: `services/rooms-service/` using Mediasoup SFU. Clubhouse-style rooms, up to 50 speakers
2. **Screen Share**: Share screen in rooms or 1-to-1 calls via WebRTC `getDisplayMedia`
3. **Message Translation**: `services/translate-service/` Google Translate API. Click 🌐 on any message
4. **Story Replies**: Reply to stories with text + emoji reaction. Owner gets DM with story context

## New Services
- **rooms-service**:4007 - Mediasoup SFU for voice/video rooms + screen share
- **translate-service**:4008 - Google Translate API with Redis cache

## New UI Features
- 🎙️ - Create/join voice room
- 🖥️ - Start screen share
- 🌐 - Translate message to English
- Story ↩️💬 - Reply to story with reaction

## Quick Start
```bash
# Start new services
cd services/rooms-service && npm install && npm run dev   # :4007
cd services/translate-service && npm install && npm run dev # :4008

# Set env vars
export GOOGLE_TRANSLATE_KEY=xxx
export ANNOUNCED_IP=your.public.ip # for Mediasoup
```

## API Examples
```bash
# Create voice room
curl -X POST localhost:4007/v1/rooms/create -d '{"name":"Team Standup","type":"voice","hostId":"user123"}'

# Translate
curl -X POST localhost:4008/v1/translate -d '{"text":"Hola","target":"en","msgId":"msg123"}'

# Reply to story
curl -X POST localhost:4002/v1/status/status:user123:123/reply -d '{"from":"user456","text":"Nice!","reaction":"🔥"}'
```
