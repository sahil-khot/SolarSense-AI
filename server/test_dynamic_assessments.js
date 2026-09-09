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

async function runDynamicTests() {
  console.log('===============================================================');
  console.log('   SOLARSENSE AI — DYNAMIC MULTI-CATEGORY ASSESSMENT TEST     ');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(` ✅ PASS: ${name} ${details ? '— ' + details : ''}`);
    } else {
      console.error(` ❌ FAIL: ${name} ${details ? '— ' + details : ''}`);
    }
  }

  try {
    // 1. Authenticate user
    console.log('[Step 1] Authenticating Test Consumer...');
    const loginRes = await request(
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

    const token = loginRes.body.token;
    assert(loginRes.status === 200 && token, 'User Authentication', `Token received for ${loginRes.body.user?.name}`);

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // ==========================================
    // PATH 1: HOME (Residential)
    // ==========================================
    console.log('\n---------------------------------------------------------------');
    console.log(' PATH 1: HOME (Residential Rooftop)');
    console.log('---------------------------------------------------------------');
    const homePayload = {
      userType: 'residential',
      location: { state: 'Maharashtra', city: 'Pune' },
      monthlyConsumption: 420,
      monthlyBill: 3150,
      roofArea: 800,
      roofType: 'concrete_flat',
      roofOrientation: 'south',
      dayNightUsage: 'day_heavy',
      categoryDetails: {
        householdSize: '3-4 people',
        appliances: ['Air Conditioner (AC)', 'Electric Vehicle (EV) Charger'],
      },
    };

    const homeRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/solar/assess',
        method: 'POST',
        headers: authHeaders,
      },
      homePayload
    );

    assert(homeRes.status === 201 && homeRes.body.success, 'HOME: Assessment Execution');
    const homeAssess = homeRes.body.assessment;
    const homeRec = homeRes.body.recommendation;
    assert(
      homeAssess.recommendedCapacity >= 3 && homeAssess.recommendedCapacity <= 5,
      'HOME: Realistic Sizing for 420 kWh',
      `${homeAssess.recommendedCapacity} kW (${homeAssess.panelCount} panels)`
    );
    assert(homeAssess.subsidy === 78000, 'HOME: PM Surya Ghar Subsidy Applied', `₹${homeAssess.subsidy}`);
    assert(homeAssess.tariff === 7.5, 'HOME: Residential Tariff Slab', `₹${homeAssess.tariff}/unit`);
    assert(
      homeAssess.aiExplanation.includes('household of 3-4 people') && homeAssess.aiExplanation.includes('Air Conditioner'),
      'HOME: AI Explanation Dynamic Grounding',
      `Mentions household & EV/AC appliances`
    );
    assert(homeRec.systemOptions.length === 5, 'HOME: Cost Optimization Matrix Generated', `5 sizing options`);

    // Verify Latest Assessment Endpoint (Dashboard data)
    const homeLatest = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/solar/latest',
        method: 'GET',
        headers: authHeaders,
      }
    );
    assert(
      homeLatest.status === 200 && homeLatest.body.assessment && homeLatest.body.assessment.userType === 'residential',
      'HOME: Dashboard Data Sync',
      `Latest assessment matches HOME profile`
    );

    // ==========================================
    // PATH 2: FARM (Agricultural)
    // ==========================================
    console.log('\n---------------------------------------------------------------');
    console.log(' PATH 2: FARM (Agricultural Sizing & Pump)');
    console.log('---------------------------------------------------------------');
    const farmPayload = {
      userType: 'farm',
      location: { state: 'Maharashtra', city: 'Nashik' },
      roofArea: 2500,
      roofType: 'open_ground',
      roofOrientation: 'south',
      dayNightUsage: 'day_heavy',
      categoryDetails: {
        farmAcres: '6',
        pumpCount: '1',
        pumpPower: '7.5',
        pumpPowerUnit: 'HP',
        dailyHours: '8',
        monthlyDays: '25',
        irrigationType: 'Borewell / Tube well',
        gridConnection: '3-Phase Connected',
        solarOption: 'farm_and_home',
      },
    };

    const farmRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/solar/assess',
        method: 'POST',
        headers: authHeaders,
      },
      farmPayload
    );

    assert(farmRes.status === 201 && farmRes.body.success, 'FARM: Assessment Execution');
    const farmAssess = farmRes.body.assessment;
    assert(
      farmAssess.monthlyConsumption > 1000,
      'FARM: Consumption Auto-Calculated from Pump Specs',
      `${farmAssess.monthlyConsumption} kWh/mo from 7.5 HP pump`
    );
    assert(
      farmAssess.recommendedCapacity >= 8 && farmAssess.recommendedCapacity <= 15,
      'FARM: Sizing Matches Agricultural Motor Load',
      `${farmAssess.recommendedCapacity} kW (${farmAssess.panelCount} panels)`
    );
    assert(farmAssess.tariff === 4.0, 'FARM: Subsidized Agricultural Tariff', `₹${farmAssess.tariff}/unit`);
    assert(farmAssess.subsidy === 0, 'FARM: Residential Subsidy Ineligible', `₹0 subsidy (commercial/farm rules)`);
    assert(
      farmAssess.aiExplanation.includes('7.5 HP') && farmAssess.aiExplanation.includes('6-acre'),
      'FARM: AI Explanation Dynamic Grounding',
      `Mentions 7.5 HP pump & 6-acre farm`
    );

    const farmLatest = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/solar/latest',
        method: 'GET',
        headers: authHeaders,
      }
    );
    assert(
      farmLatest.status === 200 && farmLatest.body.assessment.userType === 'farm',
      'FARM: Dashboard Data Sync',
      `Dashboard updated to FARM metrics (${farmLatest.body.assessment.recommendedCapacity} kW)`
    );

    // ==========================================
    // PATH 3: SMALL BUSINESS (Commercial)
    // ==========================================
    console.log('\n---------------------------------------------------------------');
    console.log(' PATH 3: SMALL BUSINESS (Commercial Daytime Enterprise)');
    console.log('---------------------------------------------------------------');
    const smallBizPayload = {
      userType: 'small_business',
      location: { state: 'Maharashtra', city: 'Pune' },
      monthlyConsumption: 1600,
      monthlyBill: 15200,
      roofArea: 2000,
      roofType: 'concrete_flat',
      roofOrientation: 'east_west',
      dayNightUsage: 'day_heavy',
      categoryDetails: {
        businessType: 'Cafe / Restaurant / Bakery',
        dailyHours: '12',
        monthlyDays: '26',
        majorEquipment: ['Commercial Refrigeration', 'Baking Ovens / Heaters'],
      },
    };

    const smallBizRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/solar/assess',
        method: 'POST',
        headers: authHeaders,
      },
      smallBizPayload
    );

    assert(smallBizRes.status === 201 && smallBizRes.body.success, 'SMALL BUSINESS: Assessment Execution');
    const sbAssess = smallBizRes.body.assessment;
    assert(
      sbAssess.recommendedCapacity >= 10 && sbAssess.recommendedCapacity <= 18,
      'SMALL BUSINESS: Optimal Commercial Sizing',
      `${sbAssess.recommendedCapacity} kW (${sbAssess.panelCount} panels)`
    );
    assert(sbAssess.tariff === 9.5, 'SMALL BUSINESS: Commercial Tariff', `₹${sbAssess.tariff}/unit`);
    assert(
      sbAssess.paybackPeriod <= 5.0,
      'SMALL BUSINESS: Rapid Commercial Payback',
      `Payback in ${sbAssess.paybackPeriod} years (ROI: ${sbAssess.roi}%)`
    );
    assert(
      sbAssess.aiExplanation.includes('Cafe / Restaurant / Bakery') && sbAssess.aiExplanation.includes('Commercial Refrigeration'),
      'SMALL BUSINESS: AI Explanation Dynamic Grounding',
      `Mentions bakery enterprise and commercial refrigeration`
    );

    const sbLatest = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/solar/latest',
        method: 'GET',
        headers: authHeaders,
      }
    );
    assert(
      sbLatest.status === 200 && sbLatest.body.assessment.userType === 'small_business',
      'SMALL BUSINESS: Dashboard Data Sync',
      `Dashboard updated to SMALL BUSINESS metrics`
    );

    // ==========================================
    // PATH 4: LARGE BUSINESS (Industrial / C&I)
    // ==========================================
    console.log('\n---------------------------------------------------------------');
    console.log(' PATH 4: LARGE BUSINESS (Industrial Manufacturing)');
    console.log('---------------------------------------------------------------');
    const largeBizPayload = {
      userType: 'large_business',
      location: { state: 'Gujarat', city: 'Surat' },
      monthlyConsumption: 36000,
      monthlyBill: 396000,
      roofArea: 35000,
      roofType: 'metal_sheet',
      roofOrientation: 'south',
      dayNightUsage: 'day_heavy',
      categoryDetails: {
        industryType: 'Manufacturing & Textiles',
        sanctionedLoad: '250',
        dailyHours: '16',
        monthlyDays: '26',
        machineryLoad: ['Heavy Motors & Compressors', 'Industrial Chillers'],
        installationType: 'rooftop',
      },
    };

    const largeBizRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/solar/assess',
        method: 'POST',
        headers: authHeaders,
      },
      largeBizPayload
    );

    assert(largeBizRes.status === 201 && largeBizRes.body.success, 'LARGE BUSINESS: Assessment Execution');
    const lbAssess = largeBizRes.body.assessment;
    assert(
      lbAssess.recommendedCapacity >= 200,
      'LARGE BUSINESS: High-Capacity Industrial Sizing',
      `${lbAssess.recommendedCapacity} kW (${lbAssess.panelCount} panels)`
    );
    assert(lbAssess.tariff === 11.0, 'LARGE BUSINESS: Industrial HT Tariff', `₹${lbAssess.tariff}/unit`);
    assert(
      lbAssess.annualSavings > 2500000,
      'LARGE BUSINESS: Multi-Million INR Annual OPEX Reduction',
      `₹${lbAssess.annualSavings.toLocaleString('en-IN')}/year savings`
    );
    assert(
      lbAssess.aiExplanation.includes('Manufacturing & Textiles') && lbAssess.aiExplanation.includes('250 kW'),
      'LARGE BUSINESS: AI Explanation Dynamic Grounding',
      `Mentions textiles facility & 250 kW sanctioned load`
    );

    const lbLatest = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/solar/latest',
        method: 'GET',
        headers: authHeaders,
      }
    );
    assert(
      lbLatest.status === 200 && lbLatest.body.assessment.userType === 'large_business',
      'LARGE BUSINESS: Dashboard Data Sync',
      `Dashboard updated to LARGE BUSINESS metrics (${lbLatest.body.assessment.recommendedCapacity} kW)`
    );

    console.log('\n===============================================================');
    console.log(`   TEST SUITE SUMMARY: ${passed} / ${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('===============================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal Test Execution Error:', err);
    process.exit(1);
  }
}

runDynamicTests();
