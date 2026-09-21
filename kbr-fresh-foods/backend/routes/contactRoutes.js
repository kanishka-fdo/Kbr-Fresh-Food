const express = require('express');
const router = express.Router();
const { sendContact } = require('../controllers/contactController');

// POST /api/contact
router.post('/', sendContact);

module.exports = router;
