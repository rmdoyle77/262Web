const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    const goals = result.rows.map(goal => {
      const target = parseFloat(goal.target_amount);
      const current = parseFloat(goal.current_amount);
      const percentage = Math.round((current / target) * 100);
      return { ...goal, percentage };
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, target_amount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO savings_goals (user_id, name, target_amount) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, name, target_amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/contribute', auth, async (req, res) => {
  const { amount } = req.body;
  try {
    const result = await pool.query(
      `UPDATE savings_goals
       SET current_amount = LEAST(current_amount + $1, target_amount)
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [amount, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Goal not found' });
    const goal = result.rows[0];
    const percentage = Math.round((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100);
    res.json({ ...goal, percentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;