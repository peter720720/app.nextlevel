const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() }).populate('schoolId');
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        token,
        user: { id: user._id, firstName: user.firstName, role: user.role, school: user.schoolId }
      });
    }
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
