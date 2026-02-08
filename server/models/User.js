const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    authProvider: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    // Progress tracking by topic slug
    progress: {
        type: Map,
        of: new mongoose.Schema({
            solved: [{ type: String }], // Array of question slugs
            lastQuestion: { type: String, default: null } // Slug of last visited question
        }, { _id: false }),
        default: {}
    },
    lastVisitedTopic: {
        type: String, // Topic slug
        default: 'arrays'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
