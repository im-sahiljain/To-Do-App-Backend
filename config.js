const mysql = require('mysql2/promise');
const redis = require('redis');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

module.exports = {
  pool,
  redisClient,
  jwtSecret: process.env.JWT_SECRET,
};
