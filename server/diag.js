async function runDiagnostics() {
  console.log('=== 1. Health Check ===');
  const hRes = await fetch('https://yatrasetu-b3rs.onrender.com/api/health');
  console.log('Health:', hRes.status, await hRes.json());

  console.log('\n=== 2. Debug DB ===');
  const dRes = await fetch('https://yatrasetu-b3rs.onrender.com/api/debug-db');
  console.log('DB Users:', dRes.status, await dRes.json());

  console.log('\n=== 3. Login Attempt ===');
  const lRes = await fetch('https://yatrasetu-b3rs.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'nikhilpawdepict@gmail.com',
      password: 'Nikhil@1234'
    })
  });
  console.log('Login Status:', lRes.status);
  const lData = await lRes.json();
  console.log('Login Response:', lData);

  if (lData.requires2FA) {
    console.log('\n=== 4. Testing 2FA with 482913 ===');
    const vRes = await fetch('https://yatrasetu-b3rs.onrender.com/api/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: lData.userId,
        otp: '482913'
      })
    });
    console.log('2FA Status:', vRes.status);
    const vData = await vRes.json();
    console.log('2FA Response:', vData);
  }
}

runDiagnostics();
