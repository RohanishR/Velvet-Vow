import { useState } from 'react';

const Footer = () => {
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <footer>
      <div className="container footer-wrapper">
        <div className="footer-left">
          <strong>The Velvet Vow</strong>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowContact(!showContact); setShowLearnMore(false); }}>
            Contact Us {showContact ? '▲' : '▼'}
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLearnMore(!showLearnMore); setShowContact(false); }}>
            Learn more {showLearnMore ? '▲' : '▼'}
          </a>
        </div>

        <div className="footer-right">
          <a href="https://instagram.com/rohanishraman" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>

          <a href="https://linkedin.com/in/ramanrohanish" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin-in"></i>
          </a>

          <a href="https://twitter.com/rrohanish" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-x-twitter"></i>
          </a>
        </div>
      </div>

      <div className={`learn-more-dropdown ${showContact ? 'open' : ''}`}>
        <div className="container" style={{ padding: showContact ? '30px 0' : '0' }}>
          <h4 style={{ fontSize: '18px', marginBottom: '10px', color: '#111' }}>Dedicated Support</h4>
          <p style={{ color: '#555', lineHeight: '1.6', fontSize: '14.5px', marginBottom: '20px' }}>
            Looking to partner as a Vendor, or having trouble scheduling a Customer Event? We manually process direct inquiries through our core engineering inbox. velvetvow2026@gmail.com
          </p>
          <a href="mailto:velvetvow2026@gmail.com?subject=Event Booking Inquiry&body=Hello! I am reaching out to The Velvet Vow regarding..." style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 24px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '15px' }}>
            <i className="fas fa-envelope" style={{ marginRight: '10px' }}></i> velvetvow2026@gmail.com
          </a>
        </div>
      </div>

      <div className={`learn-more-dropdown ${showLearnMore ? 'open' : ''}`}>
        <div className="container" style={{ padding: showLearnMore ? '30px 0' : '0' }}>
          <h4 style={{ fontSize: '18px', marginBottom: '10px', color: '#111' }}>About The Velvet Vow</h4>
          <p style={{ color: '#555', lineHeight: '1.6', fontSize: '14.5px', marginBottom: '10px' }}>
            The Velvet Vow is an elite algorithmic platform designed to bridge the gap between customers looking to throw the perfect event and the premium vendors operating within their desired radius.
            Created with the intention of eliminating the friction of scattered negotiations, it utilizes <strong>Geolocation Architecture</strong> and <strong>Strict Database Concurrency</strong> to mathematically ensure 100% booking success and eliminate double-booking errors.
          </p>
          <p style={{ color: '#555', lineHeight: '1.6', fontSize: '14.5px' }}>
            <strong>How to use:</strong> Start by searching for active Halls visually on our interactive Map. Once you're ready, create a Customer profile to construct your specific event outline, and physically request bookings directly to our verified network of Event Managers. Wait for the respective Event Manager to securely accept the payload across the database pipeline, and your event is officially scheduled!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
