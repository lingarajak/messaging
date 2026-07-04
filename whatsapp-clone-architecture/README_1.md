# WhatsApp-Clone Complete Architecture + WebRTC + Search
Now includes: E2EE, Groups, Media, Mobile, K8s, Terraform, **WebRTC Video Calls**, **ElasticSearch**

## New Services
1. **WebRTC**: Signaling added to chat-service. See client/web for video call UI
2. **Search**: services/search-service indexes all messages to ElasticSearch

## Quick Start
```bash
cd infra && docker-compose up -d  # Now includes ElasticSearch + Kibana :5601
cd services/chat-service && npm install && npm run dev
cd services/search-service && npm install && npm run dev  # :4001
cd client/web && npm install && npm run dev
cd client/mobile && npm install && npx expo start
```
