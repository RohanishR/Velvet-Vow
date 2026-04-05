const db = require('../config/db');
const bcrypt = require('bcrypt');

// @route   PUT /api/users/profile
// @desc    Update user profile data (name, email, optional password)
// @access  Private
exports.updateProfile = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const user_id = req.user.id;

  try {
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    // Check if new email is already taken by someone else
    const [existingUsers] = await db.execute('SELECT user_id FROM Users WHERE email = ? AND user_id != ?', [email, user_id]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email is already in use by another account.' });
    }

    if (password && password.trim().length > 0) {
      // User is updating their password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await db.execute('UPDATE Users SET name = ?, email = ?, phone = ?, password = ? WHERE user_id = ?', [name, email, phone || null, hashedPassword, user_id]);
    } else {
      // Standard update without password change
      await db.execute('UPDATE Users SET name = ?, email = ?, phone = ? WHERE user_id = ?', [name, email, phone || null, user_id]);
    }

    // Fetch the updated user profile to return to the frontend
    const [updatedUser] = await db.execute('SELECT user_id, name, email, phone, role FROM Users WHERE user_id = ?', [user_id]);
    
    res.status(200).json({ 
      message: 'Profile updated successfully!',
      user: updatedUser[0]
    });

  } catch (err) {
    console.error('Profile Update Error: ', err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};
