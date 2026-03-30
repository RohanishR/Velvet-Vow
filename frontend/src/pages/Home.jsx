import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = ({ onOpenModal }) => {
  useEffect(() => {
    let map;
    let userMarker;

    const initMap = () => {
      if (document.getElementById('map') && !document.getElementById('map')._leaflet_id) {
        map = window.L.map('map').setView([20.5937, 78.9629], 5);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        detectLocation();
      }
    };

    const detectLocation = () => {
      if (!navigator.geolocation) {
        const loader = document.getElementById("mapLoader");
        if(loader) loader.style.display = "none";
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function (position) {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          userMarker = window.L.marker([lat, lon])
            .addTo(map)
            .bindPopup("📍 You are here")
            .openPopup();

          map.setView([lat, lon], 14);

          addNearbyEvents(lat, lon);

          const loader = document.getElementById("mapLoader");
          if (loader) {
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 400);
          }
        }
      );
    };

    const addNearbyEvents = (lat, lon) => {
      const events = [
        { name: "Wedding Hall", lat: lat + 0.01, lon: lon + 0.01 },
        { name: "Birthday Venue", lat: lat - 0.008, lon: lon + 0.005 },
        { name: "Corporate Event Space", lat: lat + 0.006, lon: lon - 0.01 }
      ];

      events.forEach(event => {
        window.L.marker([event.lat, event.lon])
          .addTo(map)
          .bindPopup("🎉 " + event.name);
      });
    };

    initMap();

    // Scroll animation
    const handleScroll = () => {
      const elements = document.querySelectorAll(".two-column, .feature-box");
      elements.forEach(el => {
        const position = el.getBoundingClientRect().top;
        const screenHeight = window.innerHeight;
        if (position < screenHeight - 100) {
          el.classList.add("show");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (map) {
        map.remove();
      }
    };
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero container">
        <h1>The Velvet Vow</h1>
        <p className="subtitle">Plan Weddings, Parties & Corporate Events Effortlessly</p>

        <div className="hero-buttons">
          <button onClick={onOpenModal} className="btn-primary small">Get Started</button>
        </div>

        <div className="map-container">
          <section className="map-section">
            <div className="map-card">
              <h3 className="map-title">Events near you</h3>
              <div id="map" style={{ height: '300px' }}></div>
              <div className="map-loader" id="mapLoader">
                <div className="spinner"></div>
                <p>Detecting your location...</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="partners">
        <p className="section-label">Our Most Trusted Partner</p>

        <div className="logo-slider">
          <div className="logo-track">
            <span>The Wedding Design Company (WDC)</span>
            <span>Shaadi Squad</span>
            <span>Motwane Entertainment & Weddings</span>
            <span>Wedniksha</span>
            <span>Devika Narain & Company</span>

            {/* Duplicate for smooth infinite effect */}
            <span>The Wedding Design Company (WDC)</span>
            <span>Shaadi Squad</span>
            <span>Motwane Entertainment & Weddings</span>
            <span>Wedniksha</span>
            <span>Devika Narain & Company</span>
          </div>
        </div>
      </section>

      {/* CUSTOMER */}
      <section className="two-column container">
        <div className="text-block">
          <h2>Customer</h2>
          <p>Be our customer and arrange an event with confirmed discounts.</p>
          <div className="button-group">
            <Link to="/customer-login" className="btn-primary">Login</Link>
            <Link to="/customer-signup" className="btn-outline">Sign Up</Link>
          </div>
        </div>
        <div className="image-container">
          <img src="assets/wedding.avif" alt="Wedding Event" />
        </div>
      </section>

      {/* EVENT MANAGER */}
      <section className="two-column container">
        <div className="image-container">
          <img src="assets/wedding_2.jpg" alt="Wedding Event" />
        </div>

        <div className="text-block">
          <h2>Event Manager</h2>
          <p>Are you vendor? Get your customers through our site by joing with us.</p>
          <div className="button-group">
            <Link to="/manager-login" className="btn-primary">Login</Link>
            <Link to="/manager-signup" className="btn-outline">Sign Up</Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="container feature-wrapper">
          <div className="feature-box">
            <h3>Smart Event Planning</h3>
            <p>Plan weddings, parties, and corporate events effortlessly in one place. From venue booking to vendor coordination, manage everything through a single, easy-to-use dashboard.</p>
          </div>

          <div className="feature-box">
            <h3>Verified Vendors & Venues</h3>
            <p>Discover trusted wedding halls, decorators, caterers, and photographers near you. Compare services, check availability, and book instantly with confidence.</p>
          </div>

          <div className="feature-box">
            <h3>Budget & Real-Time Tracking</h3>
            <p>Stay in control of your event expenses with smart budget tracking and live updates. Monitor bookings, payments, and schedules in real time.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
