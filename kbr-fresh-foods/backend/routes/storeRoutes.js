const express = require('express');
const { getStores, getStore } = require('../controllers/storeController');

const router = express.Router();

router.get('/', getStores);
router.get('/:id', getStore);

module.exports = router;
