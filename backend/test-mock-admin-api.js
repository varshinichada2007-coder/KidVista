process.env.VERCEL = 'true'; // Force Mock DB fallback

const app = require('./src/index'); // Load express app

async function run() {
  const PORT = 5098;
  const server = app.listen(PORT, async () => {
    console.log('Mock API server started on port:', PORT);
    try {
      console.log('Logging in as admin...');
      const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'akhilkumarchada86@gmail.com',
          password: 'Akhil@0806',
          adminSecret: 'Varshini@20'
        })
      });
      
      const loginData = await loginRes.json();
      const token = loginData.token;
      console.log('Login successful. Token acquired.');

      const headers = { Authorization: `Bearer ${token}` };

      console.log('Fetching /admin/stats...');
      const statsRes = await fetch(`http://localhost:${PORT}/api/admin/stats`, { headers });
      console.log('Stats status:', statsRes.status);
      const statsData = await statsRes.json();
      console.log('Stats data:', statsData);

      console.log('Fetching /admin/analytics...');
      const analyticsRes = await fetch(`http://localhost:${PORT}/api/admin/analytics`, { headers });
      console.log('Analytics status:', analyticsRes.status);
      const analyticsData = await analyticsRes.json();
      console.log('Analytics data:', analyticsData);
      
    } catch (err) {
      console.error('Test execution failed:', err.message);
    } finally {
      server.close(() => {
        console.log('Mock API server closed.');
        process.exit(0);
      });
    }
  });
}

run();
