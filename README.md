# SolarSense AI — Intelligent Solar Energy Recommendation & Cost Optimization Platform

**SolarSense AI** is a full-stack, enterprise-style web application designed to help electricity consumers across four distinct categories (Residential, Agricultural/Farm, Small Business, and Large Commercial/Industrial) determine solar suitability, compute transparent photovoltaic (PV) system sizing, calculate government subsidies (PM Surya Ghar), and project multi-year financial returns (ROI, payback period, levelized cost of energy).

Developed as a final-year **B.Tech Computer Engineering Capstone Project**.

---

## ☀ Core Objectives & Capabilities

1. **Consumer-Tailored Sizing:** Custom load curves and day/night usage modeling for:
   - **Residential / Homes:** Maximizes PM Surya Ghar subsidies (up to ₹78,000) and offsets high domestic tariff slabs.
   - **Farms & Agriculture:** Synchronizes daytime irrigation and agricultural pumps with peak solar irradiance hours.
   - **Small Business:** Leverages daytime commercial working hours for ~90% direct self-consumption.
   - **Large Commercial & Industrial:** Captures scale economies, accelerated tax depreciation (40%), and ESG decarbonization.
2. **Transparent Mathematical Engine:** All calculations follow open, published engineering equations with visible assumptions (peak sun hours, system performance ratio, panel wattage, unit costs).
3. **Multi-Size Cost Optimization:** Evaluates 5 system sizes side-by-side rather than automatically recommending the largest system.
4. **AI Bill Diagnostic Engine:** Analyzes electricity bills (PDF / Image / Manual), identifies consumption abnormalities, and categorizes solar feasibility.
5. **Downloadable Engineering Audit Reports:** Instant client-side high-resolution PDF report generation with breakdown tables, financial returns, and disclaimers.
6. **Strict Role-Based Access Control (RBAC):** Fully isolated user and administrator authentication systems with separate JWT secrets, contexts, and protected database endpoints.

---

## 🏛 System Architecture

```
                    ┌───────────────────────────────┐
                    │      React + Vite Client      │
                    │   (Tailwind CSS + Recharts)   │
                    └───────────────┬───────────────┘
                                    │ HTTP / Axios (Bearer JWT)
                                    ▼
                    ┌───────────────────────────────┐
                    │      Express REST Backend     │
                    │  (auth, adminAuth, multer)    │
                    └───────────────┬───────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────────────┐          ┌──────────────────────────────────┐
│     MongoDB / Mongoose       │          │      Modular AI / ML Layer       │
│ Users, Bills, Assessments,   │          │ - billAnalyzer.js                │
│ Recommendations, Reports,    │          │ - consumptionPredictor.js        │
│ SystemSettings               │          │ - solarPredictor.js              │
└──────────────────────────────┘          │ - recommendationEngine.js        │
                                          │ - aiService.js (ML / API hook)   │
                                          └──────────────────────────────────┘
```

---

## ⚡ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (Custom renewable palette: White + Solar Emerald + Sky Blue)
- **Routing:** React Router v6
- **Data Visualization:** Recharts (Responsive dual-bar, line, and donut charts)
- **Icons:** Lucide React
- **Document Export:** jsPDF & html2canvas

### Backend
- **Runtime:** Node.js (v20+) & Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs (Salt rounds: 10)
- **File Ingestion:** Multer & pdf-parse

### Modular AI/ML Service Layer
- **Location:** `server/ai/`
- **Design Philosophy:** Strict separation of transparent physics calculations from ML predictions. Clean REST interfaces for plugging in external Python / Gemini microservices with zero fabricated confidence values.

---

## 📂 Project Directory Structure

