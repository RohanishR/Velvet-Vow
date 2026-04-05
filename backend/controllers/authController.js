const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @route   POST /api/auth/register
// @desc    Register a user (customer or vendor)
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (role !== 'customer' && role !== 'vendor') {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    // Check if user already exists
    const [existingUsers] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into DB
    const [result] = await db.execute(
      'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ 
      message: 'User registered successfully!', 
      userId: result.insertId 
    });

  } catch (err) {
    console.error('Registration Error: ', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate/Login a user & get token
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Search for user
    const [users] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Sign JWT
    const payload = {
      user: {
        id: user.user_id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          }
        });
      }
    );

  } catch (err) {
    console.error('Login Error: ', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};
