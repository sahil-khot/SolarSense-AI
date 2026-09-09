/**
 * Location-Aware Indian Solar Resources
 * Benchmarked against MNRE (Ministry of New and Renewable Energy),
 * NISE (National Institute of Solar Energy), and Global Solar Atlas solar radiation data.
 */

const STATE_SOLAR_RESOURCES = {
  rajasthan: {
    stateName: 'Rajasthan',
    annualAveragePSH: 5.8,
    monthlyPSH: [5.2, 5.7, 6.2, 6.5, 6.4, 5.8, 4.8, 4.7, 5.6, 5.8, 5.5, 5.0],
    tiltOptimalDeg: 26,
    dniKWhPerM2: 5.8,
    cities: {
      jaipur: 5.7,
      jodhpur: 6.0,
      udaipur: 5.8,
      bikaner: 6.1,
    },
    source: 'MNRE / NISE Solar Radiation Atlas of India',
    lastVerified: '2026-01-15',
  },
  gujarat: {
    stateName: 'Gujarat',
    annualAveragePSH: 5.5,
    monthlyPSH: [5.2, 5.6, 6.0, 6.3, 6.1, 4.9, 3.8, 3.7, 4.8, 5.6, 5.4, 5.1],
    tiltOptimalDeg: 23,
    dniKWhPerM2: 5.5,
    cities: {
      ahmedabad: 5.6,
      surat: 5.4,
      vadodara: 5.5,
      rajkot: 5.7,
    },
    source: 'Gujarat Energy Development Agency (GEDA)',
    lastVerified: '2026-01-15',
  },
  maharashtra: {
    stateName: 'Maharashtra',
    annualAveragePSH: 5.2,
    monthlyPSH: [5.0, 5.4, 5.7, 5.8, 5.6, 4.0, 3.3, 3.4, 4.5, 5.2, 5.1, 4.9],
    tiltOptimalDeg: 19,
    dniKWhPerM2: 5.2,
    cities: {
      pune: 5.3,
      mumbai: 4.8,
      nagpur: 5.4,
      nashik: 5.3,
      aurangabad: 5.4,
    },
    source: 'Maharashtra Energy Development Agency (MEDA)',
    lastVerified: '2026-01-15',
  },
  karnataka: {
    stateName: 'Karnataka',
    annualAveragePSH: 5.3,
    monthlyPSH: [5.3, 5.8, 6.0, 5.9, 5.4, 3.8, 3.3, 3.5, 4.6, 5.0, 5.0, 5.0],
    tiltOptimalDeg: 15,
    dniKWhPerM2: 5.3,
    cities: {
      bengaluru: 5.2,
      mysuru: 5.3,
      hubballi: 5.5,
      mangaluru: 4.9,
    },
    source: 'Karnataka Renewable Energy Development Ltd (KREDL)',
    lastVerified: '2026-01-15',
  },
  tamilnadu: {
    stateName: 'Tamil Nadu',
    annualAveragePSH: 5.3,
    monthlyPSH: [5.3, 5.8, 6.2, 6.0, 5.5, 4.6, 4.4, 4.7, 5.2, 4.8, 4.2, 4.8],
    tiltOptimalDeg: 13,
    dniKWhPerM2: 5.3,
    cities: {
      chennai: 5.2,
      coimbatore: 5.4,
      madurai: 5.5,
      tiruchirappalli: 5.5,
    },
    source: 'Tamil Nadu Energy Development Agency (TEDA)',
    lastVerified: '2026-01-15',
  },
  delhi: {
    stateName: 'Delhi NCR',
    annualAveragePSH: 4.9,
    monthlyPSH: [3.8, 4.7, 5.6, 6.2, 6.2, 5.5, 4.4, 4.3, 5.0, 5.2, 4.4, 3.7],
    tiltOptimalDeg: 28,
    dniKWhPerM2: 4.9,
    cities: {
      delhi: 4.9,
      noida: 4.9,
      gurugram: 5.0,
      faridabad: 4.9,
    },
    source: 'Delhi Solar Energy Policy / MNRE Resource Map',
    lastVerified: '2026-01-15',
  },
  uttarpradesh: {
    stateName: 'Uttar Pradesh',
    annualAveragePSH: 4.9,
    monthlyPSH: [4.0, 4.8, 5.7, 6.3, 6.2, 5.4, 4.3, 4.2, 4.8, 5.2, 4.6, 3.9],
    tiltOptimalDeg: 26,
    dniKWhPerM2: 4.9,
    cities: {
      lucknow: 4.9,
      kanpur: 5.0,
      varanasi: 5.1,
      agra: 5.1,
    },
    source: 'UP New and Renewable Energy Development Agency (UPNEDA)',
    lastVerified: '2026-01-15',
  },
  madhyapradesh: {
    stateName: 'Madhya Pradesh',
    annualAveragePSH: 5.4,
    monthlyPSH: [4.9, 5.5, 6.1, 6.4, 6.3, 4.8, 3.6, 3.6, 4.8, 5.5, 5.3, 4.8],
    tiltOptimalDeg: 23,
    dniKWhPerM2: 5.4,
    cities: {
      indore: 5.4,
      bhopal: 5.3,
      gwalior: 5.3,
      jabalpur: 5.2,
    },
    source: 'MP Urja Vikas Nigam Limited (MPUVNL)',
    lastVerified: '2026-01-15',
  },
  westbengal: {
    stateName: 'West Bengal',
    annualAveragePSH: 4.7,
    monthlyPSH: [4.5, 5.1, 5.6, 5.8, 5.3, 4.0, 3.4, 3.6, 4.1, 4.6, 4.7, 4.4],
    tiltOptimalDeg: 22,
    dniKWhPerM2: 4.7,
    cities: {
      kolkata: 4.6,
      howrah: 4.6,
      siliguri: 4.4,
      durgapur: 4.8,
    },
    source: 'West Bengal Renewable Energy Development Agency (WBREDA)',
    lastVerified: '2026-01-15',
  },
  punjab: {
    stateName: 'Punjab',
    annualAveragePSH: 5.0,
    monthlyPSH: [3.9, 4.8, 5.7, 6.3, 6.4, 5.8, 4.6, 4.5, 5.2, 5.4, 4.6, 3.8],
    tiltOptimalDeg: 30,
    dniKWhPerM2: 5.0,
    cities: {
      ludhiana: 5.0,
      amritsar: 4.9,
      jalandhar: 5.0,
    },
    source: 'Punjab Energy Development Agency (PEDA)',
    lastVerified: '2026-01-15',
  },
  kerala: {
    stateName: 'Kerala',
    annualAveragePSH: 4.8,
    monthlyPSH: [5.4, 5.8, 6.0, 5.6, 4.7, 3.3, 3.1, 3.5, 4.3, 4.5, 4.6, 5.1],
    tiltOptimalDeg: 10,
    dniKWhPerM2: 4.8,
    cities: {
      thiruvananthapuram: 4.9,
      kochi: 4.8,
      kozhikode: 4.7,
    },
    source: 'Agency for New and Renewable Energy Research and Technology (ANERT)',
    lastVerified: '2026-01-15',
  },
};

