import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import API from '../api';

export default function Savings() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: '', target_amount: '' });
  const [contribution, setContribution] = useState({});

  const load = () => API.get('/savings').then(res => setGoals(res.data));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/savings', form);
    setForm({ name: '', target_amount: '' });
    load();
  };

  const handleContribute = async (id) => {
    const amount = contribution[id];
    if (!amount) return;
    await API.put(`/savings/${id}/contribute`, { amount: parseFloat(amount) });
    setContribution({ ...contribution, [id]: '' });
    load();
  };

  const handleDelete = async (id) => {
    await API.delete(`/savings/${id}`);
    load();
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Savings Goals</h2>
        <div style={styles.layout}>
          <div style={styles.formBox}>
            <h3 style={styles.subheading}>New goal</h3>
            <form onSubmit={handleCreate}>
              <input style={styles.input} type="text" placeholder="Goal name (e.g. Vacation)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input style={styles.input} type="number" placeholder="Target amount ($)" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} required min="0" step="0.01" />
              <button style={styles.button} type="submit">Create goal</button>
            </form>
          </div>
          <div style={styles.list}>
            {goals.length === 0 && <p style={styles.empty}>No savings goals yet</p>}
            {goals.map(g => (
              <div key={g.id} style={styles.item}>
                <div style={styles.itemTop}>
                  <span style={styles.name}>{g.name}</span>
                  <span style={styles.amounts}>${parseFloat(g.current_amount).toFixed(2)} / ${parseFloat(g.target_amount).toFixed(2)}</span>
                </div>
                <div style={styles.barBg}>
                  <div style={{ ...styles.barFill, width: `${Math.min(g.percentage, 100)}%` }} />
                </div>
                <p style={styles.percent}>{g.percentage}% complete</p>
                <div style={styles.contribute}>
                  <input
                    style={{ ...styles.input, marginBottom: 0, flex: 1 }}
                    type="number"
                    placeholder="Add amount ($)"
                    value={contribution[g.id] || ''}
                    onChange={e => setContribution({ ...contribution, [g.id]: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                  <button style={styles.addBtn} onClick={() => handleContribute(g.id)}>Add</button>
                  <button style={styles.delete} onClick={() => handleDelete(g.id)}>Delete</button>
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
  name: { fontSize: '15px', fontWeight: '500' },
  amounts: { fontSize: '14px', color: '#555' },
  barBg: { background: '#f0f0f0', borderRadius: '99px', height: '8px', marginBottom: '6px' },
  barFill: { height: '8px', borderRadius: '99px', background: '#10B981', transition: 'width 0.4s ease' },
  percent: { fontSize: '12px', color: '#888', margin: '0 0 12px' },
  contribute: { display: 'flex', gap: '8px', alignItems: 'center' },
  addBtn: { padding: '9px 16px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  delete: { background: 'none', border: 'none', color: '#aaa', fontSize: '12px', cursor: 'pointer' },
  empty: { color: '#aaa', fontSize: '14px' }
};