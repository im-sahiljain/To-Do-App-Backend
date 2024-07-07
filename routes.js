const express = require('express');
const { register, login, createTodo, getTodos, getTodo, updateTodo, deleteTodo } = require('./controllers');
const auth = require('./middleware');

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);

router.post('/todos', auth, createTodo);
router.get('/todos', auth, getTodos);
router.get('/todos/:id', auth, getTodo);
router.put('/todos/:id', auth, updateTodo);
router.delete('/todos/:id', auth, deleteTodo);

module.exports = router;