/**
 * Resolves location-specific solar irradiance and peak sun hours (PSH).
 */
function resolvePeakSunHours(location = {}) {
  const stateKey = (location.state || '').toLowerCase().replace(/\s+/g, '');
  const cityKey = (location.city || '').toLowerCase().replace(/\s+/g, '');

  const stateData = STATE_SOLAR_RESOURCES[stateKey];

  if (stateData) {
    if (cityKey && stateData.cities[cityKey]) {
      const pshVal = stateData.cities[cityKey];
      return {
        psh: pshVal,
        dailyPeakSunHours: pshVal,
        locationName: `${location.city}, ${stateData.stateName}`,
        monthlyPSH: stateData.monthlyPSH,
        source: `${stateData.source} (${pshVal} kWh/m²/day for ${location.city})`,
        lastVerified: stateData.lastVerified,
        isSpecific: true,
      };
    }
    return {
      psh: stateData.annualAveragePSH,
      dailyPeakSunHours: stateData.annualAveragePSH,
      locationName: stateData.stateName,
      monthlyPSH: stateData.monthlyPSH,
      source: `${stateData.source} (State Avg: ${stateData.annualAveragePSH} kWh/m²/day)`,
      lastVerified: stateData.lastVerified,
      isSpecific: true,
    };
  }

  // India National Default
  return {
    psh: 5.0,
    dailyPeakSunHours: 5.0,
    locationName: 'India (National Benchmark)',
    monthlyPSH: [4.9, 5.3, 5.6, 5.7, 5.5, 4.2, 3.5, 3.6, 4.6, 5.1, 5.0, 4.7],
    source: 'MNRE National Benchmark Average (5.0 kWh/m²/day)',
    lastVerified: '2026-01-15',
    isSpecific: false,
  };
}

module.exports = {
  STATE_SOLAR_RESOURCES,
  resolvePeakSunHours,
};
