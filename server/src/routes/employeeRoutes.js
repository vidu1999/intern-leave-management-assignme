'use strict';

const express = require('express');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

router.get('/', employeeController.list);
router.post('/', employeeController.create);
router.get('/:id', employeeController.getOne);
router.patch('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);

module.exports = router;
