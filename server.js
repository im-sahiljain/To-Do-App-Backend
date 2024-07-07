const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes');
const { pool } = require('./config');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api', router);

const port = process.env.PORT || 3000;

const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      deadline DATETIME DEFAULT NULL,
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
};

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await initializeDatabase();
});
