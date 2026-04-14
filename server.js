const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');

// Connect DB + create default admin
connectDB().then(async () => {
  try {
    const adminUser = await User.findOne({ role: 'admin', isActive: true });
    if (!adminUser) {
      await User.create({
        name: 'Admin User',
        email: 'admin@predictivesys.local',
        password: 'Admin123!',
        role: 'admin',
      });
      console.log('✅ Default admin created: admin@predictivesys.local / Admin123!');
    }
  } catch (e) {
    console.error('Admin seed error:', e.message);
  }
});

const app = express();


// ✅ FINAL CORS FIX (correct way)
app.use(cors());
app.options('*', cors()); // handle preflight requests


app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 PredictiveSys API running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 API:    http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
