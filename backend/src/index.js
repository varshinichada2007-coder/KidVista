const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const parentRoutes = require('./routes/parent');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✔ Created local "uploads" directory.');
}

// Copy a placeholder image if it doesn't exist, so that the seeded photo can load
const sampleImagePath = path.join(uploadsDir, 'sample-painting.jpg');
if (!fs.existsSync(sampleImagePath)) {
  // Write a simple blank image or buffer so the server doesn't error when checking the file
  fs.writeFileSync(sampleImagePath, Buffer.from(''));
  console.log('✔ Created placeholder image: sample-painting.jpg');
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos statically
app.use('/uploads', express.static(uploadsDir));

const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/teacher', teacherRoutes);
apiRouter.use('/parent', parentRoutes);

// Mount for local dev (/api/...) and Vercel serverless (/...) where routePrefix strips /api
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'KidVista Daily Activity Photo Sharing Portal API is online.',
    time: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred.'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`🚀 Server running on port http://localhost:${PORT}`);
    console.log(`📂 Serving static uploads from ${uploadsDir}`);
    console.log(`========================================================`);
  });
}

module.exports = app;
