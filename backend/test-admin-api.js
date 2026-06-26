async function run() {
  try {
    console.log('Logging in as admin...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'akhilkumarchada86@gmail.com',
        password: 'Akhil@0806',
        adminSecret: 'Varshini@20'
      })
    });
    
    if (!loginRes.ok) {
      console.error('Login request failed:', loginRes.status, await loginRes.text());
      return;
    }
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful. Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('Fetching /admin/stats...');
    try {
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
      console.log('Stats status:', statsRes.status);
      const text = await statsRes.text();
      console.log('Stats response text:', text);
    } catch (err) {
      console.error('Stats request failed:', err.message);
    }

    console.log('Fetching /admin/analytics...');
    try {
      const analyticsRes = await fetch('http://localhost:5000/api/admin/analytics', { headers });
      console.log('Analytics status:', analyticsRes.status);
      const text = await analyticsRes.text();
      console.log('Analytics response text:', text);
    } catch (err) {
      console.error('Analytics request failed:', err.message);
    }
  } catch (err) {
    console.error('Test script failed:', err.message);
  }
}

run();
