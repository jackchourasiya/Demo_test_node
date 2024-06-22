// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get the token from the header
  const token = req.header('Authorization');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded   = jwt.verify(token, 'sourabh');
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
