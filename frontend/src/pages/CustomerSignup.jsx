import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
      <div className="auth-box">
        <h2>Create Customer Account</h2>
        <form onSubmit={handleSignup} style={{ width: '100%' }}>
          {error && <p style={{ color: '#d9534f', fontSize: '13px', marginBottom: '10px', textAlign: 'left' }}>{error}</p>}
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          <button type="submit" className="btn-primary full">Sign Up</button>
        </form>
        <p>Already have an account? <Link to="/customer-login">Login</Link></p>
      </div>
    </div>
  );
};

export default CustomerSignup;
