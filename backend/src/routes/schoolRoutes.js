const express = require('express');
const router = express.Router();
const { registerSchool } = require('../controllers/schoolController');

router.post('/create', registerSchool);

module.exports = router;
