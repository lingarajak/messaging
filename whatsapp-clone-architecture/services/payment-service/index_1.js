const express = require('express');
const Stripe = require('stripe');
const Redis = require('ioredis');

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_xxx');

app.use(express.json());

// Create payment intent for in-chat payment
app.post('/v1/payments/create', async (req, res) => {
  const { amount, currency, from, to, message } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: currency || 'usd',
    metadata: { from, to, message }
  });
  
  const paymentId = `pay:${paymentIntent.id}`;
  await redis.hset(paymentId, 'status', 'pending', 'from', from, 'to', to, 'amount', amount);
  res.json({ clientSecret: paymentIntent.client_secret, paymentId });
});

// Webhook from Stripe
app.post('/v1/payments/webhook', async (req, res) => {
  const event = req.body;
  if (event.type === 'payment_intent.succeeded') {
    const id = event.data.object.id;
    await redis.hset(`pay:${id}`, 'status', 'completed');
    // Notify chat-service to send payment confirmation message
    await fetch('http://chat-service:4000/internal/send', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        to: event.data.object.metadata.to,
        from: 'system',
        type: 'payment',
        paymentData: { amount: event.data.object.amount / 100, status: 'completed' }
      })
    });
  }
  res.json({ received: true });
});

app.listen(4005, () => console.log('Payment service on :4005'));
