// Engineering Constants and Baseline Defaults for Solar Calculations
module.exports = {
  // Peak Sun Hours (Daily average solar irradiance hours)
  DEFAULT_PEAK_SUN_HOURS: 4.8,
  
  // Performance Ratio (Overall system efficiency accounting for inverter loss, wiring, temperature, dust)
  DEFAULT_PERFORMANCE_RATIO: 0.78,
  
  // Solar PV Module rating (Watts per panel)
  DEFAULT_PANEL_WATTAGE: 540, // 540W Mono PERC standard
  
  // Rooftop area needed per kW (approx 80-100 sq.ft per kW including maintenance walkways)
  AREA_PER_KW_SQFT: 90,
  
  // Base Equipment & Installation Costs (INR per kW)
  COST_PER_KW: {
    residential: 60000,     // ₹60,000 / kW
    farm: 52000,            // ₹52,000 / kW (larger ground mount / pump setup)
    small_business: 55000,  // ₹55,000 / kW
    large_business: 48000,  // ₹48,000 / kW (commercial scale economies)
  },
  
  // Average Electricity Tariffs (INR per kWh)
  DEFAULT_TARIFF: {
    residential: 7.5,
    farm: 4.0,              // Subsidized agricultural tariff
    small_business: 9.5,    // Commercial slab
    large_business: 11.0,   // Commercial / Industrial HT slab
  },
  
  // Standard PM Surya Ghar: Muft Bijli Yojana Residential Subsidy Scheme (India 2024-2026 guidelines)
  // Up to 2 kW: ₹30,000 per kW (max ₹60,000)
  // 2 to 3 kW: Additional ₹18,000 for 3rd kW (max total ₹78,000)
  // > 3 kW: Capped at ₹78,000 for residential rooftop
  RESIDENTIAL_SUBSIDY: {
    maxSubsidy: 78000,
    tier1Rate: 30000, // per kW up to 2 kW
    tier2Rate: 18000, // for the 3rd kW
  },
  
  // Environmental Impact Factors
  // CEA (Central Electricity Authority) Average Grid Emission Factor for India ~0.82 kg CO2 / kWh
  GRID_EMISSION_FACTOR_KG_PER_KWH: 0.82,
  // 1 Mature tree absorbs approx ~22 kg CO2 per year
  TREE_ABSORPTION_KG_PER_YEAR: 22,
  
  // System Lifespan for ROI calculation
  SYSTEM_LIFESPAN_YEARS: 25,
  
  // Annual panel degradation rate (~0.7% per year)
  ANNUAL_DEGRADATION_RATE: 0.007,
};
