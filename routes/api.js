const express = require('express');
const router = express.Router();
const { getTransactions, getStatistics, getBarChart, getPieChart } = require('../controllers/apiController');

router.get('/transactions', getTransactions);
router.get('/statistics', getStatistics);
router.get('/bar-chart', getBarChart);
router.get('/pie-chart', getPieChart);

module.exports = router;
