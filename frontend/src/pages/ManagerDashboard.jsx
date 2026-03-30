import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
      setVendorName(JSON.parse(userStr).name);
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
                          <button onClick={() => handleUpdateStatus(req.booking_id, 'Accepted')} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Accept</button>
                          <button onClick={() => handleUpdateStatus(req.booking_id, 'Rejected')} className="btn-outline" style={{ padding: '8px 16px', borderRadius: '8px' }}>Reject</button>
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
                                <Bar dataKey="Revenue" fill="#ffc107" radius={[5, 5, 0, 0]} barSize={60} />
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
      default:
        return null;
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="container nav-wrapper">
          <h2>Event Manager Dashboard</h2>
          <button onClick={handleLogout} className="btn-outline small">Logout</button>
        </div>
      </nav>

      <section className="dashboard container">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>Welcome back, {vendorName}! 💼</h1>
          <p style={{ color: '#666' }}>Review booking requests, track schedules, and manage your revenue.</p>
        </div>

        <div className="dashboard-cards">
          <div className={`dash-card ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            <i className="fas fa-users"></i>
            <h3>Customer Requests</h3>
            <p>Manage event bookings</p>
          </div>

          <div className={`dash-card ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
            <i className="fas fa-calendar-alt"></i>
            <h3>Scheduled Events</h3>
            <p>Upcoming confirmed events</p>
          </div>

          <div className={`dash-card ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>
            <i className="fas fa-chart-line"></i>
            <h3>Revenue Overview</h3>
            <p>Track business performance</p>
          </div>
        </div>

        <div id="content-panel" className="content-panel fade-in" style={{ marginTop: '30px' }}>
          {renderContent()}
        </div>
      </section>
    </>
  );
};

export default ManagerDashboard;
