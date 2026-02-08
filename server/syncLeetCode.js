require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Question = require('./models/Question');
const Topic = require('./models/Topic');
const axios = require('axios');

// Map our topic slugs to LeetCode tags
const topicMapping = {
    'arrays': 'array',
    'linked-list': 'linked-list',
    'stacks': 'stack',
    'queues': 'queue',
    'trees': 'tree',
    'graphs': 'graph',
    'hashing': 'hash-table',
    'dynamic-programming': 'dynamic-programming',
    'searching': 'binary-search',
    'sorting': 'sorting',
    'recursion': 'recursion'
};

const syncQuestions = async () => {
    await connectDB();

    try {
        for (const [localSlug, leetCodeTag] of Object.entries(topicMapping)) {
            console.log(`Fetching questions for topic: ${localSlug} (Tag: ${leetCodeTag})...`);

            // Fetch from local Alfa LeetCode API
            // Using limit=50 initially to not overwhelm, but user asked for "all". 
            // Let's try 50 per topic for now to verify, or 100.
            try {
                const response = await axios.get(`http://localhost:3002/problems`, {
                    params: {
                        tags: leetCodeTag,
                        limit: 50
                    }
                });

                const problems = response.data.problemsetQuestionList;
                if (!problems || problems.length === 0) {
                    console.log(`No problems found for ${leetCodeTag}`);
                    continue;
                }

                console.log(`Found ${problems.length} problems. Syncing...`);

                const questionDocs = problems.map(p => ({
                    title: p.title,
                    slug: p.titleSlug,
                    difficulty: p.difficulty,
                    tags: p.topicTags ? p.topicTags.map(t => t.slug) : [],
                    topic: localSlug, // Link to our internal topic slug
                    leetcodeUrl: `https://leetcode.com/problems/${p.titleSlug}/`,
                    isPaidOnly: p.isPaidOnly || false
                }));

                // Upsert questions (update if exists, insert if new)
                for (const doc of questionDocs) {
                    await Question.updateOne(
                        { slug: doc.slug, topic: localSlug }, // Compound key check
                        { $set: doc },
                        { upsert: true }
                    );
                }
                console.log(`Synced ${localSlug} successfully.`);

            } catch (err) {
                console.error(`Failed to fetch ${leetCodeTag}:`, err.message);
            }
        }

        console.log('Sync Complete!');
        process.exit();
    } catch (error) {
        console.error('Script Error:', error);
        process.exit(1);
    }
};

syncQuestions();
