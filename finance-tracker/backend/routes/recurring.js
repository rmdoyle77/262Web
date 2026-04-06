const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM recurring_rules WHERE user_id = $1 ORDER BY next_date ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { type, amount, category, description, frequency, next_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO recurring_rules (user_id, type, amount, category, description, frequency, next_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, type, amount, category, description, frequency, next_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/process', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rules = await pool.query(
      'SELECT * FROM recurring_rules WHERE user_id = $1 AND next_date <= $2',
      [req.user.id, today]
    );

    const generated = [];

    for (const rule of rules.rows) {
      await pool.query(
        `INSERT INTO transactions (user_id, type, amount, category, description, date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [rule.user_id, rule.type, rule.amount, rule.category, rule.description, rule.next_date]
      );

      const nextDate = new Date(rule.next_date);
      if (rule.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (rule.frequency === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      await pool.query(
        'UPDATE recurring_rules SET next_date = $1 WHERE id = $2',
        [nextDate, rule.id]
      );

      generated.push(rule.category);
    }

    res.json({ message: `Generated ${generated.length} transactions`, categories: generated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM recurring_rules WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Rule not found' });
    res.json({ message: 'Recurring rule deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;