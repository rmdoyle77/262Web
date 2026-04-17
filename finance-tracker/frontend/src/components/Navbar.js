import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>Finance Tracker</span>
      <div style={styles.links}>
        <Link style={styles.link} to="/">Dashboard</Link>
        <Link style={styles.link} to="/transactions">Transactions</Link>
        <Link style={styles.link} to="/budgets">Budgets</Link>
        <Link style={styles.link} to="/savings">Savings</Link>
      </div>
      <div style={styles.right}>
        <span style={styles.user}>{user.name}</span>
        <button style={styles.logout} onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '56px', background: '#4F46E5', color: '#fff' },
  brand: { fontWeight: '600', fontSize: '16px' },
  links: { display: 'flex', gap: '24px' },
  link: { color: '#fff', textDecoration: 'none', fontSize: '14px' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  user: { fontSize: '14px', opacity: 0.85 },
  logout: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
};