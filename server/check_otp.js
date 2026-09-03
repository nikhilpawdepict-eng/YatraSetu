async function check() {
  try {
    const res = await fetch('https://yatrasetu-b3rs.onrender.com/api/debug-db');
    const data = await res.json();
    console.log('Database users:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
check();
