import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ManagerSignup = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || password !== confirmPassword || !company) {
      setError('Please fill all fields and ensure passwords match.');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: company + ' - ' + name, email, password, role: 'vendor' })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Registration failed');
        return;
      }
      
      alert('Registration successful! Please login as Vendor.');
      navigate('/manager-login');
    } catch (err) {
      setError('Cannot connect to server.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box card">
        <h2>Vendor Portal Registration</h2>
        <form onSubmit={handleSignup} style={{ width: '100%', textAlign: 'left' }}>
          {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px', background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{error}</p>}
          
          <div className="form-group">
            <label>Vendor / Company Name</label>
            <input type="text" placeholder="Leela Palace Inc." value={company} onChange={e => setCompany(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
            <label>Account Manager Name</label>
            <input type="text" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
            <label>Official Email</label>
             <input type="email" placeholder="contact@venue.com" value={email} onChange={e => setEmail(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
            <label>Business Phone</label>
            <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
            <label>Secure Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-input" />
          </div>

          <button type="submit" className="btn-primary full">
              <i className="fas fa-store"></i> Register Venue
          </button>
        </form>
        <p style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
          Already registered? <Link to="/manager-login" style={{ color: 'var(--primary-hover)', fontWeight: '600' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ManagerSignup;
