const adminProtect = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required before verifying administrative rights.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not possess administrator privileges to access this resource.',
    });
  }

  next();
};

module.exports = { adminProtect };
