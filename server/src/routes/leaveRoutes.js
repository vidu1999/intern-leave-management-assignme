'use strict';

const express = require('express');
const leaveController = require('../controllers/leaveController');

const router = express.Router();

router.get('/', leaveController.list);
router.post('/', leaveController.create);
router.get('/:id', leaveController.getOne);
router.patch('/:id/approve', leaveController.approve);
router.patch('/:id/reject', leaveController.reject);

module.exports = router;
