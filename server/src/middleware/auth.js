import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT Bearer token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'civiceye_jwt_secret_2026');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed verification',
    });
  }
};

// Role-Based Access Control (RBAC)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

// Department Scope Isolation: Dept heads and verifiers can only access their own department
export const departmentScope = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next(); // Admin has unrestricted city-wide access
  }

  const userDept = req.user.department;
  if (!userDept) {
    return res.status(403).json({
      success: false,
      message: 'No departmental assignment found for this user account',
    });
  }

  // Bind department constraint to req for controllers to filter by
  req.scopedDepartment = userDept;
  next();
};
