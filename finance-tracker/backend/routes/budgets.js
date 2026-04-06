const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { month, year } = req.query;
  try {
    const budgets = await pool.query(
      'SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
      [req.user.id, month, year]
    );

    const spending = await pool.query(
      `SELECT category, SUM(amount) as spent
       FROM transactions
       WHERE user_id = $1 AND type = 'expense'
       AND EXTRACT(MONTH FROM date) = $2
       AND EXTRACT(YEAR FROM date) = $3
       GROUP BY category`,
      [req.user.id, month, year]
    );

    const spendingMap = {};
    spending.rows.forEach(row => {
      spendingMap[row.category] = parseFloat(row.spent);
    });

    const result = budgets.rows.map(budget => {
      const spent = spendingMap[budget.category] || 0;
      const limit = parseFloat(budget.monthly_limit);
      const percentage = Math.round((spent / limit) * 100);
      return {
        ...budget,
        spent,
        percentage,
        alert: percentage >= 80
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { category, monthly_limit, month, year } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, monthly_limit, month, year)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, category, month, year)
       DO UPDATE SET monthly_limit = $3
       RETURNING *`,
      [req.user.id, category, monthly_limit, month, year]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;