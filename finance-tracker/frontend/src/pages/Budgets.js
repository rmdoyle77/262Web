import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';

const CATEGORIES = ['food', 'rent', 'transport', 'entertainment', 'utilities', 'health', 'savings', 'other'];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: 'food', monthly_limit: '' });
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const load = () => API.get(`/budgets?month=${month}&year=${year}`).then(res => setBudgets(res.data));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/budgets', { ...form, month, year });
    setForm({ category: 'food', monthly_limit: '' });
    load();
  };

  const handleDelete = async (id) => {
    await API.delete(`/budgets/${id}`);
    load();
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Budgets — {now.toLocaleString('default', { month: 'long' })} {year}</h2>
        <div style={styles.layout}>
          <div style={styles.formBox}>
            <h3 style={styles.subheading}>Set a budget</h3>
            <form onSubmit={handleSubmit}>
              <select style={styles.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input style={styles.input} type="number" placeholder="Monthly limit ($)" value={form.monthly_limit} onChange={e => setForm({ ...form, monthly_limit: e.target.value })} required min="0" step="0.01" />
              <button style={styles.button} type="submit">Save budget</button>
            </form>
          </div>
          <div style={styles.list}>
            {budgets.length === 0 && <p style={styles.empty}>No budgets set for this month</p>}
            {budgets.map(b => (
              <div key={b.id} style={styles.item}>
                <div style={styles.itemTop}>
                  <span style={styles.category}>{b.category}</span>
                  <span style={styles.amounts}>${b.spent.toFixed(2)} / ${parseFloat(b.monthly_limit).toFixed(2)}</span>
                </div>
                <div style={styles.barBg}>
                  <div style={{ ...styles.barFill, width: `${Math.min(b.percentage, 100)}%`, background: b.alert ? '#EF4444' : '#4F46E5' }} />
                </div>
                <div style={styles.itemBottom}>
                  <span style={{ fontSize: '12px', color: b.alert ? '#EF4444' : '#888' }}>
                    {b.percentage}% used {b.alert ? '— over 80% warning!' : ''}
                  </span>
                  <button style={styles.delete} onClick={() => handleDelete(b.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  heading: { fontSize: '22px', marginBottom: '1.5rem' },
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' },
  formBox: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: 'fit-content' },
  subheading: { margin: '0 0 1rem', fontSize: '15px' },
  input: { width: '100%', padding: '9px 12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: { background: '#fff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  itemTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  category: { fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' },
  amounts: { fontSize: '14px', color: '#555' },
  barBg: { background: '#f0f0f0', borderRadius: '99px', height: '8px', marginBottom: '8px' },
  barFill: { height: '8px', borderRadius: '99px', transition: 'width 0.4s ease' },
  itemBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  delete: { background: 'none', border: 'none', color: '#aaa', fontSize: '12px', cursor: 'pointer' },
  empty: { color: '#aaa', fontSize: '14px' }
};