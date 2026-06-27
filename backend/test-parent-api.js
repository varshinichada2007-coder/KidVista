async function run() {
  const PORT = 5000;
  console.log('Testing against running server on port:', PORT);
  try {
    console.log('Logging in as parent...');
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'varshinichada2007@gmail.com',
        password: 'anypassword'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login status:', loginRes.status);
    console.log('Login response:', loginData);
    if (!token) {
      throw new Error('No token returned');
    }

    const headers = { Authorization: `Bearer ${token}` };

    console.log('Fetching /parent/progress...');
    const progressRes = await fetch(`http://localhost:${PORT}/api/parent/progress`, { headers });
    console.log('Progress status:', progressRes.status);
    const progressData = await progressRes.json();
    console.log('Progress data:', progressData);

    console.log('Fetching /parent/announcements...');
    const annRes = await fetch(`http://localhost:${PORT}/api/parent/announcements`, { headers });
    console.log('Announcements status:', annRes.status);
    const annData = await annRes.json();
    console.log('Announcements data:', annData);
    
  } catch (err) {
    console.error('Test execution failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
