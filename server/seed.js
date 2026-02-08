require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Topic = require('./models/Topic');
const Question = require('./models/Question');
const dsaTopics = require('./data/dsaTopics.json');

connectDB();

const importData = async () => {
    try {
        await Topic.deleteMany();
        await Question.deleteMany();

        const topicDocs = [];
        const questionDocs = [];

        for (const [key, value] of Object.entries(dsaTopics)) {
            const topic = {
                slug: key,
                title: value.title,
                description: value.description,
                order: value.order
            };
            topicDocs.push(topic);

            for (const q of value.questions) {
                questionDocs.push({
                    ...q,
                    topic: key
                });
            }
        }

        await Topic.insertMany(topicDocs);
        await Question.insertMany(questionDocs);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
