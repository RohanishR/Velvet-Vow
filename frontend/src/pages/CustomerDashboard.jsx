import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
            <h2>My Events & Bookings</h2>
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
                      <button onClick={() => handleDeleteEvent(evt.event_id)} className="btn-outline" style={{ border: '1px solid #ff4d4f', color: '#ff4d4f', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fas fa-trash"></i> Delete
                      </button>
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
                   <button type="submit" className="btn-primary" style={{ borderRadius: '0 8px 8px 0', padding: '8px 15px' }}>
                     <i className="fas fa-search"></i>
                   </button>
                </form>
                <button onClick={handleGPSFetch} className="btn-primary" style={{ padding: '8px 15px', borderRadius: '8px', background: '#28a745' }}>
                  <i className="fas fa-location-arrow"></i> Use GPS
                </button>
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
                    <button onClick={() => openBookingModal(hall)} className="btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                       Select & Book <i className="fas fa-arrow-right" style={{marginLeft: '6px'}}></i>
                    </button>
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
                    <button onClick={submitBooking} className="btn-primary" style={{ flex: 1 }}>Submit Request</button>
                    <button onClick={() => setIsModalOpen(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      case 'budget':
        return (
          <>
            <h2>Budget Tracker</h2>
            <p>Total Budget: ₹5,00,000</p>
            <p>Spent: ₹2,75,000</p>
            <p>Remaining: ₹2,25,000</p>
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
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Changes</button>
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
          <button onClick={handleLogout} className="btn-outline">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
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
             
             <Link to="/create-event" className="btn-primary" style={{ textAlign: 'center', margin: '0 16px', borderRadius: '8px' }}>
                <i className="fas fa-plus"></i> New Event
             </Link>
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
