const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Topic', TopicSchema);
