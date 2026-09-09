require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Bill = require('../models/Bill');
const SolarAssessment = require('../models/SolarAssessment');
const Recommendation = require('../models/Recommendation');
const Report = require('../models/Report');
const SystemSetting = require('../models/SystemSetting');
const aiService = require('../ai/aiService');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/solarsense_ai');
    console.log(`[Seed] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

const seed = async () => {
  await connectDB();

  console.log('[Seed] Clearing existing collections...');
  await User.deleteMany({});
  await Bill.deleteMany({});
  await SolarAssessment.deleteMany({});
  await Recommendation.deleteMany({});
  await Report.deleteMany({});
  await SystemSetting.deleteMany({});

  console.log('[Seed] Creating default Admin...');
  const admin = await User.create({
    name: 'SolarSense System Admin',
    email: 'admin@solarsense.ai',
    password: 'Admin@12345',
    phone: '+91 98765 43210',
    location: { state: 'Maharashtra', city: 'Pune', pincode: '411001' },
    userType: 'residential',
    role: 'admin',
  });
  console.log(` -> Admin created: ${admin.email} (Password: Admin@12345)`);

  console.log('[Seed] Creating categorized Demo Users...');
  const demoUsersData = [
    {
      name: 'Rahul Sharma',
      email: 'rahul.residential@solarsense.ai',
      password: 'User@12345',
      phone: '+91 98234 11223',
      location: { state: 'Maharashtra', city: 'Pune', pincode: '411038' },
      userType: 'residential',
      consumption: 380,
      monthlyBill: 2850,
      roofArea: 650,
      tariff: 7.5,
    },
    {
      name: 'Ramesh Patil (Kisan Green Farms)',
      email: 'ramesh.farm@solarsense.ai',
      password: 'User@12345',
      phone: '+91 94220 55667',
      location: { state: 'Maharashtra', city: 'Nashik', pincode: '422003' },
      userType: 'farm',
      consumption: 1850,
      monthlyBill: 7400,
      roofArea: 3500,
      tariff: 4.0,
    },
    {
      name: 'Priya Verma (Urban Cafe & Bakery)',
      email: 'priya.business@solarsense.ai',
      password: 'User@12345',
      phone: '+91 99887 66554',
      location: { state: 'Karnataka', city: 'Bengaluru', pincode: '560001' },
      userType: 'small_business',
      consumption: 1250,
      monthlyBill: 11875,
      roofArea: 1400,
      tariff: 9.5,
    },
    {
      name: 'Arjun Singhania (Apex Industrial Textiles)',
      email: 'arjun.commercial@solarsense.ai',
      password: 'User@12345',
      phone: '+91 98111 22334',
      location: { state: 'Gujarat', city: 'Surat', pincode: '395002' },
      userType: 'large_business',
      consumption: 16500,
      monthlyBill: 181500,
      roofArea: 18000,
      tariff: 11.0,
    },
  ];

  for (const item of demoUsersData) {
    const user = await User.create({
      name: item.name,
      email: item.email,
      password: item.password,
      phone: item.phone,
      location: item.location,
      userType: item.userType,
      role: 'user',
    });

    console.log(` -> Demo user created: ${user.email} (${user.userType})`);

    // Create realistic electricity bills (3 months history)
    const months = ['November', 'December', 'January'];
    for (let i = 0; i < months.length; i++) {
      const variation = 1 + (i - 1) * 0.05;
      const units = Math.round(item.consumption * variation);
      const amount = Math.round(units * item.tariff);

      const billAnalysis = await aiService.analyzeBill({
        unitsConsumed: units,
        totalAmount: amount,
        userType: item.userType,
        tariff: item.tariff,
      });

      await Bill.create({
        userId: user._id,
        fileName: `${months[i]}_Electricity_Bill.pdf`,
        fileUrl: '',
        fileType: 'application/pdf',
        billingMonth: months[i],
        billingYear: 2025,
        billingPeriodDays: 30,
        unitsConsumed: units,
        totalAmount: amount,
        tariff: item.tariff,
        consumerCategory: item.userType === 'residential' ? 'LT-I Domestic' : item.userType === 'farm' ? 'AG-Agriculture' : 'Commercial HT',
        extractionMethod: 'parsed',
        aiInsights: billAnalysis,
        status: 'analyzed',
        createdAt: new Date(Date.now() - (months.length - i) * 30 * 24 * 60 * 60 * 1000),
      });
    }

    // Run Solar Assessment
    const recommendationResult = await aiService.generateRecommendation({
      userType: item.userType,
      location: item.location,
      monthlyConsumption: item.consumption,
      monthlyBill: item.monthlyBill,
      tariff: item.tariff,
      roofArea: item.roofArea,
      roofType: 'concrete_flat',
      shadingCondition: 'none',
      gridPreference: item.userType === 'farm' ? 'hybrid' : 'on_grid',
      batteryRequirement: item.userType === 'farm',
      budget: 0,
    });

    const { metrics, systemOptions, aiExplanation, solarSuitability } = recommendationResult;

    const assessment = await SolarAssessment.create({
      userId: user._id,
      userType: item.userType,
      location: item.location,
      monthlyConsumption: item.consumption,
      monthlyBill: item.monthlyBill,
      tariff: metrics.tariff,
      roofArea: item.roofArea,
      roofType: 'concrete_flat',
      shadingCondition: 'none',
      gridPreference: item.userType === 'farm' ? 'hybrid' : 'on_grid',
      batteryRequirement: item.userType === 'farm',
      budget: 0,

      recommendedCapacity: metrics.recommendedCapacity,
      estimatedDailyGeneration: metrics.dailyGeneration,
      estimatedGeneration: metrics.annualGeneration,
      panelCount: metrics.panelCount,
      panelWattage: metrics.panelWattage,
      inverterCapacity: metrics.inverterCapacity,
      areaRequiredSqFt: metrics.areaRequiredSqFt,

      estimatedCost: metrics.systemCost,
      subsidy: metrics.subsidy,
      netCost: metrics.netCost,
      annualSavings: metrics.annualSavings,
      monthlySavings: metrics.monthlySavings,
      paybackPeriod: metrics.paybackPeriod,
      roi: metrics.roi,

      co2AvoidedKg: metrics.co2AvoidedKg,
      treesPlanted: metrics.treesPlanted,

      assumptions: metrics.assumptions,
      aiExplanation,
      solarSuitability,
    });

    const recommendation = await Recommendation.create({
      userId: user._id,
      assessmentId: assessment._id,
      systemOptions,
      recommendedCapacity: metrics.recommendedCapacity,
      aiExplanation,
      technicalSummary: recommendationResult.technicalSummary,
      financialSummary: recommendationResult.financialSummary,
    });

    // Create Report
    const reportNumber = `SS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    await Report.create({
      userId: user._id,
      assessmentId: assessment._id,
      recommendationId: recommendation._id,
      reportNumber,
      title: `Solar Feasibility & Cost Optimization Report — ${item.userType.toUpperCase()}`,
      summaryData: {
        userName: user.name,
        userEmail: user.email,
        userType: item.userType,
        location: assessment.location,
        inputs: {
          monthlyConsumption: item.consumption,
          monthlyBill: item.monthlyBill,
          roofArea: item.roofArea,
          roofType: 'concrete_flat',
          shadingCondition: 'none',
          gridPreference: item.userType === 'farm' ? 'hybrid' : 'on_grid',
          tariff: metrics.tariff,
        },
        outputs: {
          recommendedCapacity: metrics.recommendedCapacity,
          annualGeneration: metrics.annualGeneration,
          panelCount: metrics.panelCount,
          inverterCapacity: metrics.inverterCapacity,
          systemCost: metrics.systemCost,
          subsidy: metrics.subsidy,
          netCost: metrics.netCost,
          annualSavings: metrics.annualSavings,
          paybackPeriod: metrics.paybackPeriod,
          roi: metrics.roi,
          co2AvoidedKg: metrics.co2AvoidedKg,
          treesPlanted: metrics.treesPlanted,
        },
        assumptions: metrics.assumptions,
        aiExplanation,
      },
      status: 'generated',
    });
  }

  console.log('[Seed] Populating System Settings...');
  const settingsData = [
    {
      key: 'peak_sun_hours_default',
      value: 4.8,
      category: 'solar_resource',
      label: 'Default Peak Sun Hours',
      description: 'Daily equivalent hours of 1,000 W/m² solar irradiance (India average).',
      unit: 'Hours/day',
    },
    {
      key: 'performance_ratio_default',
      value: 0.78,
      category: 'solar_resource',
      label: 'Performance Ratio (PR)',
      description: 'System net efficiency derate factor accounting for inverter losses, temperature, and dust.',
      unit: 'Ratio (0 - 1.0)',
    },
    {
      key: 'residential_cost_per_kw',
      value: 60000,
      category: 'cost',
      label: 'Residential Solar Cost per kW',
      description: 'Average turnkey rooftop installation cost including structure, panels, inverter, and wiring.',
      unit: 'INR / kW',
    },
    {
      key: 'commercial_cost_per_kw',
      value: 48000,
      category: 'cost',
      label: 'Commercial Scale Cost per kW',
      description: 'Economies of scale cost for commercial & industrial rooftop installations.',
      unit: 'INR / kW',
    },
    {
      key: 'pm_surya_ghar_max_subsidy',
      value: 78000,
      category: 'subsidy',
      label: 'PM Surya Ghar Max Subsidy',
      description: 'Maximum financial assistance for residential rooftop installations up to 3 kW and above.',
      unit: 'INR',
    },
    {
      key: 'grid_co2_emission_factor',
      value: 0.82,
      category: 'general',
      label: 'Grid CO2 Emission Factor',
      description: 'Central Electricity Authority average grid emission factor for India.',
      unit: 'kg CO2 / kWh',
    },
  ];

  for (const s of settingsData) {
    await SystemSetting.create(s);
  }

  console.log('[Seed] Database seeded successfully with Admin, Demo Accounts, and Settings!');
  process.exit(0);
};

seed();
