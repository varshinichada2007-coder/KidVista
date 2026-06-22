const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_kidvista_2026';

// Middleware to authenticate user and decode token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token missing or invalid.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is expired or invalid.' });
  }
};

// Middleware to restrict access based on roles
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
