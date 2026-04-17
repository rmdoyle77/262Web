import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import Navbar from '../components/Navbar';
import API from '../api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  useEffect(() => {
    API.get(`/dashboard?month=${month}&year=${year}`)
      .then(res => setData(res.data))
      .catch(console.error);
  }, [month, year]);

  if (!data) return <div><Navbar /><p style={{ padding: '2rem' }}>Loading...</p></div>;

  const doughnutData = {
    labels: data.category_breakdown.map(c => c.category),
    datasets: [{
      data: data.category_breakdown.map(c => parseFloat(c.total)),
      backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
    }]
  };

  const barData = {
    labels: ['Income', 'Expenses', 'Net Savings'],
    datasets: [{
      label: 'Amount ($)',
      data: [data.income, data.expenses, data.net_savings],
      backgroundColor: ['#10B981', '#EF4444', '#4F46E5'],
      borderRadius: 6,
    }]
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Dashboard</h2>
        <div style={styles.cards}>
          <div style={styles.card}>
            <p style={styles.label}>Income</p>
            <p style={{ ...styles.value, color: '#10B981' }}>${data.income.toFixed(2)}</p>
          </div>
          <div style={styles.card}>
            <p style={styles.label}>Expenses</p>
            <p style={{ ...styles.value, color: '#EF4444' }}>${data.expenses.toFixed(2)}</p>
          </div>
          <div style={styles.card}>
            <p style={styles.label}>Net savings</p>
            <p style={{ ...styles.value, color: data.net_savings >= 0 ? '#10B981' : '#EF4444' }}>${data.net_savings.toFixed(2)}</p>
          </div>
        </div>
        <div style={styles.charts}>
          <div style={styles.chartBox}>
            <h3 style={styles.chartTitle}>Spending by category</h3>
            {data.category_breakdown.length > 0
              ? <Doughnut data={doughnutData} />
              : <p style={styles.empty}>No expenses this month</p>}
          </div>
          <div style={styles.chartBox}>
            <h3 style={styles.chartTitle}>Monthly summary</h3>
            <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  heading: { fontSize: '22px', marginBottom: '1.5rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '2rem' },
  card: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  label: { margin: '0 0 8px', fontSize: '13px', color: '#888' },
  value: { margin: 0, fontSize: '26px', fontWeight: '600' },
  charts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  chartBox: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chartTitle: { margin: '0 0 1rem', fontSize: '15px' },
  empty: { color: '#aaa', fontSize: '14px' }
};