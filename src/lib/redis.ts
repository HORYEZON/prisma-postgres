import { createClient, RedisClientType } from 'redis';

// createClient infers a RedisClientType
const client: RedisClientType = createClient({
  url: process.env.REDIS_URL, // e.g. redis://localhost:6379
});

client.on('error', (err: Error) => {
  console.error('❌ Redis Client Error:', err);
});

(async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log('✅ Redis connected');
  }
})();

export default client;