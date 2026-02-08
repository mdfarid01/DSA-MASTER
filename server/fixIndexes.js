require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Question = require('./models/Question');

const fixIndexes = async () => {
    await connectDB();
    try {
        console.log('Dropping slug_1 index...');
        await Question.collection.dropIndex('slug_1');
        console.log('Index dropped. Creating compound index...');
        await Question.collection.createIndex({ slug: 1, topic: 1 }, { unique: true });
        console.log('Compound index created.');
        process.exit();
    } catch (err) {
        console.log('Error (likely index doesnt exist, which is fine):', err.message);
        process.exit();
    }
};

fixIndexes();
