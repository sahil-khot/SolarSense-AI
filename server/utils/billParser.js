const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');
let Tesseract;
try {
  Tesseract = require('tesseract.js');
} catch (e) {
  console.warn('[Bill Parser] tesseract.js not loaded yet:', e.message);
}

/**
 * Extracts and verifies Indian electricity bill data using:
 * 1. PDF text parser / Tesseract OCR
 * 2. Gemini 3.8 Flash Multimodal structured extraction
 * 3. Mathematical relationship cross-validation
 * NEVER invents fake fallback values (e.g. 350 kWh or units * 7.5).
 */
async function extractBillData(filePath, fileMimeType) {
  const result = {
    unitsConsumed: null,
    totalAmount: null,
    tariff: null,
    consumerCategory: 'Residential',
    billingMonth: '',
    billingYear: new Date().getFullYear(),
    billingPeriodDays: 30,
    fixedCharges: 0,
    energyCharges: 0,
    taxes: 0,
    subsidiesApplied: 0,
    discom: '',
    consumerNumber: '',
    consumerName: '',
    sanctionedLoadKW: null,
    meterNumber: '',
    previousReading: null,
    currentReading: null,
    rawText: '',
    ocrText: '',
    extractionMethod: 'manual',
    fieldConfidence: {
      unitsConsumed: 0,
      totalAmount: 0,
      billingMonth: 0,
      tariff: 0,
      overall: 0,
    },
    fieldProvenance: {
      unitsConsumed: { value: null, source: 'unextracted', confidence: 0, status: 'unavailable' },
      totalAmount: { value: null, source: 'unextracted', confidence: 0, status: 'unavailable' },
      billingMonth: { value: '', source: 'unextracted', confidence: 0, status: 'unavailable' },
      tariff: { value: null, source: 'unextracted', confidence: 0, status: 'unavailable' },
      discom: { value: '', source: 'unextracted', confidence: 0, status: 'unavailable' },
      consumerNumber: { value: '', source: 'unextracted', confidence: 0, status: 'unavailable' },
      consumerName: { value: '', source: 'unextracted', confidence: 0, status: 'unavailable' },
      meterNumber: { value: '', source: 'unextracted', confidence: 0, status: 'unavailable' },
    },
    verificationStatus: 'needs_verification',
    validationErrors: [],
    rawExtractedData: null,
    normalizedData: null,
  };

  try {
    let extractedText = '';

    // Step 1: For PDFs, quickly extract text with pdfParse (<50ms)
    if (fileMimeType === 'application/pdf') {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text || '';
        result.rawText = extractedText;
        result.extractionMethod = 'pdf_text';
      } catch (pdfErr) {
        console.warn('[Bill Parser] PDF text parse error:', pdfErr.message);
      }
    }

    // Step 2: High-speed Multimodal Vision & Intelligence via Google Gemini (runs FIRST)
    // Gemini reads images and PDFs directly with bilingual OCR and returns structured JSON in 1-2s.
    let geminiData = null;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
      try {
        console.log('[Bill Parser] Extracting bill metrics with Gemini Multimodal AI...');
        geminiData = await extractWithGeminiMultimodal(filePath, fileMimeType, extractedText);
        if (geminiData && (geminiData.unitsConsumed?.value || geminiData.totalAmount?.value)) {
          result.extractionMethod = 'gemini_multimodal';
          console.log('[Bill Parser] Gemini Multimodal extraction succeeded.');
        }
      } catch (geminiErr) {
        console.warn('[Bill Parser] Gemini extraction notice:', geminiErr.message);
      }
    }

    // Step 3: Apply Gemini structured data if available
    if (geminiData && (geminiData.unitsConsumed?.value || geminiData.totalAmount?.value)) {
      applyGeminiData(result, geminiData);
    } else {
      // Step 4: If Gemini did not yield complete data, fallback to text regex heuristics
      if (extractedText) {
        applyRegexHeuristics(result, extractedText);
      }

      // Step 5: Optional image OCR fallback via Tesseract (strictly capped with a 6-second timeout so it never hangs)
      if (fileMimeType.startsWith('image/') && Tesseract && (!result.unitsConsumed || !result.totalAmount)) {
        try {
          console.log('[Bill Parser] Running quick fallback OCR on image bill (max 6s)...');
          const ocrPromise = Tesseract.recognize(filePath, 'eng', { logger: () => {} });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('OCR recognition timed out after 6 seconds')), 6000)
          );
          const ocrResult = await Promise.race([ocrPromise, timeoutPromise]);
          extractedText = ocrResult.data.text || '';
          result.ocrText = extractedText;
          if (!result.rawText) result.rawText = extractedText;
          result.extractionMethod = 'ocr_fallback';
          applyRegexHeuristics(result, extractedText);
        } catch (ocrErr) {
          console.warn('[Bill Parser] Quick OCR skipped/timed out:', ocrErr.message);
        }
      }
    }

    // Step 6: Mathematical Cross-Validation
    validateBillRelationships(result);

    // Step 7: Determine Final Verification Status
    const hasUnits = typeof result.unitsConsumed === 'number' && result.unitsConsumed > 0;
    const hasAmount = typeof result.totalAmount === 'number' && result.totalAmount > 0;
    const highConfidence = (result.fieldConfidence.unitsConsumed >= 0.8) && (result.fieldConfidence.totalAmount >= 0.8);
    const hasNoCriticalErrors = result.validationErrors.length === 0;

    if (hasUnits && hasAmount && highConfidence && hasNoCriticalErrors) {
      result.verificationStatus = 'verified';
    } else {
      result.verificationStatus = 'needs_verification';
    }

    // Prepare normalized summary
    result.normalizedData = {
      discom: result.discom,
      consumerNumber: result.consumerNumber,
      consumerName: result.consumerName,
      billingMonth: result.billingMonth,
      billingYear: result.billingYear,
      unitsConsumed: result.unitsConsumed,
      totalAmount: result.totalAmount,
      tariff: result.tariff,
      consumerCategory: result.consumerCategory,
      sanctionedLoadKW: result.sanctionedLoadKW,
      fixedCharges: result.fixedCharges,
      energyCharges: result.energyCharges,
      taxes: result.taxes,
    };
    result.rawExtractedData = {
      heuristicMatches: {
        unitsConsumed: result.unitsConsumed,
        totalAmount: result.totalAmount,
      },
      geminiData,
    };

  } catch (err) {
    console.error('[Bill Parser] Fatal parsing error:', err.message);
    result.validationErrors.push(`Parser exception: ${err.message}`);
    result.verificationStatus = 'needs_verification';
  }

  return result;
}

