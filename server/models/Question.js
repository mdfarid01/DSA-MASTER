const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    topic: {
        type: String, // References Topic slug
        required: true,
        index: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    tags: [{ type: String }],
    leetcodeUrl: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Question', QuestionSchema);
