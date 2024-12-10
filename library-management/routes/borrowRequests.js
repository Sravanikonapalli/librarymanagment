const express = require('express');
const borrowController = require('../controllers/borrowController');
const router = express.Router();

router.post('/', borrowController.createBorrowRequest);

module.exports = router;
