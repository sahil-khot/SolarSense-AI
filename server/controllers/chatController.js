const { GoogleGenAI } = require('@google/genai');
const Chat = require('../models/Chat');
const SolarAssessment = require('../models/SolarAssessment');
const Bill = require('../models/Bill');
const Recommendation = require('../models/Recommendation');

// In-memory sliding-window rate limiter (20 requests per minute per user)
const userRequestTimestamps = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const checkRateLimit = (userId) => {
  const now = Date.now();
  const timestamps = userRequestTimestamps.get(userId.toString()) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  validTimestamps.push(now);
  userRequestTimestamps.set(userId.toString(), validTimestamps);
  return true;
};

/**
 * Helper to get active Gemini API key from environment
 */
const getActiveKey = () => {
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim() && !envKey.includes('your_gemini_api_key')) {
    return envKey.trim();
  }
  return null;
};

/**
 * GET /api/chat/status
 * Check if Gemini is operational
 */
exports.getChatStatus = async (req, res) => {
  const key = getActiveKey();
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  return res.json({
    success: true,
    isAvailable: !!key,
    model: modelName,
    provider: 'Google Gemini',
  });
};

/**
 * POST /api/chat
 * Send a message to SolarSense AI (strictly uses Google Gemini 3.8 Flash)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit reached: Maximum 20 chat queries per minute. Please pause for a moment.',
      });
    }

    const apiKey = getActiveKey();
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        isUnavailable: true,
        message: 'SolarSense AI is temporarily unavailable. Please try again later.',
      });
    }

    // 1. Fetch user's latest solar assessment, recommendation, energy profile, and bills
    const EnergyProfile = require('../models/EnergyProfile');
    const [assessment, recommendation, recentBills, energyProfile] = await Promise.all([
      SolarAssessment.findOne({ userId }).sort({ createdAt: -1 }),
      Recommendation.findOne({ userId }).sort({ createdAt: -1 }),
      Bill.find({ userId }).sort({ createdAt: -1 }).limit(6),
      EnergyProfile.findOne({ userId }),
    ]);

    const latestBill = recentBills.length > 0 ? recentBills[0] : null;

    // 2. Fetch or initialize chat document
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      chat = new Chat({
        user: userId,
        title: 'SolarSense Advisory Conversation',
        messages: [],
      });
    }

    // 3. Build rich, structured grounding context
    let structuredContext = `User Profile:
- Name: ${req.user.name || 'Solar Consumer'}
- Category: ${req.user.userType || 'residential'}
- Location: ${req.user.location?.city || 'India'}, ${req.user.location?.state || 'India'}`;

    if (assessment) {
      structuredContext += `\n\nAuthoritative Solar Assessment:
- Recommended PV Capacity: ${assessment.recommendedCapacity} kW
- Solar Panels: ${assessment.panelCount} units (${assessment.panelWattage || 540}W Mono PERC Bifacial)
- Rooftop Footprint: ${assessment.areaRequiredSqFt} sq.ft required (Available: ${assessment.roofArea} sq.ft)
- Estimated Annual Generation: ${assessment.estimatedGeneration?.toLocaleString('en-IN')} kWh/year
- Gross Turnkey System Cost: ₹${assessment.estimatedCost?.toLocaleString('en-IN')}
- Government Subsidy: ₹${assessment.subsidy?.toLocaleString('en-IN')} (${assessment.userType === 'residential' ? 'PM Surya Ghar DBT Direct Bank Transfer' : '40% Accelerated Tax Depreciation'})
- Net Out-of-Pocket Investment: ₹${assessment.netCost?.toLocaleString('en-IN')}
- First-Year Electricity Savings: ₹${assessment.annualSavings?.toLocaleString('en-IN')}/year
- Simple Payback Period: ${assessment.paybackPeriod} years
- 25-Year Estimated ROI: ${assessment.roi}%
- Sizing Rationale: ${assessment.aiExplanation || 'Engineered per MNRE solar guidelines'}`;
    } else if (energyProfile && energyProfile.solar?.recommendedCapacity > 0) {
      structuredContext += `\n\nCanonical Energy Profile:
- Monthly Consumption: ${energyProfile.consumption?.monthlyConsumption} kWh
- Monthly Bill: ₹${energyProfile.consumption?.monthlyBill}
- Recommended Capacity: ${energyProfile.solar?.recommendedCapacity} kW
- Annual Generation: ${energyProfile.solar?.annualGeneration} kWh/year
- Net Outlay: ₹${energyProfile.financials?.netCost}
- First-Year Savings: ₹${energyProfile.financials?.annualSavings}/year
- Payback: ${energyProfile.financials?.paybackPeriod} years
- Financial Viability: ${energyProfile.financials?.financialViability}`;
    }

    if (recommendation && recommendation.systemOptions?.length > 0) {
      structuredContext += `\n\nComparative System Sizing Matrix:
${recommendation.systemOptions
  .map(
    (opt) =>
      `• ${opt.capacityKW} kW: Cost ₹${opt.netCost?.toLocaleString('en-IN')}, Generation ${opt.annualGeneration?.toLocaleString('en-IN')} kWh/yr, Payback ${opt.paybackPeriod} yrs, Subsidy ₹${opt.subsidy?.toLocaleString('en-IN')}`
  )
  .join('\n')}`;
    }

    if (recentBills.length > 0) {
      structuredContext += `\n\nElectricity Consumption History:
${recentBills
  .map(
    (b) =>
      `• ${b.billingMonth} ${b.billingYear}: ${b.unitsConsumed} kWh (₹${b.totalAmount}, Effective Tariff: ₹${b.tariff || (b.totalAmount / (b.unitsConsumed || 1)).toFixed(1)}/kWh)`
  )
  .join('\n')}`;
    }

    // 4. Determine thinkingLevel: 'MEDIUM' for complex multi-step financial or sizing logic, 'LOW' for conversational queries
    const isComplexQuery =
      /(?:payback|roi|npv|lcoe|depreciation|subsidy|sizing|formula|compare|dimension|matrix|feasibility|calculation)/i.test(
        message
      );
    const thinkingLevel = isComplexQuery ? 'MEDIUM' : 'LOW';

    const systemPrompt = `You are SolarSense AI, an intelligent, mathematically rigorous, and friendly renewable energy engineering and cost optimization consultant for the SolarSense AI platform in India, powered by Google Gemini 3.8 Flash.

${structuredContext}

Strict Grounding & Numerical Integrity Rules:
1. ENGINEERING CALCULATIONS ARE AUTHORITATIVE: Never override deterministic engineering calculations. Numerical figures (system cost, subsidy amount, annual kWh generation, savings, payback period, roof area, ROI) computed by the SolarSense platform are single source of truth. NEVER invent conflicting figures.
2. NEVER INVENT MISSING VALUES: If a requested value is unavailable, explicitly state that it is unavailable. Do not present estimates as actual measurements.
3. PM Surya Ghar: Muft Bijli Yojana Guidelines: Up to 2 kW: ₹30,000/kW (max ₹60,000); Additional for 3rd kW: ₹18,000; Capped at ₹78,000 for residential consumers. Commercial entities benefit from 40% accelerated tax depreciation and ESG offsets.
4. Keep explanations concise, transparent, and structured with clean markdown (bold, bullet points, headers).
5. For casual greetings or brief questions, answer warmly and conversationally without generating an overwhelming wall of text.`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const ai = new GoogleGenAI({ apiKey });

    // Include last 8 conversational messages
    const recentMessages = chat.messages.slice(-8).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const geminiContents = [
      ...recentMessages,
      { role: 'user', parts: [{ text: message.trim() }] },
    ];

    let reply = '';
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: geminiContents,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 1200,
          thinkingConfig: {
            thinkingLevel: thinkingLevel,
          },
        },
      });

      reply = response.text || 'I have analyzed your solar energy query.';
    } catch (geminiErr) {
      console.error('[Google Gemini 3.8 Flash API Error]', geminiErr.message || geminiErr);
      return res.status(503).json({
        success: false,
        message: 'SolarSense AI is temporarily unavailable. Please try again later.',
      });
    }

    // Append to chat history
    chat.messages.push({ role: 'user', content: message.trim(), timestamp: new Date() });
    chat.messages.push({ role: 'assistant', content: reply, timestamp: new Date() });
    chat.lastInteraction = new Date();
    await chat.save();

    return res.json({
      success: true,
      reply,
      model: modelName,
      thinkingLevel,
      assessmentContext: assessment
        ? {
            capacity: assessment.recommendedCapacity,
            subsidy: assessment.subsidy,
            annualSavings: assessment.annualSavings,
            payback: assessment.paybackPeriod,
          }
        : null,
    });
  } catch (err) {
    console.error('[Chat Controller Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat message. Please try again.',
    });
  }
};

/**
 * GET /api/chat/history
 * Retrieve full message history for the authenticated user
 */
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findOne({ user: userId });
    const assessment = await SolarAssessment.findOne({ userId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      messages: chat ? chat.messages : [],
      assessmentContext: assessment
        ? {
            capacity: assessment.recommendedCapacity,
            subsidy: assessment.subsidy,
            annualSavings: assessment.annualSavings,
            payback: assessment.paybackPeriod,
          }
        : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load chat history.' });
  }
};

/**
 * DELETE /api/chat/history
 * Clear message history for the authenticated user
 */
exports.clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    await Chat.findOneAndDelete({ user: userId });
    return res.json({ success: true, message: 'Conversation history cleared.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to clear conversation history.' });
  }
};
