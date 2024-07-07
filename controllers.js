const { pool, redisClient, jwtSecret } = require('./config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.createTodo = async (req, res) => {
  const { title, description, deadline } = req.body;
  const userId = req.user.id;

  try {
    await pool.query('INSERT INTO todos (title, description, deadline, user_id) VALUES (?, ?, ?, ?)', [title, description, deadline, userId]);
    redisClient.del(`todos_${userId}`);
    res.status(201).json({ message: 'Todo created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.getTodos = async (req, res) => {
  const userId = req.user.id;

  redisClient.get(`todos_${userId}`, async (err, data) => {
    if (data) return res.json(JSON.parse(data));

    try {
      const [rows] = await pool.query('SELECT * FROM todos WHERE user_id = ?', [userId]);
      redisClient.setex(`todos_${userId}`, 3600, JSON.stringify(rows));
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  });
};

exports.getTodo = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.updateTodo = async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline } = req.body;
  const userId = req.user.id;

  try {
    const [result] = await pool.query('UPDATE todos SET title = ?, description = ?, deadline = ? WHERE id = ? AND user_id = ?', [title, description, deadline, id, userId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Todo not found or not authorized' });

    redisClient.del(`todos_${userId}`);
    res.json({ message: 'Todo updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.deleteTodo = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [result] = await pool.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Todo not found or not authorized' });

    redisClient.del(`todos_${userId}`);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};