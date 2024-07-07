const { pool } = require('./config');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  };