/**
 * Calls Gemini Multimodal Vision with candidate models and resilient timeout.
 */
async function extractWithGeminiMultimodal(filePath, mimeType, priorText) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ].filter(Boolean);

  // Ensure unique model candidate list
  const uniqueModels = [...new Set(candidateModels)];

  const fileBytes = fs.readFileSync(filePath);
  const base64Data = fileBytes.toString('base64');

  const prompt = `You are a certified Indian electricity bill intelligence specialist for power utilities (such as MSEDCL/महावितरण, Tata Power, Adani Electricity, BESCOM, Torrent, UPPCL, etc.).
Analyze this electricity bill document with extreme precision. The bill may contain bilingual text in English, Marathi, Hindi, or Gujarati.
Return a STRICT JSON object without any Markdown formatting or code fences.
Do NOT invent any values. If a field is not clearly visible, set value to null and confidence to 0.0.

JSON Structure:
{
  "discom": { "value": "string or null", "confidence": 0.0 to 1.0 },
  "consumerNumber": { "value": "string or null", "confidence": 0.0 to 1.0 },
  "consumerName": { "value": "string or null", "confidence": 0.0 to 1.0 },
  "billingMonth": { "value": "string e.g. July 2026 or null", "confidence": 0.0 to 1.0 },
  "unitsConsumed": { "value": number or null, "confidence": 0.0 to 1.0, "source": "formula or text" },
  "previousReading": { "value": number or null, "confidence": 0.0 to 1.0 },
  "currentReading": { "value": number or null, "confidence": 0.0 to 1.0 },
  "sanctionedLoadKW": { "value": number or null, "confidence": 0.0 to 1.0 },
  "consumerCategory": { "value": "Residential" | "Commercial" | "Industrial" | "Agricultural" | null, "confidence": 0.0 to 1.0 },
  "fixedCharges": { "value": number or null, "confidence": 0.0 to 1.0 },
  "energyCharges": { "value": number or null, "confidence": 0.0 to 1.0 },
  "taxes": { "value": number or null, "confidence": 0.0 to 1.0 },
  "subsidiesApplied": { "value": number or null, "confidence": 0.0 to 1.0 },
  "totalAmount": { "value": number or null, "confidence": 0.0 to 1.0 },
  "meterNumber": { "value": "string or null", "confidence": 0.0 to 1.0 }
}`;

  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini call to ${modelName} timed out after 18 seconds`)), 18000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response.text ? response.text.trim() : '';
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(cleanJson);
      if (parsed) return parsed;
    } catch (err) {
      lastError = err;
      console.warn(`[Bill Parser] Model ${modelName} error (${err.message}). Trying fallback model...`);
    }
  }

  throw lastError || new Error('All Gemini multimodal models failed');
}

function applyGeminiData(result, g) {
  if (g.unitsConsumed && typeof g.unitsConsumed.value === 'number') {
    result.unitsConsumed = g.unitsConsumed.value;
    result.fieldConfidence.unitsConsumed = g.unitsConsumed.confidence || 0.9;
    result.fieldProvenance.unitsConsumed = {
      value: g.unitsConsumed.value,
      source: 'gemini_multimodal',
      confidence: g.unitsConsumed.confidence || 0.9,
      status: 'extracted',
    };
  }
  if (g.totalAmount && typeof g.totalAmount.value === 'number') {
    result.totalAmount = g.totalAmount.value;
    result.fieldConfidence.totalAmount = g.totalAmount.confidence || 0.9;
    result.fieldProvenance.totalAmount = {
      value: g.totalAmount.value,
      source: 'gemini_multimodal',
      confidence: g.totalAmount.confidence || 0.9,
      status: 'extracted',
    };
  }
  if (g.billingMonth && g.billingMonth.value) {
    result.billingMonth = g.billingMonth.value;
    result.fieldConfidence.billingMonth = g.billingMonth.confidence || 0.85;
    result.fieldProvenance.billingMonth = {
      value: g.billingMonth.value,
      source: 'gemini_multimodal',
      confidence: g.billingMonth.confidence || 0.85,
      status: 'extracted',
    };
  }
  if (g.discom && g.discom.value) {
    result.discom = g.discom.value;
    result.fieldProvenance.discom = { value: g.discom.value, source: 'gemini_multimodal', confidence: 0.9, status: 'extracted' };
  }
  if (g.consumerNumber && g.consumerNumber.value) {
    result.consumerNumber = g.consumerNumber.value;
    result.fieldProvenance.consumerNumber = { value: g.consumerNumber.value, source: 'gemini_multimodal', confidence: 0.9, status: 'extracted' };
  }
  if (g.consumerName && g.consumerName.value) {
    result.consumerName = g.consumerName.value;
    result.fieldProvenance.consumerName = { value: g.consumerName.value, source: 'gemini_multimodal', confidence: 0.9, status: 'extracted' };
  }
  if (g.consumerCategory && g.consumerCategory.value) result.consumerCategory = g.consumerCategory.value;
  if (g.sanctionedLoadKW && typeof g.sanctionedLoadKW.value === 'number') result.sanctionedLoadKW = g.sanctionedLoadKW.value;
  if (g.previousReading && typeof g.previousReading.value === 'number') result.previousReading = g.previousReading.value;
  if (g.currentReading && typeof g.currentReading.value === 'number') result.currentReading = g.currentReading.value;
  if (g.fixedCharges && typeof g.fixedCharges.value === 'number') result.fixedCharges = g.fixedCharges.value;
  if (g.energyCharges && typeof g.energyCharges.value === 'number') result.energyCharges = g.energyCharges.value;
  if (g.taxes && typeof g.taxes.value === 'number') result.taxes = g.taxes.value;
  if (g.subsidiesApplied && typeof g.subsidiesApplied.value === 'number') result.subsidiesApplied = g.subsidiesApplied.value;
  if (g.meterNumber && g.meterNumber.value) {
    result.meterNumber = g.meterNumber.value;
    result.fieldProvenance.meterNumber = { value: g.meterNumber.value, source: 'gemini_multimodal', confidence: 0.9, status: 'extracted' };
  }

  if (result.unitsConsumed > 0 && result.totalAmount > 0) {
    if (result.energyCharges > 0) {
      result.tariff = Math.round((result.energyCharges / result.unitsConsumed) * 100) / 100;
      result.fieldConfidence.tariff = 0.92;
      result.fieldProvenance.tariff = {
        value: result.tariff,
        source: 'calculated',
        confidence: 0.92,
        status: 'calculated',
        notes: 'Derived from base energy charges ÷ units',
      };
    } else {
      result.tariff = Math.round((result.totalAmount / result.unitsConsumed) * 100) / 100;
      result.fieldConfidence.tariff = 0.85;
      result.fieldProvenance.tariff = {
        value: result.tariff,
        source: 'calculated',
        confidence: 0.85,
        status: 'estimated',
        notes: 'Effective rate including fixed charges, duties & taxes',
      };
    }
  }
}

function applyRegexHeuristics(result, text) {
  // Units consumed patterns (English and Marathi/Hindi utility terms)
  const unitsPatterns = [
    /(?:Units\s*Consumed|Total\s*Units|Billed\s*Units|Consumption|kWh|Units|वापरलेले\s*युनिट|एकूण\s*युनिट|चालू\s*युनिट|युनिट)[\s:\-–]*([0-9]+(?:\.[0-9]+)?)/i,
    /([0-9]+(?:\.[0-9]+)?)\s*(?:kWh|Units|Unit|युनिट)\b/i,
  ];
  for (const pattern of unitsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (val >= 10 && val <= 100000) {
        result.unitsConsumed = val;
        result.fieldConfidence.unitsConsumed = 0.85;
        break;
      }
    }
  }

  // Total bill patterns (English & Marathi/Hindi utility terms)
  const amountPatterns = [
    /(?:Net\s*Amount\s*Payable|Total\s*Amount|Amount\s*Payable|Current\s*Bill|Total\s*Bill|Bill\s*Amount|देय\s*रक्कम|रक्कम\s*रु\.?|बिल\s*रक्कम)[\s:\-–₹Rs.]*([0-9,]+(?:\.[0-9]{2})?)/i,
    /₹\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /Rs\.?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /(?:Amount|रक्कम)\s*[:=]\s*([0-9,]+(?:\.[0-9]{2})?)/i,
  ];
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (val >= 50 && val <= 5000000) {
        result.totalAmount = val;
        result.fieldConfidence.totalAmount = 0.85;
        break;
      }
    }
  }

  // DISCOM detection
  if (/महावितरण|MSEDCL|mahadiscom/i.test(text)) {
    result.discom = 'MSEDCL (Maharashtra State Electricity Distribution Co)';
  } else if (/tata\s*power/i.test(text)) {
    result.discom = 'Tata Power';
  } else if (/adani\s*electricity/i.test(text)) {
    result.discom = 'Adani Electricity';
  } else if (/bescom/i.test(text)) {
    result.discom = 'BESCOM (Bangalore Electricity Supply Co)';
  } else if (/bses/i.test(text)) {
    result.discom = 'BSES Delhi';
  } else if (/uppcl/i.test(text)) {
    result.discom = 'UPPCL (Uttar Pradesh Power Corporation)';
  } else if (/torrent\s*power/i.test(text)) {
    result.discom = 'Torrent Power';
  }

  // Consumer Number
  const consumerMatch = text.match(/(?:Consumer\s*No|Account\s*No|Consumer\s*Number|CA\s*No|K\s*No|ग्राहक\s*क्र(?:मांक)?)[\s:\-–]*([0-9A-Z]{6,16})/i);
  if (consumerMatch && consumerMatch[1]) {
    result.consumerNumber = consumerMatch[1];
  }

  // Billing Month
  const monthMatch = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)[\s,]+([2][0][2-9][0-9])\b/i);
  if (monthMatch) {
    result.billingMonth = `${monthMatch[1]} ${monthMatch[2]}`;
    result.billingYear = parseInt(monthMatch[2], 10);
    result.fieldConfidence.billingMonth = 0.9;
  }

  // Consumer Category
  if (/commercial|LT-II|commercial\s*tariff|व्यावसायिक/i.test(text)) {
    result.consumerCategory = 'Commercial';
  } else if (/agriculture|agri|farm|irrigation|कृषी|शेती/i.test(text)) {
    result.consumerCategory = 'Agricultural';
  } else if (/industrial|HT|औद्योगिक/i.test(text)) {
    result.consumerCategory = 'Industrial';
  } else {
    result.consumerCategory = 'Residential';
  }

  if (result.unitsConsumed && result.totalAmount) {
    result.tariff = Math.round((result.totalAmount / result.unitsConsumed) * 100) / 100;
    result.fieldConfidence.tariff = 0.85;
  }
}

function validateBillRelationships(result) {
  // Check reading difference vs units consumed
  if (typeof result.previousReading === 'number' && typeof result.currentReading === 'number') {
    const diff = result.currentReading - result.previousReading;
    if (diff > 0 && result.unitsConsumed) {
      const tolerance = Math.abs(diff - result.unitsConsumed);
      if (tolerance > (result.unitsConsumed * 0.1) + 2) {
        result.validationErrors.push(
          `Reading difference (${diff} kWh) does not match billed units (${result.unitsConsumed} kWh).`
        );
      }
    }
  }

  // Check component charges sum vs total bill amount
  if (result.energyCharges > 0 && result.fixedCharges >= 0 && result.totalAmount > 0) {
    const calculatedSum = result.energyCharges + result.fixedCharges + (result.taxes || 0) - (result.subsidiesApplied || 0);
    const variance = Math.abs(calculatedSum - result.totalAmount);
    if (variance > (result.totalAmount * 0.15) + 50) {
      result.validationErrors.push(
        `Sum of energy charges + fixed charges + taxes (₹${Math.round(calculatedSum)}) differs significantly from total bill (₹${result.totalAmount}).`
      );
    }
  }

  // Plausibility checks
  if (result.unitsConsumed === null) {
    result.validationErrors.push('Electricity consumption (kWh) could not be detected with high confidence.');
  } else if (result.unitsConsumed <= 0) {
    result.validationErrors.push('Units consumed must be greater than 0 kWh.');
  }

  if (result.totalAmount === null) {
    result.validationErrors.push('Total bill amount (₹) could not be detected with high confidence.');
  } else if (result.totalAmount < 0) {
    result.validationErrors.push('Total bill amount cannot be negative.');
  }

  // Compute overall field confidence
  const confScores = [
    result.fieldConfidence.unitsConsumed,
    result.fieldConfidence.totalAmount,
    result.fieldConfidence.billingMonth,
  ];
  result.fieldConfidence.overall = Math.round((confScores.reduce((a, b) => a + b, 0) / confScores.length) * 100) / 100;
}

module.exports = { extractBillData };
