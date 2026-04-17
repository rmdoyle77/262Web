import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';

const CATEGORIES = ['food', 'rent', 'transport', 'entertainment', 'utilities', 'health', 'savings', 'other'];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] });
  const [error, setError] = useState('');

  const load = () => API.get('/transactions').then(res => setTransactions(res.data));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/transactions', form);
      setForm({ type: 'expense', amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] });
      setError('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction');
    }
  };

  const handleDelete = async (id) => {
    await API.delete(`/transactions/${id}`);
    load();
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Transactions</h2>
        <div style={styles.layout}>
          <div style={styles.formBox}>
            <h3 style={styles.subheading}>Add transaction</h3>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <select style={styles.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <input style={styles.input} type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" step="0.01" />
              <select style={styles.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input style={styles.input} type="text" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input style={styles.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              <button style={styles.button} type="submit">Add transaction</button>
            </form>
          </div>
          <div style={styles.list}>
            {transactions.length === 0 && <p style={styles.empty}>No transactions yet</p>}
            {transactions.map(t => (
              <div key={t.id} style={styles.item}>
                <div>
                  <p style={styles.itemTitle}>{t.description || t.category}</p>
                  <p style={styles.itemSub}>{t.category} · {new Date(t.date).toLocaleDateString()}</p>
                </div>
                <div style={styles.itemRight}>
                  <p style={{ ...styles.amount, color: t.type === 'income' ? '#10B981' : '#EF4444' }}>
                    {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                  </p>
                  <button style={styles.delete} onClick={() => handleDelete(t.id)}>Delete</button>
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
  layout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' },
  formBox: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: 'fit-content' },
  subheading: { margin: '0 0 1rem', fontSize: '15px' },
  input: { width: '100%', padding: '9px 12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '13px', marginBottom: '10px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  item: { background: '#fff', padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  itemTitle: { margin: '0 0 4px', fontSize: '14px', fontWeight: '500' },
  itemSub: { margin: 0, fontSize: '12px', color: '#888' },
  itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  amount: { margin: 0, fontSize: '15px', fontWeight: '600' },
  delete: { background: 'none', border: 'none', color: '#aaa', fontSize: '12px', cursor: 'pointer' },
  empty: { color: '#aaa', fontSize: '14px' }
};