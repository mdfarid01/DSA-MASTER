const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topic.controller');

router.get('/', topicController.getTopics);
router.get('/questions', topicController.getAllQuestions);
router.get('/:slug', topicController.getTopicBySlug);

module.exports = router;
