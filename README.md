# SolarSense AI — Intelligent Solar Energy Recommendation & Cost Optimization Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/ML%20Service-FastAPI%20%7C%20Python-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**SolarSense AI** is an enterprise-grade, full-stack climate-tech platform designed to empower electricity consumers across India—spanning **Residential**, **Agricultural/Farm**, **Small Business**, and **Commercial & Industrial** categories—to evaluate rooftop solar feasibility, determine transparent photovoltaic (PV) system sizing, calculate **PM Surya Ghar: Muft Bijli Yojana** subsidies, simulate alternative system capacities in real time, and project 25-year financial returns.

Developed as an end-to-end **B.Tech Computer Engineering Capstone Project**.

---

## 📑 Table of Contents

- [Key Features & Capabilities](#-key-features--capabilities)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Database Seeding](#database-seeding)
  - [Starting the Services](#starting-the-services)
- [Demo Credentials](#-demo-credentials)
- [Mathematical Engineering Formulas](#-mathematical-engineering-formulas)
- [API Reference](#-api-reference)
  - [Express REST Endpoints (Port 5000)](#express-rest-endpoints-port-5000)
  - [FastAPI ML Microservice Endpoints (Port 8000)](#fastapi-ml-microservice-endpoints-port-8000)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Design System & UI Guidelines](#-design-system--ui-guidelines)
- [Engineering & Regulatory Disclaimer](#-engineering--regulatory-disclaimer)

---

## ☀ Key Features & Capabilities

### 1. Interactive What-If Solar Simulator
- **Dynamic Capacity Sizing:** Users can freely explore system sizes from **1.0 kW to 15.0 kW** using an interactive slider (0.5 kW increments) or one-click preset chips (**1, 2, 3, 5, 7, 10 kW**).
- **Zero-Lag Calculation:** Instantly computes annual generation (kWh), net investment after PM Surya Ghar subsidy, annual savings, payback period, and bill reduction percentage without page reloads or calculate buttons.
- **Recommended vs. What-If Comparison:** Contrasts the user's deterministic sizing against their hypothetical what-if choice with plain-language, non-judgmental trade-off explanations.
- **Transparent Assumptions:** Expandable drawer breaking down peak sun hours (PSH), 78% performance ratio, panel efficiency, and central subsidy tiers.

### 2. Consumer-Tailored Solar Feasibility Engine
- **Residential:** Optimizes for slab tariffs, PM Surya Ghar DBT subsidies (up to ₹78,000), and maximum household bill reduction.
- **Agricultural / Farm:** Aligns diurnal agricultural pumping schedules with peak solar irradiation curves.
- **Small Business:** Models daytime commercial hours to maximize direct self-consumption (~90%).
- **Commercial & Industrial (C&I):** Incorporates accelerated depreciation (40%), demand charge mitigation, and corporate ESG decarbonization.

### 3. AI Bill Diagnostic & Ingestion Engine
- **Multiformat Bill Upload:** Supports PDF, JPEG, and PNG electricity bills as well as manual entry.
- **Automated Parameter Extraction:** Extracts units consumed (kWh), total amount (₹), tariff rate, billing period, sanctioned load, and DISCOM identifier.
- **Consumption Anomaly Detection:** Flags unseasonal spikes, meter irregularities, and abnormal month-on-month consumption variance.

### 4. 5-Tier Comparative Optimization Matrix
- Evaluates 5 system sizes side-by-side rather than forcing a single rigid recommendation:
  1. *Conservative / Budget-Optimized*
  2. *Balanced / Recommended*
  3. *High-Offset / Net-Zero Target*
  4. *Future-Proof / EV-Ready*
  5. *Maximum Roof Capacity*

### 5. Solar Manufacturers & EPC Directory
- **Verified Brands:** Pre-loaded with top Tier-1 ALMM-listed manufacturers and turnkey installers (Tata Power Solar, Waaree Energies, Adani Solar, Premier Energies, Vikram Solar, Loom Solar).
- **Interactive Multi-Parameter Comparison:** Side-by-side comparison of cell technologies (Mono PERC vs. TOPCon vs. Bifacial), warranties, turnkey prices/kW, and DISCOM net-metering support.
- **Visual Differentiation:** Distinct surface elevation (`#CBD5E1` borders, soft visible shadows) with subtle spotlighting for top recommendations.

### 6. AI Solar Advisor & Chat
- Conversational energy assistant (`/chat`) delivering grounded guidance on net-metering regulations, PM Surya Ghar portal procedures, inverter choices (String vs. Microinverters), battery backup storage, and seasonal maintenance.

### 7. High-Resolution Audit Reports
- Client-side instantaneous PDF audit report generation via **jsPDF** and **html2canvas**, complete with consumption charts, financial payback timelines, environmental CO2 offsets, and engineering disclaimers.

### 8. Comprehensive Administration Portal
- Dedicated admin workspace (`/admin`) for system monitoring, user account governance, audit report logs, regional solar adoption analytics, and real-time adjustment of subsidy slabs and base system costs.

---

## 🏛 System Architecture

```
                                 ┌─────────────────────────────────┐
                                 │     React 18 + Vite Client      │
                                 │   Tailwind CSS  •  Recharts     │
                                 │     (Runs on Port 5173)         │
                                 └────────────────┬────────────────┘
                                                  │
                                                  │ HTTP / REST (Bearer JWT)
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │     Node.js + Express API       │
                                 │   Auth, Multer, Sizing Engine   │
                                 │     (Runs on Port 5000)         │
                                 └────────┬──────────────┬─────────┘
                                          │              │
                   Mongoose ODM / TCP     │              │ HTTP Internal API
                                          ▼              ▼
┌───────────────────────────────────────────┐   ┌───────────────────────────────────┐
│              MongoDB Database             │   │       Python FastAPI ML Core      │
│  • Users & Profiles      • Bills          │   │      scikit-learn  •  NumPy       │
│  • Solar Assessments     • Recommendations│   │       (Runs on Port 8000)         │
│  • Reports               • System Settings│   │ • 12-Month Consumption Forecast   │
│  • Solar Companies Directory              │   │ • Solar Yield Estimation          │
└───────────────────────────────────────────┘   │ • Anomaly Detection               │
                                                └───────────────────────────────────┘
```

---

## ⚡ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router v6, Recharts, Lucide Icons, jsPDF, html2canvas, Axios |
| **Backend API** | Node.js (v20+), Express.js, Mongoose 8, JWT, bcryptjs, Multer, pdf-parse, cors, dotenv |
| **Machine Learning** | Python 3.10+, FastAPI, Uvicorn, scikit-learn, NumPy, SciPy, Pydantic |
| **Database** | MongoDB 6.0+ (Community or Atlas) |
| **Design Tokens** | `#F8FAFC` (Canvas), `#FFFFFF` (Cards), `#CBD5E1` (Borders), `#16A34A` (SolarSense Emerald) |

---

## 📂 Project Directory Structure

```
SolarSense AI/
├── package.json                   # Root monorepo workspace & launcher scripts
├── .gitignore                     # Git tracking exclusions
├── README.md                      # Comprehensive project documentation
│
├── client/                        # React 18 + Vite Frontend Application
│   ├── index.html                 # HTML5 document shell & SEO meta tags
│   ├── vite.config.js             # Vite configuration & server proxies
│   ├── tailwind.config.js         # Tailwind design tokens & font definitions
│   └── src/
│       ├── index.css              # Global styles, .lc-card elevation utilities
│       ├── App.jsx                # Route declarations & role guards
│       ├── context/               # AuthContext & AdminAuthContext
│       ├── services/              # API clients (auth, bill, solar, company, etc.)
│       ├── utils/
│       │   ├── solarSimulatorEngine.js # PM Surya Ghar subsidy & what-if math
│       │   ├── formatters.js      # Currency (INR) and kW/kWh formatters
│       │   └── pdfExport.js       # Client-side PDF audit report generator
│       ├── components/
│       │   ├── common/            # Navbar, Sidebar, Footer, Modal, StatCard
│       │   ├── solar/             # WhatIfSolarSimulator, ComparisonCard, etc.
│       │   ├── bill/              # BillUploadZone, BillInsightsCard
│       │   ├── charts/            # SavingsChart, GenerationChart, PaybackChart
│       │   └── admin/             # AdminSidebar, AdminHeader, MetricsCard
│       └── pages/
│           ├── public/            # Landing, HowItWorks, Solutions, Subsidies, About, Login
│           ├── user/              # Dashboard, Onboarding, BillAnalysis, Recommendation,
│           │                      # CostAnalysis, Companies, CompanyComparison, Reports, Chat
│           └── admin/             # AdminDashboard, Users, Reports, Analytics, Settings
│
├── server/                        # Node.js + Express REST Backend
│   ├── server.js                  # Express bootstrap, CORS, & error handlers
│   ├── config/
│   │   ├── db.js                  # MongoDB connection with retry logic
│   │   └── constants.js           # Solar constants, subsidy slabs, default rates
│   ├── models/
│   │   ├── User.js                # Users with hashed passwords & roles
│   │   ├── Bill.js                # Electricity bills, OCR metadata, field confidences
│   │   ├── SolarAssessment.js     # User inputs & mathematical sizing outputs
│   │   ├── Recommendation.js      # 5-tier comparative optimization matrix
│   │   ├── Company.js             # Solar manufacturers & EPC evaluation scores
│   │   ├── Report.js              # Audit report logs & status
│   │   └── SystemSetting.js       # Global dynamic admin configuration
│   ├── middleware/
│   │   ├── auth.js                # User JWT verification
│   │   ├── adminAuth.js           # Strict administrator role check
│   │   └── upload.js              # Multer file ingestion (PDF, PNG, JPG)
│   ├── controllers/               # Route business logic
│   ├── routes/                    # Express route declarations
│   ├── utils/
│   │   ├── solarCalculations.js   # Deterministic solar physics formulas
│   │   └── billParser.js          # Heuristic text & regex bill parser
│   ├── seed/
│   │   └── seedData.js            # Initializer script for admin, demo users, companies
│   └── uploads/                   # Staged upload directory
│
└── ml-service/                    # Python FastAPI Machine Learning Microservice
    ├── app.py                     # FastAPI application & API endpoints
    ├── requirements.txt           # Python dependencies
    ├── inference/
    │   └── predictor.py           # Model inference engine (yield, consumption, anomalies)
    ├── training/
    │   └── train_models.py        # Model training & synthetic data pipelines
    ├── preprocessing/             # Feature transformers & scalers
    └── models/                    # Serialized model binaries (.joblib / .pkl)
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: v3.10 or higher ([Download Python](https://python.org/))
- **MongoDB**: Active instance running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

---

### Environment Configuration

#### 1. Backend (`server/.env`)
Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/solarsense_ai
JWT_SECRET=solarsense_super_secret_jwt_key_2026_btech_project
ADMIN_REGISTRATION_SECRET=solar_admin_secret_passphrase_2026
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

#### 2. ML Service (`ml-service/.env` or defaults)
```env
PORT=8000
ENVIRONMENT=development
ML_ADMIN_SECRET=solar_admin_secret_passphrase_2026
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
```

---

### Database Seeding
Populate the database with administrator accounts, Tier-1 solar companies, and demo consumer accounts:

```bash
cd server
npm install
npm run seed
```

---

### Starting the Services

You can start each service in its own terminal or use the root scripts:

#### Option A: From the Root Directory

| Terminal | Service | Command | URL |
| :--- | :--- | :--- | :--- |
| **Terminal 1** | Express Backend | `npm run server` | `http://localhost:5000` |
| **Terminal 2** | React Client | `npm run client` | `http://localhost:5173` |
| **Terminal 3** | Python ML Service | `npm run ml` | `http://localhost:8000` |

#### Option B: Direct Commands

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
```

**Terminal 3 — Python ML Service:**
```bash
cd ml-service
# Optional: create & activate virtualenv
python -m venv venv
# Windows: venv\Scripts\activate | Unix: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Once started, open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Credentials

All seed accounts share the same password format:

| Account Type | Email | Password | Baseline Profile |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@solarsense.ai` | `Admin@12345` | Global admin access |
| **Residential Consumer** | `rahul.residential@solarsense.ai` | `User@12345` | 380 kWh/month, 3 kW rooftop |
| **Agricultural / Farm** | `ramesh.farm@solarsense.ai` | `User@12345` | 1,850 kWh/month, 10 kW pump |
| **Small Business** | `priya.business@solarsense.ai` | `User@12345` | 1,250 kWh/month, 8 kW shop |
| **Commercial & Industrial** | `arjun.commercial@solarsense.ai` | `User@12345` | 16,500 kWh/month, 100 kW plant |

---

## 🧮 Mathematical Engineering Formulas

All calculations in SolarSense AI use published engineering standards:

### 1. Daily Average Consumption
$$\text{Daily Consumption (kWh)} = \frac{\text{Monthly Consumption (kWh)}}{30}$$

### 2. Sizing Recommendation
$$\text{System Capacity (kW)} = \frac{\text{Daily Consumption (kWh)}}{\text{Peak Sun Hours (4.8)} \times \text{Performance Ratio (0.78)}}$$

### 3. Estimated Annual Generation
$$\text{Annual Generation (kWh)} = \text{Capacity (kW)} \times \text{Peak Sun Hours (4.8)} \times 365 \times \text{Performance Ratio (0.78)}$$

### 4. PM Surya Ghar: Muft Bijli Yojana Central Subsidy
$$\text{Subsidy (₹)} = \begin{cases} 
\text{Capacity} \times ₹30,000 & \text{if } \text{Capacity} \le 1\text{ kW} \\
₹60,000 & \text{if } 1 < \text{Capacity} \le 2\text{ kW} \\
₹78,000 & \text{if } \text{Capacity} \ge 3\text{ kW} \\
₹0 & \text{if Non-Residential (C\&I / Commercial)}
\end{cases}$$

### 5. Net Capital Outlay
$$\text{Net Investment (₹)} = (\text{Capacity (kW)} \times \text{Cost per kW}) - \text{Subsidy (₹)}$$

### 6. Simple Payback Period
$$\text{Payback (Years)} = \frac{\text{Net Investment (₹)}}{\text{Annual Electricity Cost Savings (₹)}}$$

### 7. Module Quantity (540W Mono PERC)
$$\text{Number of Panels} = \left\lceil \frac{\text{Capacity (kW)} \times 1000}{540\text{ W}} \right\rceil$$

### 8. Rooftop Area Requirement
$$\text{Area Required (sq ft)} = \text{Capacity (kW)} \times 85\text{ sq ft/kW}$$

---

## 📡 API Reference

### Express REST Endpoints (Port 5000)

#### Authentication & Profile (`/api/auth`, `/api/users`)
- `POST /api/auth/register` — Register new consumer account
- `POST /api/auth/login` — Authenticate user and receive JWT
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/forgot-password` — Password recovery dispatch
- `PUT /api/users/profile` — Update category, address, and tariff details

#### Electricity Bills (`/api/bills`)
- `POST /api/bills/upload` — Upload PDF/image bill for heuristic extraction
- `POST /api/bills/manual` — Record manual bill entry
- `GET /api/bills` — Retrieve user's bill history
- `GET /api/bills/:id` — Retrieve specific bill analysis and AI insights
- `DELETE /api/bills/:id` — Remove bill record

#### Solar Sizing & Recommendations (`/api/solar`)
- `POST /api/solar/assess` — Compute deterministic solar assessment
- `GET /api/solar/recommendation` — Retrieve 5-tier comparative matrix
- `GET /api/solar/savings-projection` — 25-year cumulative financial cashflow

#### Solar Companies Directory (`/api/companies`)
- `GET /api/companies` — Retrieve all verified solar manufacturers & installers
- `GET /api/companies/compare?ids=id1,id2,id3` — Multi-parameter comparison
- `GET /api/companies/:id` — Individual company profile & rating breakdown

#### AI Energy Chatbot (`/api/chat`)
- `POST /api/chat/message` — Submit query to SolarSense AI energy advisor

#### Administration (`/api/admin`) *(Requires `adminProtect`)*
- `POST /api/admin/login` — Administrator authentication
- `GET /api/admin/stats` — Platform aggregates (users, capacity, kW installed)
- `GET /api/admin/users` — User management and status administration
- `GET /api/admin/settings` — System parameters and subsidy slab configuration
- `PUT /api/admin/settings` — Update subsidy caps and default cost per kW

---

### FastAPI ML Microservice Endpoints (Port 8000)

- `GET /health` — Microservice liveness and dependency status
- `POST /predict/consumption` — 12-month consumption forecasting based on baseline usage, user category, and seasonal variance
- `POST /predict/solar` — Machine-learned monthly solar yield prediction curves
- `POST /predict/anomalies` — Statistical & ML anomaly detection on billing time series
- `POST /train` — Trigger model retraining on updated regional datasets *(Requires `ML_ADMIN_SECRET`)*

---

## 🔒 Role-Based Access Control (RBAC)

| User Role | Entry Point | Accessible Routes | Backend Middleware |
| :--- | :--- | :--- | :--- |
| **Public Guest** | `/` | `/`, `/how-it-works`, `/solutions`, `/subsidies`, `/about`, `/login`, `/register` | None (Public) |
| **Consumer (User)** | `/login` | `/dashboard`, `/onboarding`, `/bill-analysis`, `/solar-recommendation`, `/cost-analysis`, `/companies`, `/company-comparison`, `/reports`, `/chat`, `/profile` | `protect` (JWT Token) |
| **System Administrator** | `/admin/login` | `/admin/dashboard`, `/admin/users`, `/admin/reports`, `/admin/analytics`, `/admin/settings` | `protect` + `adminProtect` |

Admin endpoints are strictly protected at the database and routing levels. Querying `/api/admin/*` without valid administrator claims results in an immediate `403 Forbidden` response.

---

## 🎨 Design System & UI Guidelines

SolarSense AI adheres to a modern, consumer-grade light theme:

- **Canvas Background:** `#F8FAFC` (Slate 50)
- **Card Surface:** `#FFFFFF` (Pure White) with crisp `#CBD5E1` (Slate 300) boundaries
- **Card Shadows:** Soft, multi-layered elevation (`box-shadow: 0 1px 4px -1px rgba(15,23,42,0.08), 0 2px 6px -1px rgba(15,23,42,0.06)`)
- **Primary Brand Accent:** `#16A34A` (SolarSense Emerald)
- **High-Contrast Text:** `#0F172A` (Slate 900) for headers and `#334155` / `#64748B` for body & metadata
- **Typography:** Inter / system sans-serif with readable base sizes (titles: 18–22px, body: 14–16px, metadata: 13–14px)

---

## ⚖ Engineering & Regulatory Disclaimer

> [!NOTE]
> All solar PV system capacities, generation estimates (kWh), subsidy calculations, and payback durations generated by SolarSense AI are derived from mathematical modeling and regional irradiation averages. Final feasibility requires a physical rooftop structural inspection, shadow analysis, and DISCOM net-metering approval.

---

## 👨‍💻 Project Authors & Credits

Developed with passion by the **SolarSense AI Team** as a final-year Computer Engineering capstone project.
For inquiries, feedback, or collaborations, feel free to open an issue or pull request.
