const http = require('http');

function postJSON(path, payload) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataStr),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function verify() {
  console.log('--- TESTING GOOGLE AUTH API ---');
  const googleRes = await postJSON('/api/auth/google', {
    email: 'demo.user@example.com',
    name: 'Demo User',
    googleId: 'google_test_123',
  });
  console.log('Google Auth status:', googleRes.status);
  console.log('Google Auth success:', googleRes.body.success);
  console.log('Google Auth token present:', !!googleRes.body.token);
  console.log('User Name:', googleRes.body.user?.name);

  if (googleRes.body.success && googleRes.body.token) {
    console.log('PASS: Google Sign-In backend is fully operational!');
  } else {
    console.error('FAIL: Google Sign-In failed');
  }
}

verify().catch(console.error);
