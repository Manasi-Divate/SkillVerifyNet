require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidate');
const becknRoutes = require('./routes/beckn');
const verifyRoutes = require('./routes/verify');
const adminRoutes = require('./routes/admin');
const { startBackgroundJobs } = require('./services/backgroundJobs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/beckn', becknRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Beckn Skill Verification Network API is running' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beckn_skill_verification')
.then(() => {
  console.log('✓ Connected to MongoDB');
  startBackgroundJobs();
  console.log('✓ Background jobs started');
})
.catch(err => {
  console.warn('⚠ MongoDB connection failed. Database features will not be available.');
  console.warn('⚠ To enable database features, please install and start MongoDB.');
  console.warn('⚠ Server will continue running with limited functionality.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Frontend available at: http://0.0.0.0:${PORT}`);
  if (!mongoose.connection.readyState) {
    console.warn('⚠ MongoDB is not connected. Install MongoDB to enable full features.');
  }
});

module.exports = app;
