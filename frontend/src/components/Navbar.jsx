import { Link } from 'react-router-dom';

const Navbar = ({ onOpenModal }) => {
  return (
    <nav className="navbar">
      <div className="container nav-wrapper">
        <h2 className="logo">The Velvet Vow</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="/#about">About</a>
          <button onClick={onOpenModal} className="btn-primary small">Login</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
