const jwt = require('jsonwebtoken');
const prisma = require('../models/prisma');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      const error = new Error('Not authorized, no token');
      error.statusCode = 401;
      return next(error);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      const error = new Error('Not authorized, user not found');
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    const error = new Error('Not authorized, token failed');
    error.statusCode = 401;
    next(error);
  }
};

module.exports = { protect };
