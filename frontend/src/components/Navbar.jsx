import { Link } from 'react-router-dom';
import MagneticButton from './MagneticButton';

const Navbar = ({ onOpenModal }) => {
  return (
    <nav className="navbar">
      <div className="container nav-wrapper">
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i></i> The Velvet Vow
        </Link>

        <div className="nav-links">
          <Link to="/"><i className="fas fa-home" style={{marginRight: '6px'}}></i> Home</Link>
          <a href="/#about"><i className="fas fa-info-circle" style={{marginRight: '6px'}}></i> About</a>
          <MagneticButton>
            <button onClick={onOpenModal} className="btn-primary">
              <i className="fas fa-user-circle"></i> Login Area
            </button>
          </MagneticButton>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
