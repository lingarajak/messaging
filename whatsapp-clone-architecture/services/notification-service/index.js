const { Kafka } = require('kafkajs');
const admin = require('firebase-admin');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'push-notifier' });

// Initialize Firebase - add your serviceAccountKey.json
// admin.initializeApp({ credential: admin.credential.cert(require('./serviceAccountKey.json')) });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'push' });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const { to, title, body, data } = JSON.parse(message.value.toString());
      const token = await redis.hget(`fcm:${to}`, 'token');
      if (!token) return;
      
      // await admin.messaging().send({
      //   token,
      //   notification: { title, body },
      //   data: data || {}
      // });
      console.log(`Would send push to ${to}: ${title}`);
    }
  });
}

run();
