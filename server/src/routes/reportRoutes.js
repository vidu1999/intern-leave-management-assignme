'use strict';

const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/summary', reportController.summary);

module.exports = router;
