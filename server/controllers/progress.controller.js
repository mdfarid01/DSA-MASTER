const User = require('../models/User');
const mongoose = require('mongoose');
const { users } = require('../data/store');

// @desc    Update solved status
// @route   POST /api/progress/solve
// @access  Private
exports.solveQuestion = async (req, res) => {
    const { topicSlug, questionSlug } = req.body;
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }

    try {
        // Fallback: In-Memory Store
        if (mongoose.connection.readyState !== 1) {
            console.log('Using In-Memory Progress (Fallback)');
            const user = users.find(u => u._id === userId);
            if (!user) return res.status(404).json({ msg: 'User not found' });

            // Initialize progress map if needed (as object for in-memory)
            if (!user.progress) user.progress = {};
            if (!user.progress[topicSlug]) {
                user.progress[topicSlug] = { solved: [], lastQuestion: null };
            }

            const topicProgress = user.progress[topicSlug];

            // Add to solved
            if (!topicProgress.solved.includes(questionSlug)) {
                topicProgress.solved.push(questionSlug);
            }
            topicProgress.lastQuestion = questionSlug;
            user.lastVisitedTopic = topicSlug;

            return res.json(user.progress);
        }

        // MongoDB Logic
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Initialize topic in progress map if not exists
        if (!user.progress.get(topicSlug)) {
            user.progress.set(topicSlug, { solved: [], lastQuestion: null });
        }

        const topicProgress = user.progress.get(topicSlug);

        // Add to solved if not already solved
        if (!topicProgress.solved.includes(questionSlug)) {
            topicProgress.solved.push(questionSlug);
        }

        topicProgress.lastQuestion = questionSlug;
        user.lastVisitedTopic = topicSlug;

        // We have to set it back to trigger mongoose change tracking for Map
        user.progress.set(topicSlug, topicProgress);

        await user.save();
        res.json(user.progress);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user progress
// @route   GET /api/progress/:userId (or just use /me from auth)
// @access  Private
exports.getProgress = async (req, res) => {
    // Note: Usually we get progress via /auth/me, but keeping this for flexibility
    // Using req.user.id from middleware if available, or param
    const userId = req.params.userId || req.user.id;

    try {
        if (mongoose.connection.readyState !== 1) {
            const user = users.find(u => u._id === userId);
            if (!user) return res.status(404).json({ msg: 'User not found' });
            return res.json({
                progress: user.progress || {},
                lastVisitedTopic: user.lastVisitedTopic
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({
            progress: user.progress,
            lastVisitedTopic: user.lastVisitedTopic
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
