const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const { Kafka } = require('kafkajs');

const app = express();
const es = new Client({ node: process.env.ES_URL || 'http://localhost:9200' });
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'search-indexer' });

app.use(express.json());

app.get('/v1/search', async (req, res) => {
  const { q, userId } = req.query;
  const result = await es.search({
    index: 'messages',
    query: {
      bool: {
        must: [{ match: { text: q } }],
        filter: [{ term: { participants: userId } }]
      }
    }
  });
  res.json(result.hits.hits.map(h => h._source));
});

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'messages', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      await es.index({
        index: 'messages',
        id: data.msgId,
        document: {
          text: data.message || data.ciphertext,
          from: data.from,
          to: data.to,
          participants: [data.from, data.to],
          timestamp: new Date()
        }
      });
    }
  });
}

app.listen(4001, async () => {
  await run();
  console.log('Search service on :4001');
});
