async function test() {
  try {
    console.log('--- 1. Testing /api/debug-db ---');
    const dbRes = await fetch('https://yatrasetu-b3rs.onrender.com/api/debug-db');
    console.log('DB Status:', dbRes.status);
    const dbData = await dbRes.json();
    console.log('DB Data:', JSON.stringify(dbData, null, 2));

    console.log('\n--- 2. Testing /api/auth/login ---');
    const loginRes = await fetch('https://yatrasetu-b3rs.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nikhilpawdepict@gmail.com',
        password: 'Nikhil@1234'
      })
    });
    console.log('Login Status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