```
SolarSense AI/
├── package.json               # Root monorepo orchestration
├── .env.example               # Root configuration template
├── README.md                  # Complete technical documentation
│
├── server/                    # Node.js + Express Backend
│   ├── .env                   # Server environment secrets
│   ├── server.js              # Express app bootstrap
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── constants.js       # Solar constants, subsidies, costs
│   ├── models/
│   │   ├── User.js            # User model with role ('user' | 'admin')
│   │   ├── Bill.js            # Electricity bills & AI insights
│   │   ├── SolarAssessment.js # Assessment inputs and engineering outputs
│   │   ├── Recommendation.js  # 5-tier comparative optimization matrix
│   │   ├── Report.js          # Audit report records
│   │   └── SystemSetting.js   # Dynamic admin settings
│   ├── middleware/
│   │   ├── auth.js            # User JWT verification
│   │   ├── adminAuth.js       # Strict RBAC admin check
│   │   └── upload.js          # Multer upload handler (PDF, JPG, PNG)
│   ├── controllers/           # API controllers
│   ├── routes/                # REST endpoints
│   ├── utils/
│   │   ├── solarCalculations.js # Core mathematical formulas
│   │   └── billParser.js      # Heuristic PDF/bill parser
│   ├── ai/                    # Modular AI / ML Service Layer
│   │   ├── billAnalyzer.js
│   │   ├── consumptionPredictor.js
│   │   ├── solarPredictor.js
│   │   ├── recommendationEngine.js
│   │   └── aiService.js
│   ├── seed/
│   │   └── seedData.js        # Seed admin, demo users, bills & reports
│   └── uploads/               # Uploaded bill storage
│
└── client/                    # React + Vite Frontend
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── context/           # AuthContext & AdminAuthContext
    │   ├── services/          # Axios API service clients
    │   ├── components/        # Reusable UI, charts, and tables
    │   ├── layouts/           # Public, User, and Admin layouts
    │   ├── pages/
    │   │   ├── public/        # Landing, How It Works, Solutions, About, Login
    │   │   ├── user/          # Dashboard, Assessment Wizard, Bill, Cost, Reports
    │   │   └── admin/         # Admin Dashboard, Users, Reports, Analytics, Settings
    │   ├── utils/             # Formatters and PDF export
    │   └── App.jsx            # Application routing
```

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Active instance on `mongodb://127.0.0.1:27017` (Community or Atlas)

### 2. Clone & Install Dependencies
From the repository root:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Variables Configuration
In `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/solarsense_ai
JWT_SECRET=solarsense_super_secret_jwt_key_2026_btech_project
ADMIN_REGISTRATION_SECRET=solar_admin_secret_passphrase_2026

# Optional: External ML / LLM Integration
# AI_SERVICE_URL=http://localhost:8000
# GEMINI_API_KEY=your_gemini_api_key
```

### 4. Seed Database with Demo Accounts
Run the seed script from `server/`:

```bash
npm run seed
```

This creates:
- **System Administrator:** `admin@solarsense.ai` / `Admin@12345`
- **Residential Demo:** `rahul.residential@solarsense.ai` / `User@12345` (380 kWh/mo)
- **Farm Demo:** `ramesh.farm@solarsense.ai` / `User@12345` (1,850 kWh/mo)
- **Small Business Demo:** `priya.business@solarsense.ai` / `User@12345` (1,250 kWh/mo)
- **Commercial Demo:** `arjun.commercial@solarsense.ai` / `User@12345` (16,500 kWh/mo)
- Pre-computed bills, assessments, optimization matrices, and reports.

### 5. Running the Application Locally

In terminal 1 (Backend API):
```bash
cd server
npm run dev
# Starts on http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd client
npm run dev
# Starts on http://localhost:5173
```

---

## 🔐 Authentication & RBAC

| Role | Login URL | Allowed Routes | Middleware Protection |
| :--- | :--- | :--- | :--- |
| **Consumer (User)** | `/login` | `/dashboard`, `/onboarding`, `/bill-analysis`, `/solar-recommendation`, `/cost-analysis`, `/reports`, `/profile` | `protect` (JWT Token) |
| **Administrator** | `/admin/login` | `/admin/dashboard`, `/admin/users`, `/admin/reports`, `/admin/analytics`, `/admin/settings` | `protect` + `adminProtect` |

> [!IMPORTANT]
> Admin authorization is strictly enforced on the Express backend via `adminProtect` middleware. Attempting to query `/api/admin/*` using a regular user token immediately yields `403 Forbidden`.

---

## 🧮 Mathematical Solar Formulas

- **Daily Consumption:**
  $$\text{Daily kWh} = \frac{\text{Monthly Consumption}}{30}$$
- **Recommended PV Capacity:**
  $$\text{Capacity (kW)} = \frac{\text{Daily kWh}}{\text{Peak Sun Hours (4.8)} \times \text{Performance Ratio (0.78)}}$$
- **Estimated Annual Generation:**
  $$\text{Annual kWh} = \text{Capacity (kW)} \times 4.8 \times 365 \times 0.78$$
- **Panel Count (540W Modules):**
  $$\text{Modules} = \lceil \frac{\text{Capacity (kW)} \times 1000}{540} \rceil$$
- **Net Cost:**
  $$\text{Net Outlay} = (\text{Capacity} \times \text{Cost per kW}) - \text{Subsidy}$$
- **Simple Payback:**
  $$\text{Payback (Years)} = \frac{\text{Net Outlay}}{\text{Annual Savings}}$$

---

## 📄 Engineering Disclaimer
All solar capacities, generation projections (kWh), cost calculations, subsidies, and payback periods provided by SolarSense AI are mathematical estimates based on regional solar irradiance averages. Certified feasibility requires a physical structural survey and DISCOM net-metering validation.
