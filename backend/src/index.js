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
const IS_VERCEL = !!process.env.VERCEL;

// Ensure uploads directory exists (skip on Vercel — read-only filesystem)
const uploadsDir = path.join(__dirname, '../uploads');
if (!IS_VERCEL) {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✔ Created local "uploads" directory.');
  }

  // Copy a placeholder image if it doesn't exist
  const sampleImagePath = path.join(uploadsDir, 'sample-painting.jpg');
  if (!fs.existsSync(sampleImagePath)) {
    fs.writeFileSync(sampleImagePath, Buffer.from(''));
    console.log('✔ Created placeholder image: sample-painting.jpg');
  }
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos statically (only works locally, not on Vercel's read-only FS)
app.use('/uploads', express.static(uploadsDir));

// API Routes — mount on both /api (for local dev proxy) and / (for Vercel serverless rewrite)
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/teacher', teacherRoutes);
apiRouter.use('/parent', parentRoutes);

app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve frontend build if it exists (local combined mode only)
if (!IS_VERCEL) {
  const frontendDistDir = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDistDir)) {
    console.log(`✔ Frontend static files detected. Serving from ${frontendDistDir}`);
    app.use(express.static(frontendDistDir));

    // React client-side router fallback
    app.get('*', (req, res, next) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(frontendDistDir, 'index.html'));
      } else {
        next();
      }
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred.'
  });
});

// Start Server — only when running locally (not on Vercel serverless)
if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`🚀 Server running on port http://localhost:${PORT}`);
    console.log(`📂 Serving static uploads from ${uploadsDir}`);
    console.log(`========================================================`);
  });
}

module.exports = app;

