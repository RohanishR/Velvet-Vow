import { Link } from 'react-router-dom';
import MagneticButton from './MagneticButton';

const Modal = ({ isOpen, onClose, mode }) => {
  if (!isOpen) return null;

  return (
    <div className="modal active" id="loginModal" style={{ display: 'flex', zIndex: 1000 }} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h3>{mode === 'signup' ? 'Select Sign Up Type' : 'Select Login Type'}</h3>
        <MagneticButton style={{ width: '100%' }}>
          <Link 
              to={mode === 'signup' ? "/customer-signup" : "/customer-login"} 
              className="modal-btn" 
              onClick={onClose}
          >
              {mode === 'signup' ? 'Customer Sign Up' : 'Customer Login'}
          </Link>
        </MagneticButton>
        <MagneticButton style={{ width: '100%' }}>
          <Link 
              to={mode === 'signup' ? "/manager-signup" : "/manager-login"} 
              className="modal-btn" 
              onClick={onClose}
          >
              {mode === 'signup' ? 'Event Manager Sign Up' : 'Event Manager Login'}
          </Link>
        </MagneticButton>
      </div>
    </div>
  );
};

export default Modal;
