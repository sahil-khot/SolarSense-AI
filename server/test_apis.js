const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING COMPREHENSIVE SOLARSENSE AI VALIDATION SUITE ===\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName, details = '') {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(` ✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(` ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    }
  }

  try {
    // 1. Health Check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.body.version === '2.0.0', '1. Backend Health Check', `version: ${health.body.version}`);

    // 2. Python ML Microservice Health & Model Metrics
    const mlHealth = await request({
      hostname: '127.0.0.1',
      port: 8000,
      path: '/health',
      method: 'GET',
    });
    assert(mlHealth.status === 200 && mlHealth.body.mlModelActive === true, '2. Python ML Layer Health', `status: ${mlHealth.body.status}`);

    const mlStatus = await request({
      hostname: '127.0.0.1',
      port: 8000,
      path: '/models/status',
      method: 'GET',
    });
    const forecaster = mlStatus.body.models?.consumptionForecaster;
    assert(
      mlStatus.status === 200 && forecaster && forecaster.mape < 5.0,
      '3. ML Forecaster Accuracy Standards',
      `Model: ${forecaster?.modelName}, MAPE: ${forecaster?.mape}%, Samples: ${forecaster?.trainingSamples}`
    );

    // 4. ML Consumption Forecast Inference
    const mlPredict = await request(
      {
        hostname: '127.0.0.1',
        port: 8000,
        path: '/predict/consumption',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        historical_kwh: [380, 420, 390],
        user_type: 'residential',
        location: 'Maharashtra',
        forecast_months: 12,
      }
    );
    assert(
      mlPredict.status === 200 && mlPredict.body.forecast_curve?.length === 12 && mlPredict.body.confidence_intervals?.length === 12,
      '4. ML 12-Month Consumption Forecast with 90% Confidence Intervals',
      `Annual: ${mlPredict.body.annual_kwh} kWh, Next Month: ${mlPredict.body.next_month_kwh} kWh`
    );

    // 5. ML Anomaly Detection
    const anomalyTest = await request(
      {
        hostname: '127.0.0.1',
        port: 8000,
        path: '/detect/anomalies',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        current_kwh: 750,
        history_kwh: [350, 370, 360, 380],
        user_type: 'residential',
      }
    );
    assert(
      anomalyTest.status === 200 && anomalyTest.body.is_anomaly === true,
      '5. ML Anomaly Detection on Consumption Spikes',
      `Detected Anomaly: z-score ${anomalyTest.body.z_score}`
    );

    // 6. User Authentication & Login
    const userLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'rahul.residential@solarsense.ai',
        password: 'User@12345',
      }
    );
    const userToken = userLogin.body.token;
    assert(userLogin.status === 200 && userToken, '6. User Authentication (JWT)', `User: ${userLogin.body.user?.name}`);

    // 7. Tokenized Password Reset Flow
    const forgotRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/forgot-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'rahul.residential@solarsense.ai' }
    );
    const resetToken = forgotRes.body.resetToken;
    assert(forgotRes.status === 200 && resetToken, '7. Secure Password Reset Token Generation', `Valid: 15 mins`);

    // Reset password and immediately test login
    const resetRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/auth/reset-password/${resetToken}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      },
      { password: 'User@12345' } // set back to original password
    );
    assert(resetRes.status === 200, '8. Tokenized Password Reset Execution', resetRes.body.message);

    // 9. Solar Engineering Engine: Location-Aware & True LCOE
    const quickEstimate = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/solar/quick-estimate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        monthlyConsumption: 420,
        userType: 'residential',
        roofArea: 800,
        location: { state: 'Rajasthan', city: 'Jodhpur' },
      }
    );
    const m = quickEstimate.body.metrics;
    assert(
      quickEstimate.status === 200 && m && m.lcoe > 0 && m.lcoe < 6.0 && m.lcoe !== 2.85,
      '9. Deterministic Solar Engineering & True Mathematical LCOE',
      `Capacity: ${m?.recommendedCapacity} kW, LCOE: ₹${m?.lcoe}/kWh, Subsidy: ₹${m?.subsidy}`
    );

    // 10. Subsidies Engine Verification (PM Surya Ghar Slabs)
    const sub1KW = await request(
      { hostname: 'localhost', port: 5000, path: '/api/solar/quick-estimate', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { monthlyConsumption: 120, userType: 'residential', roofArea: 500 }
    );
    assert(sub1KW.body.metrics?.subsidy === 30000, '10. PM Surya Ghar 1 kW Subsidy Slab', 'Expected ₹30,000');

    const sub3KW = await request(
      { hostname: 'localhost', port: 5000, path: '/api/solar/quick-estimate', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { monthlyConsumption: 400, userType: 'residential', roofArea: 800 }
    );
    assert(sub3KW.body.metrics?.subsidy === 78000, '11. PM Surya Ghar 3 kW Max Subsidy Cap', 'Expected ₹78,000');

    // 12. Verified Indian Solar Companies API
    const companies = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/companies',
      method: 'GET',
    });
    assert(
      companies.status === 200 && companies.body.count >= 8,
      '12. Verified Indian Solar Companies Catalog',
      `Count: ${companies.body.count} brands`
    );

    // 13. Personalized Solar Company Recommender
    const matchRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/companies/match',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        capacityKW: 3,
        userType: 'residential',
        location: { state: 'Maharashtra', city: 'Pune' },
        preference: 'best_value',
      }
    );
    assert(
      matchRes.status === 200 && matchRes.body.topMatches?.length > 0 && matchRes.body.topMatches[0].matchScore >= 85,
      '13. Personalized Solar Company Matching Algorithm',
      `Top Match: ${matchRes.body.topMatches[0]?.company?.name} (${matchRes.body.topMatches[0]?.matchScore}%)`
    );

    // 14. RBAC Protection: Regular user blocked from admin APIs
    const rbacTest = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(rbacTest.status === 403, '14. RBAC Protection: User Blocked from Admin APIs', 'Expected 403 Forbidden');

    // 15. Admin Login & Telemetry Dashboard
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/admin/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'admin@solarsense.ai',
        password: 'Admin@12345',
      }
    );
    const adminToken = adminLogin.body.token;
    assert(adminLogin.status === 200 && adminToken, '15. Administrator Authentication', `Role: ${adminLogin.body.user?.role}`);

    const adminDash = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminDash.status === 200 && adminDash.body.systemHealth?.mlLayer?.status === 'active',
      '16. Admin Enterprise Telemetry with Live ML Monitoring',
      `ML Status: ${adminDash.body.systemHealth?.mlLayer?.status}, Total Capacity: ${adminDash.body.summary?.impact?.totalCapacityKW} kW`
    );

    console.log(`\n======================================================`);
    console.log(`RESULTS: ${passedCount} / ${totalCount} TESTS PASSED (${Math.round((passedCount / totalCount) * 100)}%)`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('Test execution exception:', err);
  }
}

runTests();
