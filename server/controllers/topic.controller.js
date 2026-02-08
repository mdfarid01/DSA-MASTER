const Topic = require('../models/Topic');
const Question = require('../models/Question');
const mongoose = require('mongoose');
const dsaTopics = require('../data/dsaTopics.json');
const axios = require('axios');

// Helper to transform JSON data to API format
const getFallbackTopics = () => {
    return Object.keys(dsaTopics).map(slug => ({
        ...dsaTopics[slug],
        slug: slug,
        questions: dsaTopics[slug].questions.map(q => ({ ...q, topic: slug }))
    }));
};

// @desc    Get all questions (flat list)
// @route   GET /api/topics/questions
// @access  Public
exports.getAllQuestions = async (req, res) => {
    try {
        // Fetch from Alfa LeetCode API
        // Using a limit to avoid overwhelming the frontend/network for now
        const response = await axios.get('https://alfa-leetcode-api.onrender.com/problems?limit=50');
        const externalQuestions = response.data.problemsetQuestionList;

        if (!externalQuestions) {
            // Fallback to local if API fails or returns empty
            return res.json(getFallbackTopics().flatMap(t => t.questions));
        }

        const mappedQuestions = externalQuestions.map(q => {
            // Map to our schema
            return {
                title: q.title,
                slug: q.titleSlug,
                difficulty: q.difficulty,
                leetcodeUrl: `https://leetcode.com/problems/${q.titleSlug}`,
                tags: q.topicTags ? q.topicTags.map(t => t.slug) : [],
                topic: q.topicTags && q.topicTags.length > 0 ? q.topicTags[0].slug : 'general'
            };
        });

        res.json(mappedQuestions);
    } catch (err) {
        console.error("External API Error:", err.message);
        // Fallback on error
        const fallback = getFallbackTopics().flatMap(t => t.questions);
        res.json(fallback);
    }
};

// @desc    Get all topics
// @route   GET /api/topics
// @access  Public
exports.getTopics = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('Using Fallback Data');
            return res.json(getFallbackTopics());
        }
        const topics = await Topic.find().sort({ order: 1 });
        res.json(topics);
    } catch (err) {
        console.error(err.message);
        // Fallback on error too
        res.json(getFallbackTopics());
    }
};

// @desc    Get topic by slug with questions
// @route   GET /api/topics/:slug
// @access  Public
exports.getTopicBySlug = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const topic = dsaTopics[req.params.slug];
            if (!topic) return res.status(404).json({ msg: 'Topic not found' });
            // Add topic slug to questions
            const questions = topic.questions.map(q => ({ ...q, topic: req.params.slug }));
            return res.json({ topic: { ...topic, slug: req.params.slug }, questions });
        }

        const topic = await Topic.findOne({ slug: req.params.slug });
        if (!topic) {
            return res.status(404).json({ msg: 'Topic not found' });
        }

        const questions = await Question.find({ topic: req.params.slug }).sort({ order: 1 });

        res.json({ topic, questions });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
