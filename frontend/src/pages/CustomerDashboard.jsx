import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MagneticButton from '../components/MagneticButton';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableHalls, setAvailableHalls] = useState([]);
  const [userName, setUserName] = useState('Customer');
  const [error, setError] = useState(null);
  
  // Booking Selection State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  // Search state
  const [citySearch, setCitySearch] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name);
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone || '');
    }

    fetchDashboardData();
    fetchVenues(); // Basic fetch on load
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/customer-login');

      const eventRes = await fetch('http://localhost:5000/api/events/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (eventRes.ok) setEvents(await eventRes.json());

      const bookingRes = await fetch('http://localhost:5000/api/bookings/customer', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bookingRes.ok) setBookings(await bookingRes.json());
      
    } catch (err) {
      console.error("Failed to fetch customer dashboard data", err);
    }
  };

  const fetchVenues = async (lat = null, lon = null, city = null) => {
    try {
      let url = 'http://localhost:5000/api/venues';
      if (lat && lon) {
        url = `http://localhost:5000/api/venues/nearby?lat=${lat}&lon=${lon}`;
      } else if (city) {
        url += `?city=${city}`;
      }
      
      const venueRes = await fetch(url);
      if(venueRes.ok) {
        const data = await venueRes.json();
        setAvailableHalls(data);
      }
    } catch (err) {
      console.error("Venue fetch error", err);
    }
  };

  const handleGPSFetch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchVenues(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          alert('GPS Access Denied or Unavailable. Falling back to default list.');
          fetchVenues();
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    fetchVenues(null, null, citySearch);
  };

  const openBookingModal = (hall) => {
    if (events.length === 0) {
      alert('You must create an Event first before you can book a venue!');
      return;
    }
    setSelectedVenue(hall);
    setSelectedEventId(events[0].event_id); // Default select the first event
    setIsModalOpen(true);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const eventDateStr = events.find(e => parseInt(e.event_id) === parseInt(selectedEventId))?.event_date;

        if (!eventDateStr) {
            alert("No valid event selected.");
            return; 
        }

        const payload = {
            event_id: selectedEventId,
            venue_id: selectedVenue.id,
            event_date: eventDateStr.split('T')[0] // Safely grab YYYY-MM-DD
        };

        const response = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('Booking request sent successfully!');
            setIsModalOpen(false);
            fetchDashboardData(); // Refresh dynamically
            setActiveTab('events');
        } else {
            alert(`Booking Rejected: ${data.message}`);
        }
    } catch(err) {
        alert('Network error while requesting booking.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if(!window.confirm("Are you sure you want to completely delete this event? This will also permanently cancel any associated venue bookings!")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        setEvents(events.filter(e => e.event_id !== eventId));
        fetchDashboardData(); 
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete event');
      }
    } catch(err) {
      alert('Network error deleting event');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // --- Budget State ---
  const BUDGET_CATEGORIES = [
    { name: 'Venue', icon: 'fa-building', color: '#FEC016' },
    { name: 'Catering', icon: 'fa-utensils', color: '#FF6B6B' },
    { name: 'Decoration', icon: 'fa-paint-brush', color: '#48BB78' },
    { name: 'Photography', icon: 'fa-camera', color: '#4299E1' },
    { name: 'Music & DJ', icon: 'fa-music', color: '#9F7AEA' },
    { name: 'Attire', icon: 'fa-tshirt', color: '#ED8936' },
    { name: 'Invitations', icon: 'fa-envelope', color: '#38B2AC' },
    { name: 'Transport', icon: 'fa-car', color: '#E53E3E' },
    { name: 'Gifts', icon: 'fa-gift', color: '#D53F8C' },
    { name: 'Other', icon: 'fa-ellipsis-h', color: '#718096' },
  ];

  const [totalBudget, setTotalBudget] = useState(() => {
    return parseInt(localStorage.getItem('vv_budget_total') || '500000');
  });
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vv_budget_expenses') || '[]'); } catch { return []; }
  });
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Venue' });
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(totalBudget);

  useEffect(() => {
    localStorage.setItem('vv_budget_total', totalBudget);
  }, [totalBudget]);
  useEffect(() => {
    localStorage.setItem('vv_budget_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const categoryTotals = BUDGET_CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.name).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const addExpense = (e) => {
    e.preventDefault();
    if (!newExpense.name.trim() || !newExpense.amount) return;
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) return;
    setExpenses([...expenses, {
      id: Date.now(),
      name: newExpense.name.trim(),
      amount,
      category: newExpense.category,
      date: new Date().toISOString(),
    }]);
    setNewExpense({ name: '', amount: '', category: newExpense.category });
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const saveBudget = () => {
    const val = parseInt(tempBudget);
    if (!isNaN(val) && val > 0) setTotalBudget(val);
    setEditingBudget(false);
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
        setUserName(data.user.name);
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
      case 'events':
        return (
          <>
            <h2>My Events & Bookings
              <p style={{fontSize: '12px', color: '#666'}}>(Select Venue to Confirm Booking)</p>
            </h2>
            {(events.length === 0 && bookings.length === 0) ? (
              <p>No bookings or events found. Start by exploring nearby halls or creating a personal event!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {events.map((evt) => (
                  <div key={`evt-${evt.event_id}`} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '15px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Event Created: {evt.name}</h4>
                      <p style={{ margin: '0 0 5px 0', color: '#555' }}><strong>Date:</strong> {new Date(evt.event_date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: '#e2f0d9', color: '#385623' }}>
                        Active Plan
                      </span>
                      <MagneticButton radius={60} strength={0.3}>
                        <button onClick={() => handleDeleteEvent(evt.event_id)} className="btn-outline" style={{ border: '1px solid #ff4d4f', color: '#ff4d4f', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </MagneticButton>
                    </div>
                  </div>
                ))}
                
                {bookings.map((booking) => (
                    <div key={`booking-${booking.id}`} style={{ padding: '20px', border: '1px solid #b3d7ff', borderRadius: '15px', background: '#f8fbff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,100,255,0.05)' }}>
                        <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Venue Connected: {booking.hallName}</h4>
                        <p style={{ margin: '0 0 5px 0', color: '#0056b3' }}>Linked Event: {booking.eventName}</p>
                        <p style={{ margin: '0 0 5px 0', color: '#555' }}><strong>Booking Date:</strong> {new Date(booking.eventDate).toLocaleDateString()}</p>
                        
                        {/* Bi-Directional Details Render if Accepted */}
                        {booking.status === 'Accepted' && (
                          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(40, 167, 69, 0.1)', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#155724' }}><strong>Vendor Name:</strong> {booking.vendorName}</p>
                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#155724' }}><strong>Contact Email:</strong> <a href={`mailto:${booking.vendorEmail}`} style={{color:'#155724'}}>{booking.vendorEmail}</a></p>
                            {booking.vendorContact && <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#155724' }}><strong>Phone:</strong> <a href={`tel:${booking.vendorContact}`} style={{color:'#155724'}}>{booking.vendorContact}</a></p>}
                            <p style={{ margin: '0', fontSize: '13px', color: '#155724' }}><strong>Directions:</strong> {booking.venueLocation}</p>
                          </div>
                        )}
                        </div>
                        <div>
                            <span style={{ 
                                padding: '6px 14px', 
                                borderRadius: '20px', 
                                fontSize: '13px', 
                                fontWeight: 'bold',
                                background: booking.status === 'Pending' ? '#fff3cd' : booking.status === 'Accepted' ? '#d4edda' : '#f8d7da',
                                color: booking.status === 'Pending' ? '#856404' : booking.status === 'Accepted' ? '#155724' : '#721c24'
                            }}>
                                Request {booking.status}
                            </span>
                        </div>
                    </div>

                ))}
              </div>
            )}
          </>
        );
      case 'nearby':
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
              <h2>Nearby Wedding Halls</h2>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <form onSubmit={handleCitySearch} style={{ display: 'flex' }}>
                   <input 
                      type="text" 
                      placeholder="Search by City..." 
                      value={citySearch}
                      onChange={e => setCitySearch(e.target.value)}
                      style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '8px 0 0 8px' }}
                   />
                   <MagneticButton radius={50} strength={0.25}>
                     <button type="submit" className="btn-primary" style={{ borderRadius: '0 8px 8px 0', padding: '8px 15px' }}>
                       <i className="fas fa-search"></i>
                     </button>
                   </MagneticButton>
                </form>
                <MagneticButton radius={60} strength={0.3}>
                  <button onClick={handleGPSFetch} className="btn-primary" style={{ padding: '8px 15px', borderRadius: '8px', background: '#28a745' }}>
                    <i className="fas fa-location-arrow"></i> Use GPS
                  </button>
                </MagneticButton>
              </div>
            </div>

            {availableHalls.length === 0 && <p style={{ color: '#d9534f', marginTop: '20px' }}>No venues found.</p>}
            <p style={{ marginBottom: '20px', marginTop:'20px' }}>Showing premium venues connecting you to top vendors...</p>
            
            <div className="dashboard-grid">
              {availableHalls.map((hall) => (
                <div key={hall.id} className="venue-card">
                  <img 
                    src={hall.image && hall.image !== 'null' ? hall.image : '/assets/wedding.avif'} 
                    alt={hall.name} 
                    className="venue-image" 
                    onError={(e) => { e.target.onerror = null; e.target.src = '/assets/wedding.avif'; }}
                  />
                  <div className="venue-details">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <h3>{hall.name}</h3>
                        {hall.distance && <span style={{fontSize:'12px', color:'#28a745', fontWeight:'bold'}}>{parseFloat(hall.distance).toFixed(1)} km</span>}
                    </div>
                    <p><i className="fas fa-map-marker-alt" style={{marginRight: '6px', color: 'var(--primary)'}}></i> {hall.location}, {hall.city}</p>
                    <div className="venue-price">{hall.price}</div>
                    <MagneticButton style={{ width: '100%', marginTop: 'auto' }}>
                      <button onClick={() => openBookingModal(hall)} className="btn-primary" style={{ width: '100%' }}>
                         Select & Book <i className="fas fa-arrow-right" style={{marginLeft: '6px'}}></i>
                      </button>
                    </MagneticButton>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Logic */}
            {isModalOpen && selectedVenue && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px' }}>
                  <h3 style={{ marginBottom: '15px' }}>Confirm Booking</h3>
                  <p><strong>Venue:</strong> {selectedVenue.name}</p>
                  
                  <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                     <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Your Event:</label>
                     <select 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                     >
                       {events.map(ev => (
                         <option key={ev.event_id} value={ev.event_id}>
                            {ev.name} ({new Date(ev.event_date).toLocaleDateString()})
                         </option>
                       ))}
                     </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <MagneticButton style={{ flex: 1 }}>
                      <button onClick={submitBooking} className="btn-primary" style={{ width: '100%' }}>Submit Request</button>
                    </MagneticButton>
                    <MagneticButton style={{ flex: 1 }}>
                      <button onClick={() => setIsModalOpen(false)} className="btn-outline" style={{ width: '100%' }}>Cancel</button>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case 'budget': {
        // SVG donut chart
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        const dashOffset = circumference - (spentPercent / 100) * circumference;
        const statusColor = spentPercent > 90 ? '#E53E3E' : spentPercent > 70 ? '#ED8936' : '#48BB78';

        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ margin: 0 }}><i className="fas fa-wallet" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>Budget Tracker</h2>
            </div>

            {/* ── Summary Cards Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              {/* Total Budget Card */}
              <div style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Total Budget</div>
                {editingBudget ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={tempBudget}
                      onChange={e => setTempBudget(e.target.value)}
                      style={{ width: '140px', padding: '8px 12px', border: '2px solid var(--primary)', borderRadius: '8px', fontSize: '18px', fontWeight: 700 }}
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && saveBudget()}
                    />
                    <button onClick={saveBudget} style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}><i className="fas fa-check"></i></button>
                    <button onClick={() => setEditingBudget(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 800, color: '#111' }}>₹{totalBudget.toLocaleString('en-IN')}</span>
                    <button onClick={() => { setTempBudget(totalBudget); setEditingBudget(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '14px' }}><i className="fas fa-pencil-alt"></i></button>
                  </div>
                )}
              </div>

              {/* Spent Card */}
              <div style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Spent</div>
                <span style={{ fontSize: '28px', fontWeight: 800, color: statusColor }}>₹{totalSpent.toLocaleString('en-IN')}</span>
                <div style={{ marginTop: '10px', height: '6px', borderRadius: '3px', background: '#f3f4f6', overflow: 'hidden' }}>
                  <div style={{ width: `${spentPercent}%`, height: '100%', borderRadius: '3px', background: statusColor, transition: 'width 0.5s ease' }}></div>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{spentPercent.toFixed(1)}% of budget</div>
              </div>

              {/* Remaining Card */}
              <div style={{ padding: '24px', borderRadius: '16px', background: remaining < 0 ? '#FFF5F5' : '#F0FFF4', border: `1px solid ${remaining < 0 ? '#FED7D7' : '#C6F6D5'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Remaining</div>
                <span style={{ fontSize: '28px', fontWeight: 800, color: remaining < 0 ? '#E53E3E' : '#22543D' }}>₹{Math.abs(remaining).toLocaleString('en-IN')}</span>
                {remaining < 0 && <div style={{ fontSize: '12px', color: '#E53E3E', marginTop: '6px', fontWeight: 600 }}><i className="fas fa-exclamation-triangle" style={{ marginRight: '4px' }}></i>Over budget!</div>}
              </div>
            </div>

            {/* ── Chart + Add Form Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', marginBottom: '28px' }}>

              {/* Donut Chart */}
              <div style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#374151' }}>Spending Overview</div>
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="90" cy="90" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="14" />
                  <circle
                    cx="90" cy="90" r={radius} fill="none"
                    stroke={statusColor}
                    strokeWidth="14"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
                  />
                </svg>
                <div style={{ marginTop: '-120px', marginBottom: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#111' }}>{spentPercent.toFixed(0)}%</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>used</div>
                </div>

                {/* Category Legend */}
                <div style={{ width: '100%', marginTop: '8px' }}>
                  {categoryTotals.slice(0, 5).map(cat => (
                    <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f9fafb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }}></div>
                        <span style={{ fontSize: '13px', color: '#374151' }}>{cat.name}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>₹{cat.total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {categoryTotals.length === 0 && <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>No expenses yet</p>}
                </div>
              </div>

              {/* Add Expense + Category Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Add Expense Form */}
                <div style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#374151' }}><i className="fas fa-plus-circle" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>Add Expense</div>
                  <form onSubmit={addExpense} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 150px auto', gap: '10px', alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>Description</label>
                      <input
                        type="text" placeholder="e.g. Florist deposit"
                        value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', background: '#f9fafb' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>Amount (₹)</label>
                      <input
                        type="number" placeholder="0"
                        value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', background: '#f9fafb' }}
                        required min="1"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>Category</label>
                      <select
                        value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', background: '#f9fafb', cursor: 'pointer' }}
                      >
                        {BUDGET_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <MagneticButton radius={50} strength={0.3}>
                      <button type="submit" className="btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                        <i className="fas fa-plus"></i> Add
                      </button>
                    </MagneticButton>
                  </form>
                </div>

                {/* Category Breakdown Bars */}
                <div style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#374151' }}>Category Breakdown</div>
                  {categoryTotals.length === 0 && <p style={{ fontSize: '14px', color: '#9ca3af' }}>Add expenses to see the breakdown here.</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {categoryTotals.map(cat => {
                      const catPercent = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
                      return (
                        <div key={cat.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <i className={`fas ${cat.icon}`} style={{ color: cat.color, width: '16px', textAlign: 'center' }}></i> {cat.name}
                            </span>
                            <span style={{ fontSize: '13px', color: '#6b7280' }}>₹{cat.total.toLocaleString('en-IN')} ({catPercent.toFixed(0)}%)</span>
                          </div>
                          <div style={{ height: '8px', borderRadius: '4px', background: '#f3f4f6', overflow: 'hidden' }}>
                            <div style={{ width: `${catPercent}%`, height: '100%', borderRadius: '4px', background: cat.color, transition: 'width 0.5s ease' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Expense History ── */}
            <div style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#374151' }}><i className="fas fa-history" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>Expense History ({expenses.length})</div>
              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                  <i className="fas fa-receipt" style={{ fontSize: '40px', display: 'block', marginBottom: '12px', color: '#e5e7eb' }}></i>
                  <p style={{ margin: 0 }}>No expenses recorded yet. Add your first expense above!</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...expenses].reverse().map(exp => {
                        const cat = BUDGET_CATEGORIES.find(c => c.name === exp.category) || BUDGET_CATEGORIES[9];
                        return (
                          <tr key={exp.id} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '12px', fontSize: '14px', fontWeight: 500 }}>{exp.name}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: `${cat.color}15`, color: cat.color, fontSize: '12px', fontWeight: 600 }}>
                                <i className={`fas ${cat.icon}`} style={{ fontSize: '10px' }}></i> {exp.category}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 700 }}>₹{exp.amount.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: '13px', transition: 'color 0.15s' }}
                                onMouseEnter={e => e.target.style.color = '#E53E3E'}
                                onMouseLeave={e => e.target.style.color = '#d1d5db'}
                              ><i className="fas fa-trash-alt"></i></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );
      }
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
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-muted)' }}>| Customer Portal</span>
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
             <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '700' }}>Welcome back</div>
             <div className="sidebar-user">{userName}</div>
          </div>
          
          <div className="sidebar-nav">
             <button className={`nav-item ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                <i className="fas fa-calendar-check"></i> My Events
             </button>
             <button className={`nav-item ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')}>
                <i className="fas fa-search-location"></i> Search Venues
             </button>
             <button className={`nav-item ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
                <i className="fas fa-wallet"></i> Budget Tracker
             </button>
             <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <i className="fas fa-user-cog"></i> Profile Settings
             </button>
             
             <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }}></div>
             
             <MagneticButton>
               <Link to="/create-event" className="btn-primary" style={{ textAlign: 'center', margin: '0 16px', borderRadius: '8px' }}>
                  <i className="fas fa-plus"></i> New Event
               </Link>
             </MagneticButton>
          </div>
        </aside>

        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default CustomerDashboard;
