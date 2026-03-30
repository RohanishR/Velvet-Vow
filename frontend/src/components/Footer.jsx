const Footer = () => {
  return (
    <footer>
      <div className="container footer-wrapper">
        <div className="footer-left">
          <strong>The Velvet Vow</strong>
          <a href="#">About</a>
          <a href="#">Learn more</a>
          <a href="#">Support</a>
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
    </footer>
  );
};

export default Footer;
