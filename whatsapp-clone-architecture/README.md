# WhatsApp-Clone Architecture V6 - Payments + Location + Disappearing
Includes: All V5 + **Disappearing Messages**, **In-Chat Payments**, **Live Location Sharing**

## What's New in V6
1. **Disappearing Messages**: `chat:disappearing` event sets timer per chat. Messages auto-delete via Redis TTL
2. **In-Chat Payments**: `services/payment-service/` Stripe integration. Send money like WhatsApp Pay
3. **Live Location**: `services/location-service/` real-time location sharing with expiry. Socket.IO streams updates

## New Services
- **payment-service**:4005 - Stripe payment intents + webhooks
- **location-service**:4006 - WebSocket live location streams

## New UI Buttons
- 💳 - Send payment
- 📍 - Share live location  
- ⏱️ - Set disappearing timer

## Quick Start
```bash
cd services/payment-service && npm install && npm run dev  # :4005
cd services/location-service && npm install && npm run dev # :4006
```
Add `STRIPE_SECRET_KEY` env var for payments.
