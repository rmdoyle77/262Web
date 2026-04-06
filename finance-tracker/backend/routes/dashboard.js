const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { month, year } = req.query;
  try {
    const totals = await pool.query(
      `SELECT type, SUM(amount) as total
       FROM transactions
       WHERE user_id = $1
       AND EXTRACT(MONTH FROM date) = $2
       AND EXTRACT(YEAR FROM date) = $3
       GROUP BY type`,
      [req.user.id, month, year]
    );

    const categoryBreakdown = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM transactions
       WHERE user_id = $1 AND type = 'expense'
       AND EXTRACT(MONTH FROM date) = $2
       AND EXTRACT(YEAR FROM date) = $3
       GROUP BY category
       ORDER BY total DESC`,
      [req.user.id, month, year]
    );

    let income = 0;
    let expenses = 0;
    totals.rows.forEach(row => {
      if (row.type === 'income') income = parseFloat(row.total);
      if (row.type === 'expense') expenses = parseFloat(row.total);
    });

    res.json({
      income,
      expenses,
      net_savings: income - expenses,
      category_breakdown: categoryBreakdown.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;