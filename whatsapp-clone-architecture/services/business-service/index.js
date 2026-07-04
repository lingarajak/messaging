const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const upload = multer({ dest: '/tmp/' });

app.use(express.json());

// Create product
app.post('/v1/business/products', upload.single('image'), async (req, res) => {
  const { businessId, name, price, description } = req.body;
  const imageKey = req.file ? `products/${req.file.filename}` : null;
  const result = await pool.query(
    'INSERT INTO products (business_id, name, price, description, image_key) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [businessId, name, price, description, imageKey]
  );
  res.json({ productId: result.rows[0].id });
});

// Get catalog
app.get('/v1/business/:businessId/catalog', async (req, res) => {
  const result = await pool.query('SELECT * FROM products WHERE business_id = $1', [req.params.businessId]);
  res.json(result.rows);
});

// Create order from chat
app.post('/v1/business/order', async (req, res) => {
  const { businessId, customerId, productIds, total } = req.body;
  const result = await pool.query(
    'INSERT INTO orders (business_id, customer_id, products, total, status) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [businessId, customerId, JSON.stringify(productIds), total, 'pending']
  );
  res.json({ orderId: result.rows[0].id });
});

app.listen(4008, () => console.log('Business service on :4008'));
