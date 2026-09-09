const assert = require('assert');
const {
  calculateSolarMetrics,
  calculateUsableRoofArea,
  generateOptimizationMatrix,
  getStandardInverterSize,
} = require('./utils/solarCalculations');
const { calculateGovernmentSubsidy } = require('./config/subsidySchemes');

console.log('=== RUNNING DETERMINISTIC ENGINEERING & FINANCIAL UNIT TESTS ===\n');
let passed = 0;
let total = 0;

function it(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(` ✅ PASS: ${name}`);
  } catch (err) {
    console.error(` ❌ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

// 1. Sizing Tests
it('Sizes residential system proportional to consumption', () => {
  const res = calculateSolarMetrics({
    monthlyConsumption: 450,
    monthlyBill: 3375,
    userType: 'residential',
    roofArea: 800,
    roofType: 'concrete_flat',
    tariff: 7.5,
  });

  assert(res.recommendedCapacity > 0, 'Capacity must be positive');
  assert(res.annualGeneration > 0, 'Annual generation must be positive');
  assert(res.panelCount > 0, 'Panels must be sized');
  assert(res.inverterCapacity >= res.recommendedCapacity * 0.95, 'Inverter must match DC capacity');
  assert(res.subsidy <= 78000, 'PM Surya Ghar subsidy cannot exceed ₹78,000 ceiling');
  assert(res.netCost === res.systemCost - res.subsidy, 'Net cost must equal gross cost minus subsidy');
});

// 2. Roof Area Constraint Test
it('Clamps capacity to roof physical limits when roof area is tiny', () => {
  const tinyRoof = calculateSolarMetrics({
    monthlyConsumption: 1200, // Demands ~8-10 kW
    monthlyBill: 9000,
    userType: 'residential',
    roofArea: 100, // Tiny roof: ~100 sq.ft can only host ~0.5 - 1 kW
    roofType: 'concrete_flat',
  });

  assert(tinyRoof.areaConstraintApplied === true, 'Area constraint must be flagged as applied');
  assert(tinyRoof.recommendedCapacity <= 1.5, 'Capacity must be constrained by tiny roof');
});

// 3. PM Surya Ghar Subsidy Tiering
it('Applies correct PM Surya Ghar DBT slabs', () => {
  const sub1kW = calculateGovernmentSubsidy(1.0, 'residential');
  assert.strictEqual(sub1kW.subsidyAmount, 30000, '1 kW subsidy should be ₹30,000');

  const sub2kW = calculateGovernmentSubsidy(2.0, 'residential');
  assert.strictEqual(sub2kW.subsidyAmount, 60000, '2 kW subsidy should be ₹60,000');

  const sub3kW = calculateGovernmentSubsidy(3.0, 'residential');
  assert.strictEqual(sub3kW.subsidyAmount, 78000, '3 kW subsidy should be ₹78,000');

  const sub5kW = calculateGovernmentSubsidy(5.0, 'residential');
  assert.strictEqual(sub5kW.subsidyAmount, 78000, '5 kW residential subsidy should cap at ₹78,000');

  const subComm = calculateGovernmentSubsidy(5.0, 'small_business');
  assert.strictEqual(subComm.subsidyAmount, 0, 'Commercial/Business users do not receive residential DBT subsidy');
});

// 4. Financial Calculations & Payback
it('Calculates reasonable financial payback and positive ROI', () => {
  const res = calculateSolarMetrics({
    monthlyConsumption: 400,
    monthlyBill: 3000,
    userType: 'residential',
    roofArea: 600,
    tariff: 7.5,
  });

  assert(res.paybackPeriod > 1 && res.paybackPeriod < 15, `Payback (${res.paybackPeriod} yrs) should be realistic`);
  assert(res.roi > 50, '25-year solar lifecycle ROI should be strongly positive');
  assert(res.co2AvoidedKg > 0, 'CO2 offsets must be positive');
});

// 5. Multi-tier Optimization Matrix
it('Generates 5 distinct comparison options in optimization matrix', () => {
  const matrix = generateOptimizationMatrix({
    recommendedCapacity: 3.5,
    userType: 'residential',
    monthlyConsumption: 420,
    roofArea: 700,
    tariff: 7.5,
    roofType: 'concrete_flat',
  });

  assert.strictEqual(matrix.length, 5, 'Optimization matrix must return 5 distinct system options');
  assert(matrix.some(o => o.isRecommended === true), 'Must have an isRecommended tier');
  assert(matrix.some(o => o.tierLabel.toLowerCase().includes('budget')), 'Must have a budget tier');
});

console.log(`\nResults: ${passed}/${total} tests passed.`);
if (passed === total) {
  console.log('✅ ALL ENGINEERING & FINANCIAL ENGINE TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
