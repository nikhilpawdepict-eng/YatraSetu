async function test() {
  try {
    const res = await fetch('https://yatrasetu-b3rs.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nikhilpawdepict@gmail.com',
        password: 'Nikhil@1234'
      })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
