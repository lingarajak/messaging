const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');
const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.use(express.json());

app.post('/v1/catalog/products', async (req, res) => {
  const { businessId, name, price, image, description } = req.body;
  const productId = uuidv4();
  await pool.query('INSERT INTO products (id, business_id, name, price, image, description) VALUES ($1,$2,$3,$4,$5,$6)',
    [productId, businessId, name, price, image, description]);
  res.json({ productId });
});

app.get('/v1/catalog/:businessId', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products WHERE business_id = $1', [req.params.businessId]);
  res.json(rows);
});

app.post('/v1/cart/add', async (req, res) => {
  const { userId, productId, qty } = req.body;
  await redis.hincrby(`cart:${userId}`, productId, qty);
  const cart = await redis.hgetall(`cart:${userId}`);
  res.json({ cart });
});

app.post('/v1/cart/checkout', async (req, res) => {
  const { userId, businessId } = req.body;
  const cart = await redis.hgetall(`cart:${userId}`);
  const orderId = uuidv4();
  await pool.query('INSERT INTO orders (id, user_id, business_id, items, status) VALUES ($1,$2,$3,$4,$5)',
    [orderId, userId, businessId, JSON.stringify(cart), 'pending']);
  await redis.del(`cart:${userId}`);
  res.json({ orderId, status: 'pending' });
});

app.listen(4009, () => console.log('Catalog service on :4009'));
