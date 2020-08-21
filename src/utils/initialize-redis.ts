import redis from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';

export const initializeRedis = () => {
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient(6379, 'redis');

  return new RedisStore({ client: redisClient });
};
