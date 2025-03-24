// middleware/roleMiddleware.js
const roleMiddleware = (allowedRoles) => (req, res, next) => {
    // Ensure the user is authenticated (req.user should exist from authMiddleware)
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied. User role not found.' });
    }
  
    // Check if the user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}` });
    }
  
    next();
  };
  
  export default roleMiddleware;