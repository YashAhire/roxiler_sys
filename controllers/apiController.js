// backend/controllers/apiController.js
const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  const { search = '', page = 1, perPage = 10, month } = req.query;
  const regex = new RegExp(search, 'i');
  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: start, $lt: end },
      $or: [{ title: regex }, { description: regex }, { price: regex }],
    })
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));

    res.json(transactions);
  } catch (error) {
    res.status(500).send('Error fetching transactions');
  }
}

const getStatistics = async (req, res) => {
  const { month } = req.query;
  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: start, $lt: end }, sold: true } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);
    const totalSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: start, $lt: end },
      sold: true,
    });
    const totalNotSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: start, $lt: end },
      sold: false,
    });

    res.json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    res.status(500).send('Error fetching statistics');
  }
}

const getBarChart = async (req, res) => {
  const { month } = req.query;
  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  try {
    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity },
    ];

    const barChartData = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
          dateOfSale: { $gte: start, $lt: end },
          price: { $gte: range.min, $lte: range.max },
        });
        return { range: range.range, count };
      })
    );

    res.json(barChartData);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data');
  }
}

const getPieChart = async (req, res) => {
  const { month } = req.query;
  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(start.getMonth() + 1);

  try {
    const pieChartData = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json(pieChartData);
  } catch (error) {
    res.status(500).send('Error fetching pie chart data');
  }
}

module.exports = { getTransactions, getStatistics, getBarChart, getPieChart };
