import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'customer') {
        navigate('/dashboard-customer');
      } else {
        navigate('/dashboard-manager');
      }
    } catch (err) {
      setError('Cannot connect to server. Ensure backend is running.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box card">
        <h2>Customer Login</h2>
        <form onSubmit={handleLogin} style={{ width: '100%', textAlign: 'left' }}>
          {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px', background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{error}</p>}
          
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-primary full">
              <i className="fas fa-sign-in-alt"></i> Login Securely
          </button>
        </form>
        <p style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/customer-signup" style={{ color: 'var(--primary-hover)', fontWeight: '600' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;
