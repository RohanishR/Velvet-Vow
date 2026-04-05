import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MagneticButton from '../components/MagneticButton';

const CustomerSignup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || password !== confirmPassword) {
      setError('Please fill all fields and ensure passwords match.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'customer' })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }
      
      alert('Registration successful! Please login.');
      navigate('/customer-login');
    } catch (err) {
      setError('Cannot connect to server.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box card">
        <h2>Create Customer Account</h2>
        <form onSubmit={handleSignup} style={{ width: '100%', textAlign: 'left' }}>
          {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px', background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{error}</p>}
          
          <div className="form-group">
             <label>Full Name</label>
             <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="form-input" />
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
             <label>Confirm Password</label>
             <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-input" />
          </div>

          <MagneticButton style={{ width: '100%' }}>
            <button type="submit" className="btn-primary full">
                <i className="fas fa-user-plus"></i> Create Account
            </button>
          </MagneticButton>
        </form>
        <p style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/customer-login" style={{ color: 'var(--primary-hover)', fontWeight: '600' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default CustomerSignup;
