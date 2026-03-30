import { Link } from 'react-router-dom';

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal" id="loginModal" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h3>Select Login Type</h3>
        <Link to="/customer-login" className="modal-btn" onClick={onClose}>Customer Login</Link>
        <Link to="/manager-login" className="modal-btn" onClick={onClose}>Event Manager Login</Link>
      </div>
    </div>
  );
};

export default Modal;
