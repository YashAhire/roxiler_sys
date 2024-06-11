const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const Transaction = require('./models/Transaction');  // Ensure you have this model

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/productTransactions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

// API to initialize the database
app.get('/api/init', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;
    
    // Clear the collection before seeding to avoid duplicates
    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);

    res.status(200).send('Database initialized with seed data');
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).send('Error initializing database');
  }
});

// API to fetch combined data
app.get('/api/combined-data', async (req, res) => {
  const { month } = req.query;
  try {
    const [transactionsResponse, statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
      axios.get('http://localhost:3000/api/transactions', { params: { month } }),
      axios.get('http://localhost:3000/api/statistics', { params: { month } }),
      axios.get('http://localhost:3000/api/bar-chart', { params: { month } }),
      axios.get('http://localhost:3000/api/pie-chart', { params: { month } })
    ]);

    res.json({
      transactions: transactionsResponse.data,
      statistics: statisticsResponse.data,
      barChart: barChartResponse.data,
      pieChart: pieChartResponse.data,
    });
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).send('Error fetching combined data');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
