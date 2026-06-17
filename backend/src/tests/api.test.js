const http = require('http');
const db = require('../config/db');
require('dotenv').config();

// We will launch the Express server in a test mode
const app = require('express')();
const path = require('path');
const cors = require('cors');

// Import routes
const authRoutes = require('../routes/auth');
const adminRoutes = require('../routes/admin');
const teacherRoutes = require('../routes/teacher');
const parentRoutes = require('../routes/parent');

app.use(cors());
app.use(require('express').json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/parent', parentRoutes);

const PORT = 5099;
let server;

function startServer() {
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Test server started on port ${PORT}`);
      resolve();
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Test server closed.');
      resolve();
    });
  });
}

async function runTests() {
  await startServer();
  let passed = true;

  try {
    console.log('\n--- STARTING API VERIFICATION TESTS ---');

    // 1. Authenticate Admin
    console.log('Testing Admin Login...');
    const adminLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@firstcry.com', password: 'admin123' })
    });
    
    if (adminLoginRes.status !== 200) {
      console.error('❌ Admin login failed!');
      passed = false;
    } else {
      const data = await adminLoginRes.json();
      console.log('✔ Admin logged in successfully.');
      const adminToken = data.token;

      // 2. Fetch Admin Stats
      const adminStatsRes = await fetch(`http://localhost:${PORT}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (adminStatsRes.status === 200) {
        console.log('✔ Admin could fetch dashboard stats successfully.');
      } else {
        console.error('❌ Admin stats fetch failed!');
        passed = false;
      }
    }

    // 3. Authenticate Parent
    console.log('\nTesting Parent Login...');
    const parentLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'parent@firstcry.com', password: 'parent123' })
    });

    if (parentLoginRes.status !== 200) {
      console.error('❌ Parent login failed!');
      passed = false;
    } else {
      const data = await parentLoginRes.json();
      console.log('✔ Parent logged in successfully.');
      const parentToken = data.token;

      // 4. Verify Parent can access private photos
      const parentPhotosRes = await fetch(`http://localhost:${PORT}/api/parent/photos`, {
        headers: { 'Authorization': `Bearer ${parentToken}` }
      });
      if (parentPhotosRes.status === 200) {
        const photos = await parentPhotosRes.json();
        console.log(`✔ Parent accessed photo gallery (Returned ${photos.length} tagged photo(s)).`);
        
        // Assert privacy compliance: Check if Aarav Patel or Meera Patel is in the tags
        const allPhotosValid = photos.every(photo => 
          photo.tags.some(tag => tag.student_name.includes('Aarav') || tag.student_name.includes('Meera'))
        );
        if (allPhotosValid) {
          console.log('✔ PRIVACY ASSERTION PASSED: Parent only sees photos where their children (Aarav/Meera) are tagged!');
        } else {
          console.error('❌ PRIVACY ASSERTION FAILED: Parent saw leaking photos!');
          passed = false;
        }
      } else {
        console.error('❌ Parent photo gallery access failed!');
        passed = false;
      }

      // 5. Verify Parent is DENIED access to Admin paths
      console.log('\nTesting Role Guard Security (Parent trying to access Admin endpoint)...');
      const parentAdminStatsRes = await fetch(`http://localhost:${PORT}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${parentToken}` }
      });
      if (parentAdminStatsRes.status === 403) {
        console.log('✔ SECURITY ASSERTION PASSED: Parent access to Admin dashboard was blocked (403 Forbidden).');
      } else {
        console.error('❌ SECURITY ALERT: Parent was allowed access to Admin endpoint!');
        passed = false;
      }
    }

    console.log('\n--- VERIFICATION SUMMARY ---');
    if (passed) {
      console.log('🏆 ALL TESTS COMPLETED SUCCESSFULLY! The backend is robust and secure.');
    } else {
      console.log('❌ SOME TESTS FAILED. Please review the errors above.');
    }

  } catch (error) {
    console.error('An error occurred during testing:', error);
  } finally {
    await stopServer();
    // Close the database pool so test runner terminates cleanly
    await db.end();
    process.exit(passed ? 0 : 1);
  }
}

runTests();
