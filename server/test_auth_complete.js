const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('SOLARSENSE AUTHENTICATION SYSTEM COMPREHENSIVE TEST');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(name, condition, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${name} -> ${detail}`);
      failedCount++;
    }
  }

  const testUser = {
    username: `test_user_${Date.now().toString().slice(-6)}`,
    email: `test_${Date.now().toString().slice(-6)}@solartest.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  console.log('--- 1. SIGNUP VALIDATION TESTS ---');

  // Case 1: Empty username
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: '',
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.confirmPassword,
    });
    assert('Reject empty username', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject empty username',
      err.response?.status === 400 && err.response?.data?.field === 'username',
      JSON.stringify(err.response?.data)
    );
  }

  // Case 2: Username shorter than minimum (2 chars)
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: 'Sa',
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.confirmPassword,
    });
    assert('Reject username < 3 chars', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject username < 3 chars',
      err.response?.status === 400 &&
        err.response?.data?.field === 'username' &&
        err.response?.data?.message.includes('at least 3 characters'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 3: Username containing spaces
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: 'Solar User',
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.confirmPassword,
    });
    assert('Reject username with spaces', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject username with spaces',
      err.response?.status === 400 &&
        err.response?.data?.field === 'username' &&
        err.response?.data?.message.includes('spaces'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 4: Username with invalid characters (@)
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: 'user@123',
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.confirmPassword,
    });
    assert('Reject username with invalid characters', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject username with invalid characters',
      err.response?.status === 400 &&
        err.response?.data?.field === 'username' &&
        err.response?.data?.message.includes('letters, numbers and underscores only'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 5: Invalid email formats
  for (const badEmail of ['abc', 'user@', '@example.com', 'example.com']) {
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        username: testUser.username,
        email: badEmail,
        password: testUser.password,
        confirmPassword: testUser.confirmPassword,
      });
      assert(`Reject invalid email (${badEmail})`, false, 'Expected 400');
    } catch (err) {
      assert(
        `Reject invalid email (${badEmail})`,
        err.response?.status === 400 && err.response?.data?.field === 'email',
        JSON.stringify(err.response?.data)
      );
    }
  }

  // Case 6: Password less than 8 characters
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: testUser.username,
      email: testUser.email,
      password: 'Pass1',
      confirmPassword: 'Pass1',
    });
    assert('Reject password < 8 characters', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject password < 8 characters',
      err.response?.status === 400 &&
        err.response?.data?.field === 'password' &&
        err.response?.data?.message.includes('at least 8 characters'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 7: Password without uppercase letter
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: testUser.username,
      email: testUser.email,
      password: 'password123',
      confirmPassword: 'password123',
    });
    assert('Reject password without uppercase letter', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject password without uppercase letter',
      err.response?.status === 400 &&
        err.response?.data?.field === 'password' &&
        err.response?.data?.message.includes('uppercase letter'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 8: Password without lowercase letter
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: testUser.username,
      email: testUser.email,
      password: 'PASSWORD123',
      confirmPassword: 'PASSWORD123',
    });
    assert('Reject password without lowercase letter', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject password without lowercase letter',
      err.response?.status === 400 &&
        err.response?.data?.field === 'password' &&
        err.response?.data?.message.includes('lowercase letter'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 9: Password without number
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: testUser.username,
      email: testUser.email,
      password: 'PasswordLettersOnly',
      confirmPassword: 'PasswordLettersOnly',
    });
    assert('Reject password without number', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject password without number',
      err.response?.status === 400 &&
        err.response?.data?.field === 'password' &&
        err.response?.data?.message.includes('number'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 10: Password mismatch
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: testUser.username,
      email: testUser.email,
      password: 'Solar1234Password',
      confirmPassword: 'Solar12345Password',
    });
    assert('Reject mismatched confirmPassword', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject mismatched confirmPassword',
      err.response?.status === 400 &&
        err.response?.data?.field === 'confirmPassword' &&
        err.response?.data?.message.includes('do not match'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 11: Successful registration with Valid Username + Email + Password
  let regRes;
  try {
    regRes = await axios.post(`${API_BASE}/auth/register`, testUser);
    assert(
      'Successful registration',
      regRes.status === 201 &&
        regRes.data?.success === true &&
        regRes.data?.user?.username === testUser.username.toLowerCase() &&
        regRes.data?.user?.email === testUser.email.toLowerCase() &&
        regRes.data?.token,
      JSON.stringify(regRes.data)
    );
  } catch (err) {
    assert('Successful registration', false, err.response?.data?.message || err.message);
  }

  // Case 12: Ensure password and passwordHash are NEVER returned to frontend
  assert(
    'Never return password or passwordHash to frontend',
    regRes?.data?.user?.password === undefined && regRes?.data?.user?.passwordHash === undefined,
    'Password or hash found in response'
  );

  // Case 13: Reject duplicate username
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: testUser.username,
      email: `another_${Date.now()}@example.com`,
      password: testUser.password,
      confirmPassword: testUser.confirmPassword,
    });
    assert('Reject duplicate username', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject duplicate username',
      err.response?.status === 400 &&
        err.response?.data?.field === 'username' &&
        err.response?.data?.message.includes('already taken'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 14: Reject duplicate email
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      username: `diff_user_${Date.now().toString().slice(-6)}`,
      email: testUser.email,
      password: testUser.password,
      confirmPassword: testUser.confirmPassword,
    });
    assert('Reject duplicate email', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject duplicate email',
      err.response?.status === 400 &&
        err.response?.data?.field === 'email' &&
        err.response?.data?.message.includes('already registered'),
      JSON.stringify(err.response?.data)
    );
  }

  console.log('\n--- 2. REAL-TIME AVAILABILITY ENDPOINTS ---');

  // Check username available
  const chkUserAvail = await axios.get(
    `${API_BASE}/auth/check-username?username=unique_username_9999`
  );
  assert(
    'Live check username available',
    chkUserAvail.data?.available === true,
    JSON.stringify(chkUserAvail.data)
  );

  // Check username taken
  const chkUserTaken = await axios.get(
    `${API_BASE}/auth/check-username?username=${testUser.username}`
  );
  assert(
    'Live check username taken',
    chkUserTaken.data?.available === false,
    JSON.stringify(chkUserTaken.data)
  );

  // Check email available
  const chkEmailAvail = await axios.get(
    `${API_BASE}/auth/check-email?email=unique_email_9999@test.com`
  );
  assert(
    'Live check email available',
    chkEmailAvail.data?.available === true,
    JSON.stringify(chkEmailAvail.data)
  );

  // Check email taken
  const chkEmailTaken = await axios.get(
    `${API_BASE}/auth/check-email?email=${testUser.email}`
  );
  assert(
    'Live check email taken',
    chkEmailTaken.data?.available === false,
    JSON.stringify(chkEmailTaken.data)
  );

  console.log('\n--- 3. LOGIN VALIDATION & FLOW TESTS ---');

  // Case 15: Empty identifier
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      identifier: '',
      password: testUser.password,
    });
    assert('Reject empty username/email on login', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject empty username/email on login',
      err.response?.status === 400 && err.response?.data?.message.includes('username or email'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 16: Empty password
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      identifier: testUser.username,
      password: '',
    });
    assert('Reject empty password on login', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject empty password on login',
      err.response?.status === 400 && err.response?.data?.message.includes('password'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 17: Login with wrong password
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      identifier: testUser.username,
      password: 'WrongPassword999',
    });
    assert('Reject incorrect password with generic message', false, 'Expected 401');
  } catch (err) {
    assert(
      'Reject incorrect password with generic message',
      err.response?.status === 401 &&
        err.response?.data?.message === 'Incorrect username/email or password.',
      JSON.stringify(err.response?.data)
    );
  }

  // Case 18: Login with nonexistent username/email
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'non_existent_account_xyz',
      password: testUser.password,
    });
    assert('Reject nonexistent user with generic message (no enumeration)', false, 'Expected 401');
  } catch (err) {
    assert(
      'Reject nonexistent user with generic message (no enumeration)',
      err.response?.status === 401 &&
        err.response?.data?.message === 'Incorrect username/email or password.',
      JSON.stringify(err.response?.data)
    );
  }

  // Case 19: Reject invalid username format on login (< 3 chars or spaces)
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'ab',
      password: testUser.password,
    });
    assert('Reject invalid username format on login', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject invalid username format on login',
      err.response?.status === 400 && err.response?.data?.message === 'Invalid username format.',
      JSON.stringify(err.response?.data)
    );
  }

  // Case 20: Reject invalid email format on login
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'bad@email',
      password: testUser.password,
    });
    assert('Reject invalid email format on login', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject invalid email format on login',
      err.response?.status === 400 && err.response?.data?.message === 'Please enter a valid email address.',
      JSON.stringify(err.response?.data)
    );
  }

  // Case 21: Successful login using USERNAME
  try {
    const loginByUsernameRes = await axios.post(`${API_BASE}/auth/login`, {
      identifier: testUser.username,
      password: testUser.password,
    });
    assert(
      'Successful login using USERNAME',
      loginByUsernameRes.status === 200 &&
        loginByUsernameRes.data?.success === true &&
        loginByUsernameRes.data?.user?.username === testUser.username.toLowerCase() &&
        loginByUsernameRes.data?.token,
      JSON.stringify(loginByUsernameRes.data)
    );
  } catch (err) {
    assert('Successful login using USERNAME', false, err.response?.data?.message || err.message);
  }

  // Case 22: Successful login using EMAIL
  let normalUserToken;
  try {
    const loginByEmailRes = await axios.post(`${API_BASE}/auth/login`, {
      identifier: testUser.email,
      password: testUser.password,
    });
    normalUserToken = loginByEmailRes.data?.token;
    assert(
      'Successful login using EMAIL',
      loginByEmailRes.status === 200 &&
        loginByEmailRes.data?.success === true &&
        loginByEmailRes.data?.user?.email === testUser.email.toLowerCase() &&
        loginByEmailRes.data?.token,
      JSON.stringify(loginByEmailRes.data)
    );
  } catch (err) {
    assert('Successful login using EMAIL', false, err.response?.data?.message || err.message);
  }

  console.log('\n--- 4. ADMIN PORTAL AUTHORIZATION & PROTECTION ---');

  // Case 23: Successful Admin login using admin username
  let adminToken;
  try {
    const adminRes = await axios.post(`${API_BASE}/auth/admin/login`, {
      identifier: 'admin',
      password: 'Admin@12345',
    });
    adminToken = adminRes.data?.token;
    assert(
      'Admin login using USERNAME',
      adminRes.status === 200 &&
        adminRes.data?.success === true &&
        adminRes.data?.user?.role === 'admin' &&
        adminToken,
      JSON.stringify(adminRes.data)
    );
  } catch (err) {
    assert('Admin login using USERNAME', false, err.response?.data?.message || err.message);
  }

  // Case 24: Successful Admin login using admin email
  try {
    const adminEmailRes = await axios.post(`${API_BASE}/auth/admin/login`, {
      identifier: 'admin@solarsense.ai',
      password: 'Admin@12345',
    });
    assert(
      'Admin login using EMAIL',
      adminEmailRes.status === 200 &&
        adminEmailRes.data?.success === true &&
        adminEmailRes.data?.user?.role === 'admin',
      JSON.stringify(adminEmailRes.data)
    );
  } catch (err) {
    assert('Admin login using EMAIL', false, err.response?.data?.message || err.message);
  }

  // Case 25: Normal user blocked from Admin Login (HTTP 403 Forbidden)
  try {
    await axios.post(`${API_BASE}/auth/admin/login`, {
      identifier: testUser.username,
      password: testUser.password,
    });
    assert('Normal user blocked from Admin Login', false, 'Expected 403 Forbidden');
  } catch (err) {
    assert(
      'Normal user blocked from Admin Login',
      err.response?.status === 403 &&
        err.response?.data?.message.includes('Administrator privileges required'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 26: Normal user token blocked from protected Admin API (HTTP 403 Forbidden)
  try {
    await axios.get(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${normalUserToken}` },
    });
    assert('Normal user token blocked from /api/admin/dashboard', false, 'Expected 403 Forbidden');
  } catch (err) {
    assert(
      'Normal user token blocked from /api/admin/dashboard',
      err.response?.status === 403 &&
        err.response?.data?.message.includes('administrator privileges'),
      JSON.stringify(err.response?.data)
    );
  }

  // Case 27: Admin user token granted access to protected Admin API (HTTP 200)
  try {
    const adminDashRes = await axios.get(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      'Admin user token granted access to /api/admin/dashboard',
      adminDashRes.status === 200 && adminDashRes.data?.success === true,
      JSON.stringify(adminDashRes.data)
    );
  } catch (err) {
    assert(
      'Admin user token granted access to /api/admin/dashboard',
      false,
      err.response?.data?.message || err.message
    );
  }

  console.log('\n--- 4. PASSWORD SECURITY & HASHING VERIFICATION ---');

  // Verify directly against MongoDB database that the password is a bcrypt hash and never plaintext
  await mongoose.connect('mongodb://127.0.0.1:27017/solarsense_ai');
  const dbUser = await mongoose.connection.db
    .collection('users')
    .findOne({ username: testUser.username.toLowerCase() });

  assert(
    'Password is stored hashed with bcrypt in database',
    dbUser && dbUser.password && dbUser.password.startsWith('$2') && dbUser.password !== testUser.password,
    `Stored password value: ${dbUser?.password}`
  );

  const bcryptMatches = await bcrypt.compare(testUser.password, dbUser.password);
  assert('Bcrypt hash verifies original password correctly', bcryptMatches, 'bcrypt.compare failed');

  console.log('\n--- 5. GOOGLE OAUTH SECURITY & INTEGRATION ---');

  // Google endpoint rejects missing credential
  try {
    await axios.post(`${API_BASE}/auth/google`, {});
    assert('Reject empty Google authentication request', false, 'Expected 400');
  } catch (err) {
    assert(
      'Reject empty Google authentication request',
      err.response?.status === 400 && err.response?.data?.message?.toLowerCase().includes('is required'),
      JSON.stringify(err.response?.data)
    );
  }

  // Google endpoint rejects fake/invalid token
  try {
    await axios.post(`${API_BASE}/auth/google`, { credential: 'fake_invalid_jwt_token_12345' });
    assert('Reject invalid Google JWT token', false, 'Expected 401');
  } catch (err) {
    assert(
      'Reject invalid Google JWT token',
      err.response?.status === 401 && err.response?.data?.message.includes('verification failed'),
      JSON.stringify(err.response?.data)
    );
  }

  // Clean up test user
  await mongoose.connection.db
    .collection('users')
    .deleteOne({ username: testUser.username.toLowerCase() });
  await mongoose.disconnect();

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
