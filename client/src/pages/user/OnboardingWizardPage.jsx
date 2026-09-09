import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Tractor,
  Store,
  Factory,
  ArrowRight,
  ArrowLeft,
  Check,
  HelpCircle,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  AlertCircle,
  Compass,
  Sun,
  Layers,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { solarService } from '../../services/solarService';

const OnboardingWizardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    userType: user?.userType || 'residential',
    location: {
      state: user?.location?.state || 'Maharashtra',
      city: user?.location?.city || 'Pune',
      pincode: user?.location?.pincode || '',
    },
    // Common Energy Inputs
    monthlyConsumption: '',
    monthlyBill: '',
    tariff: '',

    // HOME specific
    householdSize: '3-4',
    appliances: ['Air Conditioner (AC)', 'Electric Geyser / Water Heater'],

    // FARM specific
    farmAcres: '4',
    hasFarmBill: false,
    pumpCount: '1',
    pumpPower: '5',
    pumpPowerUnit: 'HP',
    dailyHours: '6',
    monthlyDays: '25',
    irrigationType: 'Borewell / Tube well',
    gridConnection: '3-Phase Connected',
    solarOption: 'farm_and_home', // 'solar_pump_only' | 'farm_and_home'

    // SMALL BUSINESS specific
    businessType: 'Retail Store / Showroom',
    smallBizHours: '10',
    smallBizDays: '26',
    majorEquipment: ['Commercial Refrigeration', 'HVAC / Central AC'],

    // LARGE BUSINESS specific
    industryType: 'Manufacturing & Textiles',
    sanctionedLoad: '120',
    dontKnowLoad: false,
    largeBizHours: '16',
    largeBizDays: '26',
    machineryLoad: ['Heavy Motors & Compressors', 'Industrial Chillers'],
    largeGridConnection: 'High Tension (11kV / 33kV HT)',
    installationPreference: 'rooftop', // 'rooftop' | 'ground_mounted' | 'hybrid'

    // Common Step 3 Inputs
    roofArea: '',
    roofType: 'concrete_flat',
    roofOrientation: 'south', // 'south', 'east_west', 'north', 'unknown'
    dayNightUsage: 'balanced', // 'day_heavy', 'balanced', 'night_heavy'
    shadingCondition: 'none',
    gridPreference: 'on_grid',
    batteryRequirement: false,
    budget: '',
  });

  const userTypeOptions = [
    {
      id: 'residential',
      title: 'Home / Residential',
      icon: Home,
      subtitle: 'Villas, Flats & Housing Societies',
      desc: 'Optimized for household appliances, slab-tariff offset, and PM Surya Ghar subsidies.',
      defaultArea: '800',
      defaultUnits: '350',
    },
    {
      id: 'farm',
      title: 'Farm / Agricultural',
      icon: Tractor,
      subtitle: 'Pumps, Tube Wells & Rural Estates',
      desc: 'Synchronized with daytime irrigation schedules, pump horsepower, and subsidized tariffs.',
      defaultArea: '2500',
      defaultUnits: '750',
    },
    {
      id: 'small_business',
      title: 'Small Business',
      icon: Store,
      subtitle: 'Retail, Bakeries, Offices & Clinics',
      desc: 'Targeted daytime commercial loads (9am–6pm) to eliminate peak grid utility tariffs.',
      defaultArea: '1500',
      defaultUnits: '1250',
    },
    {
      id: 'large_business',
      title: 'Large Business / Industrial',
      icon: Factory,
      subtitle: 'Factories, Warehouses & Campuses',
      desc: 'High-voltage multi-shift operations, sanctioned load limits, and commercial ESG savings.',
      defaultArea: '12000',
      defaultUnits: '16000',
    },
  ];

  // Helper to handle auto-calculation between units and bill
  const handleConsumptionChange = (val) => {
    const units = val;
    const defaultTariff = formData.userType === 'farm' ? 4.0 : formData.userType === 'small_business' ? 9.5 : formData.userType === 'large_business' ? 11.0 : 7.5;
    const bill = units ? Math.round(Number(units) * defaultTariff) : '';
    setFormData((prev) => ({
      ...prev,
      monthlyConsumption: units,
      monthlyBill: bill ? String(bill) : '',
    }));
  };

  const handleBillChange = (val) => {
    const bill = val;
    const defaultTariff = formData.userType === 'farm' ? 4.0 : formData.userType === 'small_business' ? 9.5 : formData.userType === 'large_business' ? 11.0 : 7.5;
    const units = bill ? Math.round(Number(bill) / defaultTariff) : '';
    setFormData((prev) => ({
      ...prev,
      monthlyBill: bill,
      monthlyConsumption: units ? String(units) : '',
    }));
  };

  const toggleArrayItem = (fieldName, item) => {
    setFormData((prev) => {
      const list = prev[fieldName] || [];
      if (list.includes(item)) {
        return { ...prev, [fieldName]: list.filter((i) => i !== item) };
      }
      return { ...prev, [fieldName]: [...list, item] };
    });
  };

  // STEP VALIDATION
  const validateStep = () => {
    setError('');

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Please enter your name or facility identifier.');
        return false;
      }
      if (!formData.location.state || !formData.location.city) {
        setError('Please enter your state and city so we can resolve accurate solar irradiance.');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      const { userType } = formData;

      if (userType === 'residential') {
        const units = Number(formData.monthlyConsumption);
        const bill = Number(formData.monthlyBill);
        if (!units && !bill) {
          setError('Please enter your monthly electricity consumption (kWh) or average bill (₹).');
          return false;
        }
        if (units < 0 || bill < 0) {
          setError('Electricity consumption and bill amounts cannot be negative.');
          return false;
        }
        if (units > 25000) {
          setError('Residential consumption typically ranges from 50 to 5,000 kWh/month. Please verify your input.');
          return false;
        }
      } else if (userType === 'farm') {
        if (!formData.farmAcres || Number(formData.farmAcres) <= 0) {
          setError('Please enter your farm land area in acres (e.g. 2, 5, 10).');
          return false;
        }
        if (Number(formData.farmAcres) > 5000) {
          setError('Please enter a realistic farm area (under 5,000 acres).');
          return false;
        }
        if (formData.hasFarmBill) {
          const units = Number(formData.monthlyConsumption);
          if (!units || units <= 0) {
            setError('Please enter positive monthly electricity consumption units or switch to pump calculation.');
            return false;
          }
        } else {
          if (!formData.pumpPower || Number(formData.pumpPower) <= 0) {
            setError('Please provide your irrigation pump motor rating (e.g. 5 HP).');
            return false;
          }
          const hours = Number(formData.dailyHours);
          if (!hours || hours <= 0 || hours > 24) {
            setError('Daily pump operating hours must be between 1 and 24 hours/day.');
            return false;
          }
          const days = Number(formData.monthlyDays);
          if (!days || days <= 0 || days > 31) {
            setError('Monthly operating days must be between 1 and 31 days/month.');
            return false;
          }
        }
      } else if (userType === 'small_business') {
        const units = Number(formData.monthlyConsumption);
        const bill = Number(formData.monthlyBill);
        if (!units && !bill) {
          setError('Please enter monthly electricity consumption (kWh) or average bill amount.');
          return false;
        }
        if (units < 0 || bill < 0) {
          setError('Consumption or bill cannot be negative.');
          return false;
        }
        const hours = Number(formData.smallBizHours);
        if (hours <= 0 || hours > 24) {
          setError('Daily business hours must be between 1 and 24 hours/day.');
          return false;
        }
      } else if (userType === 'large_business') {
        const units = Number(formData.monthlyConsumption);
        const bill = Number(formData.monthlyBill);
        if (!units && !bill) {
          setError('Please enter monthly electricity consumption (kWh) or monthly bill.');
          return false;
        }
        if (units < 0 || bill < 0) {
          setError('Consumption or bill cannot be negative.');
          return false;
        }
        if (!formData.dontKnowLoad && formData.sanctionedLoad) {
          if (Number(formData.sanctionedLoad) < 0) {
            setError('Sanctioned peak load cannot be negative.');
            return false;
          }
        }
        const hours = Number(formData.largeBizHours);
        if (hours <= 0 || hours > 24) {
          setError('Daily operating hours must be between 1 and 24 hours.');
          return false;
        }
      }
      return true;
    }

    if (currentStep === 3) {
      const area = Number(formData.roofArea);
      if (!area || area <= 0) {
        setError('Please specify available rooftop or installation area (in sq.ft).');
        return false;
      }
      if (area < 50) {
        setError('Installation area must be at least 50 sq.ft to accommodate solar PV modules.');
        return false;
      }
      if (area > 5000000) {
        setError('Installation area exceeds maximum platform threshold (5,000,000 sq.ft).');
        return false;
      }
      if (formData.budget && Number(formData.budget) < 0) {
        setError('Budget amount cannot be negative.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setError('');
      // Set sensible default roofArea on step 1 change if not already modified
      if (currentStep === 1 && !formData.roofArea) {
        const matched = userTypeOptions.find((o) => o.id === formData.userType);
        if (matched) {
          setFormData((prev) => ({
            ...prev,
            roofArea: matched.defaultArea,
            monthlyConsumption: prev.monthlyConsumption || matched.defaultUnits,
          }));
        }
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      // Build dynamic category details payload
      let categoryDetails = {};
      if (formData.userType === 'residential') {
        categoryDetails = {
          householdSize: formData.householdSize,
          appliances: formData.appliances,
        };
      } else if (formData.userType === 'farm') {
        categoryDetails = {
          farmAcres: formData.farmAcres,
          pumpCount: formData.pumpCount,
          pumpPower: formData.pumpPower,
          pumpPowerUnit: formData.pumpPowerUnit,
          dailyHours: formData.dailyHours,
          monthlyDays: formData.monthlyDays,
          irrigationType: formData.irrigationType,
          gridConnection: formData.gridConnection,
          solarOption: formData.solarOption,
        };
      } else if (formData.userType === 'small_business') {
        categoryDetails = {
          businessType: formData.businessType,
          dailyHours: formData.smallBizHours,
          monthlyDays: formData.smallBizDays,
          majorEquipment: formData.majorEquipment,
        };
      } else if (formData.userType === 'large_business') {
        categoryDetails = {
          industryType: formData.industryType,
          sanctionedLoad: formData.dontKnowLoad ? 'Unknown / Flexible' : formData.sanctionedLoad,
          dailyHours: formData.largeBizHours,
          monthlyDays: formData.largeBizDays,
          machineryLoad: formData.machineryLoad,
          gridConnection: formData.largeGridConnection,
          installationType: formData.installationPreference,
        };
      }

      // Calculate consumption if not explicitly provided
      let finalConsumption = Number(formData.monthlyConsumption) || 0;
      if (!finalConsumption && formData.userType === 'farm') {
        const pKW = formData.pumpPowerUnit === 'kW' ? Number(formData.pumpPower) : Number(formData.pumpPower) * 0.746;
        finalConsumption = Math.round((Number(formData.pumpCount) || 1) * pKW * Number(formData.dailyHours) * Number(formData.monthlyDays));
        if (formData.solarOption === 'farm_and_home') finalConsumption += 250;
      } else if (!finalConsumption && Number(formData.monthlyBill) > 0) {
        const effectiveTariff = Number(formData.tariff) || (formData.userType === 'small_business' ? 9.5 : (formData.userType === 'farm' ? 4.0 : (formData.userType === 'large_business' ? 11.0 : 7.5)));
        finalConsumption = Math.round(Number(formData.monthlyBill) / effectiveTariff);
      }

      if (!finalConsumption || finalConsumption <= 0) {
        setError('Please provide your monthly electricity consumption (kWh) or monthly electricity bill (INR).');
        setLoading(false);
        return;
      }

      const payload = {
        userType: formData.userType,
        location: formData.location,
        monthlyConsumption: finalConsumption,
        monthlyBill: Number(formData.monthlyBill) || 0,
        tariff: formData.tariff ? Number(formData.tariff) : null,
        roofArea: Number(formData.roofArea),
        roofType: formData.roofType,
        roofOrientation: formData.roofOrientation,
        dayNightUsage: formData.dayNightUsage,
        shadingCondition: formData.shadingCondition,
        gridPreference: formData.gridPreference,
        batteryRequirement: Boolean(formData.batteryRequirement),
        budget: Number(formData.budget) || 0,
        categoryDetails,
      };

      const result = await solarService.runAssessment(payload);
      if (result.success) {
        navigate('/solar-recommendation', { state: { newAssessment: true } });
      }
    } catch (err) {
      setError(err.message || 'Error executing solar assessment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-3">
      {/* 3-Step Progress Indicator */}
      <div className="mb-7">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-5 h-1 bg-light-border w-full z-0"></div>
          <div
            className="absolute top-5 left-0 h-1 bg-brand transition-all duration-300 z-0"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>

          {[
            { step: 1, label: '1. About You' },
            { step: 2, label: '2. Your Electricity' },
            { step: 3, label: '3. Your Property' },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div key={item.step} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] transition-all shadow-subtle ${
                    isCompleted
                      ? 'bg-brand text-white'
                      : isCurrent
                      ? 'bg-white text-brand border-2 border-brand ring-4 ring-brand/15'
                      : 'bg-light-surface text-light-muted border border-light-border'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : item.step}
                </div>
                <span
                  className={`text-[14px] font-semibold mt-2 ${
                    isCurrent ? 'text-brand font-bold' : 'text-light-muted'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="lc-card p-6 sm:p-8 shadow-card">
        {error && (
          <div className="mb-6 p-4 rounded-btn bg-rose-500/10 border border-rose-500/25 text-[15px] text-rose-600 font-medium flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: ABOUT YOU */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-btn bg-brand/10 border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Step 1 of 3 • About You</span>
              </div>
              <h2 className="text-2xl font-bold text-light-text tracking-tight">
                Tell us about yourself and your property
              </h2>
              <p className="text-secondary mt-1">
                Select your property type so we can calculate the right incentives, rates, and solar system sizing for you.
              </p>
            </div>

            {/* 4 Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userTypeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.userType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, userType: opt.id })}
                    className={`cursor-pointer p-5 rounded-card border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand bg-brand/5 shadow-subtle ring-2 ring-brand/30'
                        : 'border-light-border hover:border-brand/40 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-11 h-11 rounded-btn flex items-center justify-center border ${
                            isSelected
                              ? 'bg-brand text-white border-brand'
                              : 'bg-light-surface text-light-muted border-light-border'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="text-xs font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-btn">
                            Selected
                          </span>
                        )}
                      </div>
                      <h3 className="text-[17px] font-bold text-light-text">{opt.title}</h3>
                      <p className="text-xs font-semibold text-brand mt-0.5">{opt.subtitle}</p>
                      <p className="text-helper text-light-muted mt-2 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Basic Property & Location Details */}
            <div className="p-4 rounded-card bg-light-surface border border-light-border space-y-4">
              <h4 className="text-[15px] font-bold text-light-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand" />
                <span>Property & Location Coordinates</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-light-text mb-1">
                    Your Name or Facility ID
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Pune Rooftop Villa"
                    className="lc-input w-full text-sm py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-light-text mb-1">
                    State
                  </label>
                  <select
                    value={formData.location.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, state: e.target.value },
                      })
                    }
                    className="lc-input w-full text-sm py-2"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-light-text mb-1">
                    City / District
                  </label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value },
                      })
                    }
                    placeholder="e.g. Pune, Nashik, Surat"
                    className="lc-input w-full text-sm py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: YOUR ELECTRICITY */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-btn bg-brand/10 border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Step 2 of 3 • Your Electricity</span>
              </div>
              <h2 className="text-2xl font-bold text-light-text tracking-tight">
                {formData.userType === 'residential' && 'How much electricity do you use?'}
                {formData.userType === 'farm' && 'Agricultural Land, Irrigation Pumps & Electricity'}
                {formData.userType === 'small_business' && 'Commercial Business Hours & Power Use'}
                {formData.userType === 'large_business' && 'Industrial Sanctioned Load & Power Profile'}
              </h2>
              <p className="text-secondary mt-1">
                Enter your monthly units or typical bill amount. We use this to calculate the right solar system size.
              </p>
            </div>

            {/* 1. HOME SPECIFIC FIELDS */}
            {formData.userType === 'residential' && (
              <div className="space-y-5">
                {/* Consumption or Bill */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-card bg-light-surface border border-light-border">
                    <label className="block text-sm font-semibold text-light-text mb-1">
                      Monthly electricity use (kWh / Units)
                    </label>
                    <p className="text-helper text-light-muted mb-2">
                      How much electricity do you usually use in one month?
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={formData.monthlyConsumption}
                        onChange={(e) => handleConsumptionChange(e.target.value)}
                        placeholder="e.g. 250"
                        className="lc-input w-full font-semibold text-base pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-light-muted">
                        kWh
                      </span>
                    </div>
                    <p className="text-[12px] text-light-muted mt-1.5">
                      Check your electricity bill for "Units Consumed".
                    </p>
                  </div>

                  <div className="p-4 rounded-card bg-light-surface border border-light-border">
                    <label className="block text-sm font-semibold text-light-text mb-1">
                      Average monthly electricity bill (₹)
                    </label>
                    <p className="text-helper text-light-muted mb-2">
                      What is your typical monthly bill amount?
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={formData.monthlyBill}
                        onChange={(e) => handleBillChange(e.target.value)}
                        placeholder="e.g. 2000"
                        className="lc-input w-full font-semibold text-base pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-light-muted">
                        ₹ (INR)
                      </span>
                    </div>
                    <p className="text-[12px] text-light-muted mt-1.5">
                      Automatically estimates units based on average residential rates.
                    </p>
                  </div>
                </div>

                {/* Household Size */}
                <div>
                  <label className="block text-sm font-semibold text-light-text mb-2">
                    Household Size (Number of family members)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['1–2 people', '3–4 people', '5–6 people', '7+ people'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, householdSize: size })}
                        className={`py-2.5 px-3 rounded-btn border text-xs font-semibold transition-all cursor-pointer ${
                          formData.householdSize === size
                            ? 'bg-brand text-white border-brand shadow-xs'
                            : 'bg-white text-light-text border-light-border hover:bg-light-surface'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Major High-Load Appliances */}
                <div>
                  <label className="block text-sm font-semibold text-light-text mb-1.5">
                    Major High-Load Household Appliances
                  </label>
                  <p className="text-xs text-light-muted mb-3">
                    Select appliances running in your home. This shapes your daytime self-consumption estimate.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Air Conditioner (AC)',
                      'Electric Geyser / Water Heater',
                      'Electric Vehicle (EV) Charger',
                      'Induction Cooktop',
                      'Washing Machine & Dryer',
                      'Refrigerator (Double Door)',
                      'Water Pump / Submersible',
                    ].map((appliance) => {
                      const isChecked = formData.appliances.includes(appliance);
                      return (
                        <button
                          key={appliance}
                          type="button"
                          onClick={() => toggleArrayItem('appliances', appliance)}
                          className={`p-2.5 rounded-btn text-xs font-medium text-left border flex items-center justify-between transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-brand/10 text-brand border-brand font-semibold'
                              : 'bg-white text-light-text border-light-border hover:bg-light-surface'
                          }`}
                        >
                          <span className="truncate mr-1">{appliance}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 shrink-0 text-brand" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day vs Night Usage */}
                <div>
                  <label className="block text-sm font-semibold text-light-text mb-2">
                    When is electricity consumed most at home?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'day_heavy', label: 'Mostly Daytime', desc: 'Work from home, day AC/washing' },
                      { id: 'balanced', label: 'Balanced Day & Night', desc: 'Active morning, afternoon & night' },
                      { id: 'night_heavy', label: 'Mostly Evening/Night', desc: 'Away for work during daytime' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, dayNightUsage: opt.id })}
                        className={`p-3 rounded-btn border text-left transition-all cursor-pointer ${
                          formData.dayNightUsage === opt.id
                            ? 'bg-brand/10 border-brand text-brand font-semibold ring-1 ring-brand'
                            : 'bg-white border-light-border text-light-text hover:bg-light-surface'
                        }`}
                      >
                        <p className="text-xs font-bold">{opt.label}</p>
                        <p className="text-[11px] text-light-muted mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. FARM SPECIFIC FIELDS */}
            {formData.userType === 'farm' && (
              <div className="space-y-5">
                {/* Farm Area in Acres */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-card bg-light-surface border border-light-border">
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-text mb-1">
                      Total Farm Land Area (Acres)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.farmAcres}
                        onChange={(e) => setFormData({ ...formData, farmAcres: e.target.value })}
                        placeholder="e.g. 5"
                        className="lc-input w-full font-semibold text-base pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-light-muted">
                        Acres
                      </span>
                    </div>
                    <p className="text-[11px] text-light-muted mt-1.5">
                      Used to check ground mounting suitability for solar pumps and ground arrays.
                    </p>
                  </div>

                  <div className="p-4 rounded-card bg-light-surface border border-light-border">
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-text mb-1">
                      Solar System Scope
                    </label>
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="solarOption"
                          value="farm_and_home"
                          checked={formData.solarOption === 'farm_and_home'}
                          onChange={() => setFormData({ ...formData, solarOption: 'farm_and_home' })}
                          className="text-brand focus:ring-brand"
                        />
                        <span>Farm Irrigation Pump + Farmhouse Residence</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="solarOption"
                          value="solar_pump_only"
                          checked={formData.solarOption === 'solar_pump_only'}
                          onChange={() => setFormData({ ...formData, solarOption: 'solar_pump_only' })}
                          className="text-brand focus:ring-brand"
                        />
                        <span>Dedicated Solar Agricultural Pump Only</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bill vs Pump Specs Toggle */}
                <div className="p-4 rounded-card border border-light-border bg-white space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-light-border">
                    <div>
                      <h4 className="text-sm font-bold text-light-text">
                        Pump Sizing & Agricultural Load
                      </h4>
                      <p className="text-xs text-light-muted">
                        Specify motor specifications to accurately size your agricultural solar capacity.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasFarmBill: !formData.hasFarmBill })}
                      className="text-xs font-bold text-brand hover:underline"
                    >
                      {formData.hasFarmBill ? 'Switch to Pump Specs' : 'I have an Electricity Bill'}
                    </button>
                  </div>

                  {!formData.hasFarmBill ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-light-text mb-1">
                          No. of Pumps
                        </label>
                        <select
                          value={formData.pumpCount}
                          onChange={(e) => setFormData({ ...formData, pumpCount: e.target.value })}
                          className="lc-input w-full text-xs py-2"
                        >
                          <option value="1">1 Pump</option>
                          <option value="2">2 Pumps</option>
                          <option value="3">3 Pumps</option>
                          <option value="4">4+ Pumps</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-light-text mb-1">
                          Motor Rating
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={formData.pumpPower}
                            onChange={(e) => setFormData({ ...formData, pumpPower: e.target.value })}
                            placeholder="5"
                            className="lc-input w-16 text-xs py-2 text-center font-bold"
                          />
                          <select
                            value={formData.pumpPowerUnit}
                            onChange={(e) => setFormData({ ...formData, pumpPowerUnit: e.target.value })}
                            className="lc-input flex-1 text-xs py-2 font-bold"
                          >
                            <option value="HP">HP</option>
                            <option value="kW">kW</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-light-text mb-1">
                          Hours / Day
                        </label>
                        <select
                          value={formData.dailyHours}
                          onChange={(e) => setFormData({ ...formData, dailyHours: e.target.value })}
                          className="lc-input w-full text-xs py-2"
                        >
                          <option value="4">4 hrs/day</option>
                          <option value="6">6 hrs/day (Avg)</option>
                          <option value="8">8 hrs/day</option>
                          <option value="12">12 hrs/day</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-light-text mb-1">
                          Days / Month
                        </label>
                        <select
                          value={formData.monthlyDays}
                          onChange={(e) => setFormData({ ...formData, monthlyDays: e.target.value })}
                          className="lc-input w-full text-xs py-2"
                        >
                          <option value="15">15 days/mo</option>
                          <option value="20">20 days/mo</option>
                          <option value="25">25 days/mo (Avg)</option>
                          <option value="30">30 days/mo (Continuous)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-light-text mb-1">
                          Monthly Electricity Consumption (kWh)
                        </label>
                        <input
                          type="number"
                          value={formData.monthlyConsumption}
                          onChange={(e) => handleConsumptionChange(e.target.value)}
                          placeholder="e.g. 750"
                          className="lc-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-light-text mb-1">
                          Monthly Farm Electricity Bill (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.monthlyBill}
                          onChange={(e) => handleBillChange(e.target.value)}
                          placeholder="e.g. 3000"
                          className="lc-input w-full text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Irrigation Type & Grid Connection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-light-text mb-1">
                      Irrigation Method
                    </label>
                    <select
                      value={formData.irrigationType}
                      onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                      className="lc-input w-full text-sm py-2"
                    >
                      <option value="Borewell / Tube well">Borewell / Deep Tube Well</option>
                      <option value="Drip Irrigation">Drip Irrigation System</option>
                      <option value="Sprinkler System">Micro Sprinkler System</option>
                      <option value="Flood / Canal Lift">Open Well / Canal Lift Irrigation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-light-text mb-1">
                      Current Grid Power Status
                    </label>
                    <select
                      value={formData.gridConnection}
                      onChange={(e) => setFormData({ ...formData, gridConnection: e.target.value })}
                      className="lc-input w-full text-sm py-2"
                    >
                      <option value="3-Phase Connected">Reliable 3-Phase Agricultural Grid</option>
                      <option value="Single Phase">Single Phase Grid</option>
                      <option value="Weak/Unreliable Rural Grid">Weak / Erratic Rural Grid (frequent trips)</option>
                      <option value="Pure Off-Grid">No Grid Connection (Pure Off-Grid Pump)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SMALL BUSINESS SPECIFIC FIELDS */}
            {formData.userType === 'small_business' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-light-text mb-1">
                      Business Establishment Type
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="lc-input w-full text-sm py-2"
                    >
                      <option value="Retail Store / Showroom">Retail Store / Clothes / Electronics</option>
                      <option value="Cafe / Restaurant / Bakery">Cafe / Restaurant / Bakery</option>
                      <option value="Office / Coworking Space">Corporate Office / Coworking</option>
                      <option value="Clinic / Diagnostic Lab">Medical Clinic / Diagnostic Lab</option>
                      <option value="Workshop / Light Fabrication">Workshop / Light Fabrication</option>
                      <option value="Supermarket / Grocery">Supermarket / Grocery Store</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-light-text mb-1">
                      Operating Schedule
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.smallBizHours}
                        onChange={(e) => setFormData({ ...formData, smallBizHours: e.target.value })}
                        className="lc-input w-1/2 text-xs py-2"
                      >
                        <option value="8">8 hrs/day</option>
                        <option value="10">10 hrs/day (9am–7pm)</option>
                        <option value="12">12 hrs/day</option>
                        <option value="16">16 hrs/day</option>
                        <option value="24">24 hrs (24/7)</option>
                      </select>
                      <select
                        value={formData.smallBizDays}
                        onChange={(e) => setFormData({ ...formData, smallBizDays: e.target.value })}
                        className="lc-input w-1/2 text-xs py-2"
                      >
                        <option value="24">24 days/mo (6 days/wk)</option>
                        <option value="26">26 days/mo</option>
                        <option value="30">30 days/mo (All days)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Consumption or Bill */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-card bg-light-surface border border-light-border">
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-text mb-1">
                      Monthly Commercial Consumption (kWh)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={formData.monthlyConsumption}
                        onChange={(e) => handleConsumptionChange(e.target.value)}
                        placeholder="e.g. 1250"
                        className="lc-input w-full font-semibold text-base pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-light-muted">
                        kWh
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-card bg-light-surface border border-light-border">
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-text mb-1">
                      Monthly Commercial Bill (₹)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={formData.monthlyBill}
                        onChange={(e) => handleBillChange(e.target.value)}
                        placeholder="e.g. 11800"
                        className="lc-input w-full font-semibold text-base pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-light-muted">
                        INR (₹)
                      </span>
                    </div>
                    <p className="text-[11px] text-light-muted mt-1.5">
                      Commercial tariff slab modeled at ~₹9.5/unit.
                    </p>
                  </div>
                </div>

                {/* Major Business Equipment */}
                <div>
                  <label className="block text-sm font-semibold text-light-text mb-1.5">
                    Major Commercial Equipment & Loads
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Commercial Refrigeration',
                      'HVAC / Central AC',
                      'Baking Ovens / Heaters',
                      'Light Machinery / Lathes',
                      'Computers & Servers',
                      'Elevators / Lifts',
                    ].map((eq) => {
                      const isChecked = formData.majorEquipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => toggleArrayItem('majorEquipment', eq)}
                          className={`p-2.5 rounded-btn text-xs font-medium text-left border flex items-center justify-between transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-brand/10 text-brand border-brand font-semibold'
                              : 'bg-white text-light-text border-light-border hover:bg-light-surface'
                          }`}
                        >
                          <span className="truncate mr-1">{eq}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 shrink-0 text-brand" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. LARGE BUSINESS SPECIFIC FIELDS */}
            {formData.userType === 'large_business' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-light-text mb-1">
                      Industry / Facility Category
                    </label>
                    <select
                      value={formData.industryType}
                      onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
                      className="lc-input w-full text-sm py-2"
                    >
                      <option value="Manufacturing & Textiles">Manufacturing & Textiles</option>
                      <option value="Cold Storage & Logistics">Cold Storage & Logistics Warehousing</option>
                      <option value="Heavy Engineering & Metal">Heavy Engineering & Metal Fabrication</option>
                      <option value="IT Tech Park & Corporate">IT Tech Park & Corporate Campus</option>
                      <option value="Food Processing & Chemical">Food Processing & Chemical Facility</option>
                      <option value="Hospital & Medical Campus">Hospital & Medical Campus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-light-text mb-1">
                      Sanctioned Peak Load (kW / kVA)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        disabled={formData.dontKnowLoad}
                        value={formData.sanctionedLoad}
                        onChange={(e) => setFormData({ ...formData, sanctionedLoad: e.target.value })}
                        placeholder="e.g. 150"
                        className="lc-input w-full text-sm py-2 disabled:opacity-50"
                      />
                      <label className="flex items-center gap-1.5 text-[11px] text-light-muted mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.dontKnowLoad}
                          onChange={(e) => setFormData({ ...formData, dontKnowLoad: e.target.checked })}
                          className="rounded text-brand focus:ring-brand"
                        />
                        <span>I don't know / Not sure</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Consumption & Bill */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-card bg-light-surface border border-light-border">
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-text mb-1">
                      Monthly Industrial Consumption (kWh)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={formData.monthlyConsumption}
                        onChange={(e) => handleConsumptionChange(e.target.value)}
                        placeholder="e.g. 18000"
                        className="lc-input w-full font-semibold text-base pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-light-muted">
                        kWh
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-card bg-light-surface border border-light-border">
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-text mb-1">
                      Monthly Industrial Power Bill (₹)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={formData.monthlyBill}
                        onChange={(e) => handleBillChange(e.target.value)}
                        placeholder="e.g. 198000"
                        className="lc-input w-full font-semibold text-base pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-light-muted">
                        INR (₹)
                      </span>
                    </div>
                    <p className="text-[11px] text-light-muted mt-1.5">
                      Modeled at industrial HT slab ~₹11.0/unit.
                    </p>
                  </div>
                </div>

                {/* Industrial Shifts & Grid Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-light-text mb-1">
                      Operating Shifts & Working Days
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.largeBizHours}
                        onChange={(e) => setFormData({ ...formData, largeBizHours: e.target.value })}
                        className="lc-input w-1/2 text-xs py-2"
                      >
                        <option value="8">8 hrs (1 Shift)</option>
                        <option value="16">16 hrs (2 Shifts)</option>
                        <option value="24">24 hrs (Continuous)</option>
                      </select>
                      <select
                        value={formData.largeBizDays}
                        onChange={(e) => setFormData({ ...formData, largeBizDays: e.target.value })}
                        className="lc-input w-1/2 text-xs py-2"
                      >
                        <option value="25">25 days/mo</option>
                        <option value="26">26 days/mo</option>
                        <option value="30">30 days/mo (365 days)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-light-text mb-1">
                      Solar Installation Type
                    </label>
                    <select
                      value={formData.installationPreference}
                      onChange={(e) => setFormData({ ...formData, installationPreference: e.target.value })}
                      className="lc-input w-full text-sm py-2"
                    >
                      <option value="rooftop">Rooftop Solar Only (PEB / Concrete)</option>
                      <option value="ground_mounted">Ground-Mounted Solar (Open Acreage)</option>
                      <option value="hybrid">Hybrid (Both Rooftop + Ground)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: YOUR PROPERTY */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-btn bg-brand/10 border border-brand/20 text-brand text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Step 3 of 3 • Your Property</span>
              </div>
              <h2 className="text-2xl font-bold text-light-text tracking-tight">
                Tell us about your property and roof
              </h2>
              <p className="text-secondary mt-1">
                This helps us ensure the recommended solar panels will fit comfortably on your roof or open ground.
              </p>
            </div>

            {/* Area Input with Category-Specific Context */}
            <div className="p-4 rounded-card bg-light-surface border border-light-border space-y-2">
              <label className="block text-sm font-semibold text-light-text mb-1">
                Roof area (sq.ft)
              </label>
              <p className="text-helper text-light-muted mb-2">
                Approximate usable roof space for solar panels
              </p>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  value={formData.roofArea}
                  onChange={(e) => setFormData({ ...formData, roofArea: e.target.value })}
                  placeholder="e.g. 800"
                  className="lc-input w-full font-semibold text-base pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-light-muted">
                  sq.ft
                </span>
              </div>
              <p className="text-[12px] text-light-muted">
                {formData.userType === 'residential' && '💡 Typical 2-3 BHK terrace: 600–1,200 sq.ft. Independent house: 1,000–2,500 sq.ft.'}
                {formData.userType === 'farm' && '💡 1 kW needs ~85 sq.ft. A 5 HP pump array requires ~500–600 sq.ft ground space.'}
                {formData.userType === 'small_business' && '💡 Typical commercial shed or flat concrete roof: 1,000–4,000 sq.ft.'}
                {formData.userType === 'large_business' && '💡 100 kW industrial PV requires ~10,000 sq.ft of shed or open land.'}
              </p>
            </div>

            {/* Roof / Structure Type & Orientation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-light-text mb-1">
                  Roof / Ground Surface Type
                </label>
                <select
                  value={formData.roofType}
                  onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
                  className="lc-input w-full text-sm py-2"
                >
                  <option value="concrete_flat">Flat Concrete RCC (Standard)</option>
                  <option value="metal_sheet">Pitched / Sloped Metal Sheet (PEB)</option>
                  <option value="clay_tile">Tiled / Mangalore Clay Tile Roof</option>
                  <option value="open_ground">Open Ground-Mounted Field</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-text mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-brand" />
                  <span>Roof / Panel Orientation</span>
                </label>
                <select
                  value={formData.roofOrientation}
                  onChange={(e) => setFormData({ ...formData, roofOrientation: e.target.value })}
                  className="lc-input w-full text-sm py-2"
                >
                  <option value="south">South-Facing (Maximum year-round yield)</option>
                  <option value="east_west">East–West Facing (Balanced morning/evening)</option>
                  <option value="north">North-Facing (Lower winter yield)</option>
                  <option value="unknown">I don't know / Not sure (Assume standard tilt)</option>
                </select>
              </div>
            </div>

            {/* Shading & Grid Connection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-light-text mb-1">
                  Rooftop Shading Condition
                </label>
                <select
                  value={formData.shadingCondition}
                  onChange={(e) => setFormData({ ...formData, shadingCondition: e.target.value })}
                  className="lc-input w-full text-sm py-2"
                >
                  <option value="none">None (Full direct sunshine all day)</option>
                  <option value="partial">Partial (Minor shade from trees or parapet)</option>
                  <option value="significant">Significant (Tall nearby trees / buildings)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-text mb-1">
                  Grid Interconnection Preference
                </label>
                <select
                  value={formData.gridPreference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gridPreference: e.target.value,
                      batteryRequirement: e.target.value !== 'on_grid',
                    })
                  }
                  className="lc-input w-full text-sm py-2"
                >
                  <option value="on_grid">Grid-Tied (Net Metering, No battery - Lowest Cost)</option>
                  <option value="hybrid">Hybrid (Net Metered + Battery Storage Backup)</option>
                  <option value="off_grid">Off-Grid (Standalone Battery Storage System)</option>
                </select>
              </div>
            </div>

            {/* Summary Review Callout */}
            <div className="p-4 rounded-card bg-brand/5 border border-brand/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <div className="text-xs text-light-text leading-relaxed">
                <p className="font-bold text-sm text-brand mb-1">
                  Ready to compute your customized solar engineering profile:
                </p>
                <p className="text-light-muted">
                  • <strong>Category:</strong> {formData.userType.toUpperCase().replace('_', ' ')} • <strong>Target:</strong> ~{formData.monthlyConsumption || (formData.monthlyBill ? Math.round(Number(formData.monthlyBill) / 7.5) : '—')} kWh/mo
                  • <strong>Area:</strong> {formData.roofArea} sq.ft ({formData.roofType}) • <strong>Location:</strong> {formData.location.city}, {formData.location.state}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-5 border-t border-light-border flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="lc-btn-secondary text-sm py-2.5 px-4 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="lc-btn-brand text-sm py-2.5 px-5 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="lc-btn-brand text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Calculating your solar recommendation...' : 'Get My Solar Recommendation'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizardPage;
