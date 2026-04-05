import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import MagneticButton from '../components/MagneticButton';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [vendorName, setVendorName] = useState('Vendor');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get vendor details from storage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setVendorName(user.name);
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone || '');
    }

    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/manager-login');

        const response = await fetch('http://localhost:5000/api/bookings/vendor', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        } else {
          setError('Failed to fetch requests');
        }
      } catch (err) {
        setError('Network error fetching requests');
      }
    };

    fetchRequests();
  }, [navigate]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Optimistically update the UI instantly
        setRequests(requests.map(req => 
          req.booking_id === id ? { ...req, status: newStatus } : req
        ));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      alert('Network error updating status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // --- Profile State ---
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, email: editEmail, phone: editPhone, password: editPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage('Profile updated successfully!');
        setVendorName(data.user.name);
        localStorage.setItem('user', JSON.stringify(data.user));
        setEditPassword('');
      } else {
        setProfileMessage(data.message || 'Update failed');
      }
    } catch (err) {
      setProfileMessage('Network error updating profile');
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'requests':
        const pendingRequests = requests.filter(r => r.status === 'Pending');
        return (
          <>
            <h2>Customer Booking Requests</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              {pendingRequests.length === 0 ? <p>No incoming pending requests found.</p> : null}
              {pendingRequests.map(req => (
                <div key={req.booking_id} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '15px', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{req.hallName}</h4>
                      <p style={{ margin: '0 0 5px 0', color: '#555' }}><strong>Customer Name:</strong> {req.customerName}</p>
                      <p style={{ margin: '0 0 10px 0', color: '#555' }}><strong>Event Date:</strong> {new Date(req.eventDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <MagneticButton radius={60} strength={0.3}>
                            <button onClick={() => handleUpdateStatus(req.booking_id, 'Accepted')} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Accept</button>
                          </MagneticButton>
                          <MagneticButton radius={60} strength={0.3}>
                            <button onClick={() => handleUpdateStatus(req.booking_id, 'Rejected')} className="btn-outline" style={{ padding: '8px 16px', borderRadius: '8px' }}>Reject</button>
                          </MagneticButton>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case 'events':
        const scheduledEvents = requests.filter(r => r.status === 'Accepted');
        return (
          <>
            <h2>Scheduled Events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              {scheduledEvents.length === 0 ? <p>Upcoming confirmed events will appear here.</p> : null}
              {scheduledEvents.map(req => (
                <div key={req.booking_id} style={{ padding: '20px', border: '1px solid #d4edda', borderRadius: '15px', background: '#f8fff9', boxShadow: '0 2px 10px rgba(40,167,69,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#155724' }}>{req.hallName}</h4>
                      <p style={{ margin: '0 0 5px 0', color: '#333' }}><strong>Customer:</strong> {req.customerName}</p>
                      <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(40, 167, 69, 0.1)', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#155724' }}><strong>Phone:</strong> <a href={`tel:${req.customerContact}`} style={{color:'#155724'}}>{req.customerContact}</a></p>
                        <p style={{ margin: '0', fontSize: '13px', color: '#155724' }}><strong>Email:</strong> <a href={`mailto:${req.customerEmail}`} style={{color:'#155724'}}>{req.customerEmail}</a></p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{new Date(req.eventDate).toLocaleDateString()}</p>
                        <span style={{ fontSize: '13px', color: '#155724' }}><i className="fas fa-check-circle"></i> Confirmed Schedule</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case 'revenue':
        const acceptedForRevenue = requests.filter(r => r.status === 'Accepted');
        
        const totalRevenue = acceptedForRevenue.reduce((sum, req) => {
           let val = req.venuePrice || '0';
           val = val.replace(/[^0-9.-]+/g,""); 
           return sum + (parseFloat(val) || 0);
        }, 0);

        const revenueByHall = {};
        acceptedForRevenue.forEach(req => {
           let val = req.venuePrice || '0';
           val = parseFloat(val.replace(/[^0-9.-]+/g,"")) || 0;
           if(revenueByHall[req.hallName]) {
               revenueByHall[req.hallName] += val;
           } else {
               revenueByHall[req.hallName] = val;
           }
        });

        const barData = Object.keys(revenueByHall).map(key => ({
            name: key,
            Revenue: revenueByHall[key]
        }));

        return (
          <>
            <h2>Revenue Overview</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginTop: '20px', marginBottom: '20px', borderLeft: '5px solid #28a745' }}>
               <h3 style={{ margin: 0, color: '#555', fontSize: '16px' }}>Total Projected Revenue</h3>
               <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#155724' }}>
                 ₹{totalRevenue.toLocaleString('en-IN')}
               </p>
            </div>
            
            {acceptedForRevenue.length > 0 ? (
                <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 30px 0', fontSize: '18px' }}>Revenue by Venue</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 13}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 13}} tickFormatter={(value) => `₹${value/1000}k`} />
                                <Tooltip cursor={{fill: '#f4f6f8'}} formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                                <Bar dataKey="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div style={{ background: '#fff', padding: '40px 20px', textAlign: 'center', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <p style={{ color: '#777', fontSize: '16px', margin: 0 }}><i className="fas fa-chart-bar" style={{fontSize: '40px', display: 'block', marginBottom: '15px', color: '#ddd'}}></i>No revenue data available. Accept some incoming bookings first!</p>
                </div>
            )}
          </>
        );
      case 'profile':
        return (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}><i className="fas fa-user-edit"></i> Edit Profile</h2>
            {profileMessage && <p style={{ padding: '10px', background: profileMessage.includes('success') ? '#d4edda' : '#f8d7da', color: profileMessage.includes('success') ? '#155724' : '#721c24', borderRadius: '5px', marginBottom: '15px' }}>{profileMessage}</p>}
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+91 9876543210" />
              </div>
              <div className="form-group">
                <label>New Password (Optional)</label>
                <input type="password" placeholder="Leave blank to keep current password" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
              </div>
              <MagneticButton style={{ width: '100%' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Changes</button>
              </MagneticButton>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <nav className="navbar" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container nav-wrapper" style={{ width: '95%', maxWidth: '1400px' }}>
          <h2 className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-ring" style={{ color: 'var(--primary)' }}></i> Velvet Vow 
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-muted)' }}>| Vendor Portal</span>
          </h2>
          <MagneticButton>
            <button onClick={handleLogout} className="btn-outline">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </MagneticButton>
        </div>
      </nav>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
             <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '700' }}>Venue Manager</div>
             <div className="sidebar-user">{vendorName}</div>
          </div>
          
          <div className="sidebar-nav">
             <button className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
                <i className="fas fa-users"></i> Booking Requests
             </button>
             <button className={`nav-item ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                <i className="fas fa-calendar-alt"></i> Scheduled Events
             </button>
             <button className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>
                <i className="fas fa-chart-line"></i> Revenue Dash
             </button>
             
             <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }}></div>

             <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <i className="fas fa-user-cog"></i> Profile Settings
             </button>
          </div>
        </aside>

        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default ManagerDashboard;
