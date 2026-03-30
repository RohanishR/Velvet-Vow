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
    if (userStr) setUserName(JSON.parse(userStr).name);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
                    <div>
                      <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', background: '#e2f0d9', color: '#385623' }}>
                        Active Plan
                      </span>
                    </div>
                  </div>
                ))}
                
                {bookings.map((booking) => (
                    <div key={`booking-${booking.id}`} style={{ padding: '20px', border: '1px solid #b3d7ff', borderRadius: '15px', background: '#f8fbff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,100,255,0.05)' }}>
                        <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Venue Connected: {booking.hallName}</h4>
                        <p style={{ margin: '0 0 5px 0', color: '#0056b3' }}>Linked Event: {booking.eventName}</p>
                        <p style={{ margin: '0 0 5px 0', color: '#555' }}><strong>Booking Date:</strong> {new Date(booking.eventDate).toLocaleDateString()}</p>
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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {availableHalls.map((hall) => (
                <div key={hall.id} style={{ border: '1px solid #eaeaea', borderRadius: '15px', overflow: 'hidden', background: '#fff' }}>
                  <img src={hall.image || '/assets/wedding.avif'} alt={hall.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{hall.name}</h3>
                        {hall.distance && <span style={{fontSize:'12px', color:'#28a745', fontWeight:'bold'}}>{parseFloat(hall.distance).toFixed(1)} km</span>}
                    </div>
                    <p style={{ margin: '0 0 5px 0', color: '#555' }}><i className="fas fa-map-marker-alt"></i> {hall.location}, {hall.city}</p>
                    <p style={{ margin: '0 0 15px 0', fontWeight: 'bold' }}>{hall.price}</p>
                    <button onClick={() => openBookingModal(hall)} className="btn-primary" style={{ width: '100%', padding: '10px' }}>Select & Book</button>
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
      default:
        return null;
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="container nav-wrapper">
          <h2>Customer Dashboard</h2>
          <button onClick={handleLogout} className="btn-outline small">Logout</button>
        </div>
      </nav>

      <section className="dashboard container">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>Welcome back, {userName}! 👋</h1>
          <p style={{ color: '#666' }}>Ready to plan your perfect event? Manage your bookings and discover new venues.</p>
        </div>

        <div className="dashboard-grid">
          <div className="add-event-card">
            <div className="add-event-text">
              <h2>Add Event</h2>
              <p>Start planning your wedding or celebration with smart tools and real-time tracking.</p>
              <Link to="/create-event" className="create-btn">
                <i className="fas fa-plus-circle"></i> Create Event
              </Link>
            </div>
            <div className="add-event-icon">
              <i className="fas fa-calendar-plus"></i>
            </div>
          </div>

          <div className={`dash-card ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
            <i className="fas fa-calendar-check"></i>
            <h3>My Events & Bookings</h3>
            <p>View and manage your bookings</p>
          </div>

          <div className={`dash-card ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')}>
            <i className="fas fa-map-marker-alt"></i>
            <h3>Nearby Wedding Halls</h3>
            <p>Find premium venues near you</p>
          </div>

          <div className={`dash-card ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
            <i className="fas fa-wallet"></i>
            <h3>Budget Tracker</h3>
            <p>Track your event expenses</p>
          </div>
        </div>

        <div id="content-panel" className="content-panel fade-in" style={{ marginTop: '30px' }}>
          {renderContent()}
        </div>
      </section>
    </>
  );
};

export default CustomerDashboard;
