const express = require('express');
const bookController = require('../controllers/bookController');
const router = express.Router();

router.get('/', bookController.getBooks);

module.exports = router;
