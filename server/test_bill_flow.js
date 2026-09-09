const http = require('http');
const fs = require('fs');
const path = require('path');

function request(options, data, isMultipart = false) {
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
      if (isMultipart) {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

function createMultipartFormData(boundary, fieldName, filePath, mimeType) {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);

  const header = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;

  return Buffer.concat([
    Buffer.from(header, 'utf-8'),
    fileContent,
    Buffer.from(footer, 'utf-8'),
  ]);
}

async function runBillFlowTest() {
  console.log('================================================================');
  console.log('   SOLARSENSE AI — REDESIGNED BILL ANALYSIS & SOLAR SIZING TEST ');
  console.log('================================================================\n');

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
    console.log('[Step 1] Authenticating Test User...');
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

    const token = loginRes.body?.token;
    assert(loginRes.status === 200 && token, 'User Authentication', `Token obtained for ${loginRes.body?.user?.name}`);

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    // 2. Upload sample electricity bill
    console.log('\n[Step 2] Uploading Sample DISCOM Electricity Bill...');
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf') || f.endsWith('.jpeg'));

    if (files.length === 0) {
      throw new Error('No test bill files available in uploads/');
    }

    const pdfFile = files.find(f => f.endsWith('.pdf')) || files[0];
    const testFile = path.join(uploadsDir, pdfFile);
    const mimeType = testFile.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const multipartData = createMultipartFormData(boundary, 'billFile', testFile, mimeType);

    const uploadRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/bills/upload',
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': multipartData.length,
        },
      },
      multipartData,
      true
    );

    console.log('Upload status:', uploadRes.status, 'body:', JSON.stringify(uploadRes.body));
    assert(uploadRes.status === 201 && uploadRes.body?.success, 'Bill Upload & Analysis API Succeeded');
    const bill = uploadRes.body?.bill;
    const analysis = uploadRes.body?.analysis || bill?.aiInsights;

    assert(
      typeof bill.unitsConsumed === 'number' && bill.unitsConsumed > 0,
      'Consumption Extracted Automatically',
      `${bill.unitsConsumed} kWh`
    );

    assert(
      typeof bill.totalAmount === 'number' && bill.totalAmount > 0,
      'Bill Amount Extracted Automatically',
      `₹${bill.totalAmount}`
    );

    assert(
      bill.verificationStatus === 'verified',
      'No Confirmation Form Forced (verificationStatus is verified)',
      `Status: ${bill.verificationStatus}`
    );

    assert(
      uploadRes.body.needsVerification === undefined || uploadRes.body.needsVerification === false,
      'Zero Manual Confirmation State Flag',
      'needsVerification is false'
    );

    // Check new analysis shape
    assert(
      analysis && typeof analysis.consumptionInsight === 'string' && analysis.consumptionInsight.length > 20,
      'Consumption Insight Formulated Meaningfully',
      analysis.consumptionInsight?.substring(0, 75) + '...'
    );

    assert(
      analysis && typeof analysis.costInsight === 'string' && analysis.costInsight.includes('₹'),
      'Cost Insight Formulated Simply',
      analysis.costInsight?.substring(0, 75) + '...'
    );

    assert(
      analysis?.solarPotential && analysis.solarPotential.recommendedCapacityRange,
      'Solar Potential Sizing Range Computed',
      `Range: ${analysis?.solarPotential?.recommendedCapacityRange}`
    );

    assert(
      analysis?.solarPotential && analysis.solarPotential.keyFactors && analysis.solarPotential.keyFactors.length >= 3,
      'Key Installation Factors Provided',
      `${analysis?.solarPotential?.keyFactors?.length} factors listed`
    );

    assert(
      analysis.solarSuitability === undefined || !['Good', 'Moderate', 'Excellent', 'Poor'].includes(analysis.solarSuitability),
      'Generic Ratings (Good/Moderate/Excellent) Removed',
      'No generic rating labels'
    );

    // 3. Test Direct Solar Recommendation CTA
    console.log('\n[Step 3] Triggering "Recommend My Solar System" from Bill Data...');
    const recRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/bills/${bill._id}/generate-recommendation`,
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    });

    assert(recRes.status === 201 && recRes.body?.success, 'Recommendation Generated from Bill Data');
    const assessment = recRes.body?.assessment;
    const recommendation = recRes.body?.recommendation;

    assert(
      assessment.sourceType === 'bill_upload' && assessment.sourceBill,
      'Assessment Provenance Linked to Bill',
      `sourceBill: ${assessment.sourceBill}`
    );

    assert(
      assessment.monthlyConsumption === bill.unitsConsumed,
      'Assessment Consumption Matches Bill Exact Units',
      `${assessment.monthlyConsumption} kWh = ${bill.unitsConsumed} kWh`
    );

    assert(
      assessment.recommendedCapacity >= 1,
      'Data-Driven Capacity Sized Accurately',
      `${assessment.recommendedCapacity} kW (${assessment.panelCount} panels)`
    );

    assert(
      recommendation.systemOptions && recommendation.systemOptions.length >= 3,
      'System Comparison Options Generated',
      `${recommendation.systemOptions.length} capacity tiers`
    );

    // 4. Verify Latest Assessment Endpoint (Used by /solar-recommendation)
    console.log('\n[Step 4] Verifying Solar Recommendation Page Feed (/api/solar/latest)...');
    const latestRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/solar/latest',
      method: 'GET',
      headers: authHeaders,
    });

    assert(
      latestRes.status === 200 && latestRes.body?.assessment?._id === assessment._id,
      'Solar Recommendation Page Loads Bill-Derived Assessment',
      `Assessment ID: ${assessment._id}`
    );

    // 5. Verify History API
    console.log('\n[Step 5] Verifying Bill History Feed (/api/bills)...');
    const historyRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/bills',
      method: 'GET',
      headers: authHeaders,
    });

    assert(
      historyRes.status === 200 && Array.isArray(historyRes.body?.bills) && historyRes.body.bills.length > 0,
      'Bill History Returns Analyzed Records',
      `${historyRes.body.bills.length} bills in history`
    );

    const historyBill = historyRes.body.bills.find(b => b._id === bill._id);
    assert(
      historyBill && historyBill.unitsConsumed === bill.unitsConsumed,
      'History Preserves Consumption & Bill Figures',
      `${historyBill.unitsConsumed} kWh | ₹${historyBill.totalAmount}`
    );

    console.log('\n================================================================');
    console.log(`   TEST SUMMARY: ${passed} / ${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal Test Execution Error:', err);
    process.exit(1);
  }
}

runBillFlowTest();
