import { Link } from 'react-router-dom';

const Navbar = ({ onOpenModal }) => {
  return (
    <nav className="navbar">
      <div className="container nav-wrapper">
        <h2 className="logo">The Velvet Vow</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/">About</Link>
          <Link to="/">Services</Link>
          <button onClick={onOpenModal} className="btn-primary small">Login</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
