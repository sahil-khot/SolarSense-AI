const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== SOLAR COMPANIES VERIFICATION TESTS ===\n');

  // Test 1: GET /api/companies
  console.log('Test 1: Fetching all companies...');
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/companies',
    method: 'GET',
  });
  console.log(`Status: ${res1.status}, Count: ${res1.body.count}`);
  if (res1.body.count !== 10) {
    console.error('FAIL: Expected 10 companies, got', res1.body.count);
  } else {
    console.log('PASS: All 10 companies returned.');
  }

  // Check advantages & disadvantages for each company
  let allHaveProsCons = true;
  for (const c of res1.body.companies) {
    if (!c.advantages || c.advantages.length === 0 || !c.disadvantages || c.disadvantages.length === 0) {
      console.error(`FAIL: ${c.name} is missing pros/cons!`);
      allHaveProsCons = false;
    }
  }
  if (allHaveProsCons) {
    console.log('PASS: All 10 companies have verified advantages (pros) and disadvantages (cons).');
  }

  // Test 2: Filter by Tier-1
  console.log('\nTest 2: Filtering by Tier-1...');
  const res2 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/companies?tier=Tier-1',
    method: 'GET',
  });
  console.log(`Status: ${res2.status}, Tier-1 Count: ${res2.body.count}`);

  // Test 3: Matching API
  console.log('\nTest 3: Testing /api/companies/match for 3.5 kW residential...');
  const res3 = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/companies/match',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      capacityKW: 3.5,
      userType: 'residential',
      location: { state: 'Maharashtra', city: 'Pune' },
      preference: 'best_overall',
    }
  );
  console.log(`Status: ${res3.status}, TopMatches Count: ${res3.body.topMatches?.length}`);
  if (res3.body.topMatches?.length > 0) {
    const top = res3.body.topMatches[0];
    console.log(`Top match: ${top.company.name} (${top.matchScore}%)`);
    console.log(`Est cost: ${top.estimatedCostForCapacity}`);
    console.log(`Why matched: ${top.whyMatchedBullets?.join('; ')}`);
    console.log('PASS: Match algorithm returned ranked companies.');
  } else {
    console.error('FAIL: No topMatches returned.');
  }

  // Test 4: Single company lookup by slug
  console.log('\nTest 4: Single company lookup by slug (tata-power-solar)...');
  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/companies/tata-power-solar',
    method: 'GET',
  });
  console.log(`Status: ${res4.status}, Company: ${res4.body.company?.name}`);
  console.log(`Price snapshots: ${res4.body.priceSnapshots?.length}`);
  if (res4.body.company && res4.body.priceSnapshots?.length > 0) {
    console.log('PASS: Single company and price snapshots fetched successfully.');
  } else {
    console.error('FAIL: Could not fetch company or price snapshots.');
  }

  console.log('\n=== ALL TESTS FINISHED ===');
}

runTests().catch(console.error);
