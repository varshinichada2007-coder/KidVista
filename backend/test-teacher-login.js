async function test() {
  try {
    console.log('Testing teacher login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'Aadhya@Kidvista.com',
        password: 'Aadhya@789'
      })
    });
    
    console.log('Status:', loginRes.status);
    console.log('Response:', await loginRes.json());
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

test();
