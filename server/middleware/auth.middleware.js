const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            if (mongoose.connection.readyState !== 1) {
                // In-Memory Fallback - attach minimal user info from token
                req.user = { id: decoded.id };
            } else {
                req.user = await User.findById(decoded.id).select('-password');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ msg: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ msg: 'Not authorized, no token' });
    }
};

module.exports = { protect };
