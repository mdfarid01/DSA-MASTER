const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { users } = require('../data/store');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please add all fields' });
        }

        // Fallback if DB not connected
        if (mongoose.connection.readyState !== 1) {
            console.log('Using In-Memory Auth (Fallback)');
            const userExists = users.find(u => u.email === email);
            if (userExists) return res.status(400).json({ msg: 'User already exists' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                _id: Date.now().toString(),
                name,
                email,
                password: hashedPassword,
                progress: {}
            };
            users.push(newUser);

            return res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                token: generateToken(newUser._id),
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ msg: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fallback if DB not connected
        if (mongoose.connection.readyState !== 1) {
            const user = users.find(u => u.email === email);
            if (user && (await bcrypt.compare(password, user.password))) {
                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id),
                });
            }
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ msg: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // Fallback if DB not connected
        if (mongoose.connection.readyState !== 1) {
            const user = users.find(u => u._id === req.user.id);
            if (!user) return res.status(404).json({ msg: 'User not found' });
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                progress: user.progress || {}
            });
        }

        const user = await User.findById(req.user.id);
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            progress: user.progress
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
};
