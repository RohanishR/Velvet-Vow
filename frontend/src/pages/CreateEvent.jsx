import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MagneticButton from '../components/MagneticButton';

const CreateEvent = () => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [cateringType, setCateringType] = useState('');
  const [eventType, setEventType] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Strict Validations
    if (!name || !members || !eventDate || !contactNumber || !city || !cateringType || !eventType) {
      setError('All fields are required.');
      return;
    }

    if (parseInt(members) <= 0) {
      setError('Number of members must be greater than 0.');
      return;
    }

    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time for accurate day comparison
    if (selectedDate <= today) {
      setError('Event date must be in the future.');
      return;
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      setError('Contact number must be exactly 10 digits.');
      return;
    }

    // Submit to Backend
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/customer-login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          members: parseInt(members),
          event_date: eventDate,
          contact_number: contactNumber,
          city,
          catering_type: cateringType,
          event_type: eventType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create event.');
        return;
      }

      // Success
      const modal = document.getElementById("successModal");
      if (modal) {
        modal.style.display = 'block';
        setTimeout(() => {
          modal.style.display = 'none';
          navigate('/dashboard-customer');
        }, 1500);
      }
    } catch (err) {
      setError('Server error. Ensure backend is running.');
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg,#f9fafc,#eef2f7)', minHeight: '100vh', padding: '1px' }}>
      <style>
        {`
        .form-container {
          max-width: 700px;
          margin: 100px auto;
          background: #fff;
          padding: 50px;
          border-radius: 25px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
        }
        .form-container h2 {
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #ccc;
          font-size: 14px;
        }
        .submit-btn {
          margin-top: 10px;
          padding: 14px 30px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: 0.3s;
          width: 100%;
          font-weight: bold;
        }
        .submit-btn:hover {
          background: #222;
        }
        `}
      </style>

      <div className="form-container">
        <h2>Create New Event</h2>
        
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Name</label>
            <input type="text" placeholder="Enter event name" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Number of Members</label>
            <input type="number" placeholder="Enter number of guests" value={members} onChange={e => setMembers(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Event Date</label>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input type="tel" placeholder="Enter exactly 10 digit number" value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Closest City Address</label>
            <input type="text" placeholder="Enter city/location" value={city} onChange={e => setCity(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Catering Type</label>
            <select value={cateringType} onChange={e => setCateringType(e.target.value)}>
              <option value="">Select Catering Type</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div className="form-group">
            <label>Type of Event</label>
            <select value={eventType} onChange={e => setEventType(e.target.value)}>
              <option value="">Select Event Type</option>
              <option value="Wedding">Wedding</option>
              <option value="Birthday Party">Birthday Party</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Engagement">Engagement</option>
              <option value="Reception">Reception</option>
            </select>
          </div>

          <MagneticButton style={{ width: '100%' }}>
            <button type="submit" className="submit-btn"><i className="fas fa-check-circle"></i> Submit Event</button>
          </MagneticButton>
        </form>
      </div>

      <div id="successModal" className="success-modal">
        <div className="success-box">
          Event Created Successfully 🎉
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
