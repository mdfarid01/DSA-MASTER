const express = require('express');
const router = express.Router();
const hintController = require('../controllers/hint.controller');

router.post('/', hintController.getHint);

module.exports = router;
