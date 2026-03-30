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
      <div className="auth-box">
        <h2>Customer Login</h2>
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          {error && <p style={{ color: '#d9534f', fontSize: '13px', marginBottom: '10px', textAlign: 'left' }}>{error}</p>}
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn-primary full">Login</button>
        </form>
        <p>New user? <Link to="/customer-signup">Sign Up</Link></p>
      </div>
    </div>
  );
};

export default CustomerLogin;
