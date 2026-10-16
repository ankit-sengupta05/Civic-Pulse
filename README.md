# 🏙️ CivicPulse Sight — Urban & Geospatial Infrastructure Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-1.124+-4F81BD?logo=cesium&logoColor=white)](https://cesium.com)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-3D%20Buildings-7EBC6F?logo=openstreetmap&logoColor=white)](https://openstreetmap.org)

> **CivicPulse Sight Signature:** *Empowering civic authorities and emergency dispatchers with transparent, explainable infrastructure triage, open-source CCTV streaming, and real-time 3D planetary intelligence.*

---

## 📌 Executive Overview: "Where Should We Fix First?"

Municipal authorities and public-works teams are overwhelmed by thousands of concurrent service requests: hazardous potholes, damaged traffic signals, burst drainage, flooded underpasses, pedestrian safety complaints, and blackout streetlight outages. With strictly limited budgets, equipment, and field crews, public agencies face a critical optimization challenge: **Which location deserves immediate intervention first?**

**CivicPulse Sight** solves this through a dual-stack intelligence architecture:
1. **Mathematical & Regularized Prioritization Engine:** Transparently aggregates 1,000 locations, 10,000 incident logs, and 8,000 public complaints across 20 municipal zones, balancing severity, life-safety risk, unresolved backlog, complaint pressure, and local vulnerability.
2. **Interactive 3D Geospatial Console:** A photorealistic CesiumJS-powered digital twin featuring 3D building geometry, an open-source CCTV mesh, dynamic street traffic layers, and incident fly-tos.

```
                              CIVICPULSE SIGHT ARCHITECTURE
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                               DATA INGESTION                                │
   │  • locations.csv (1k)    • incidents.csv (10k)    • public_complaints (8k) │
   └──────────────────────────────────────┬──────────────────────────────────────┘
                                          │
                                          ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                       PREPROCESSING & OUTLIER CONTROL                       │
   │  • Right-censoring of open tickets     • 1st/99th Percentile Winsorization  │
   │  • RobustScaler (Median / IQR)         • Empirical Bayes Zone Shrinkage     │
   └──────────────────────────────────────┬──────────────────────────────────────┘
                                          │
                                          ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                        TRIAGE & REGULARIZED MODELING                        │
   │  • Multi-factor Policy Priority Score  • 200x Poisson Bootstrap Stability   │
   │  • Ridge Regression Path (Alpha Tuning)• Surrogate Explainability Dashboard │
   └──────────────────────────────────────┬──────────────────────────────────────┘
                                          │
                                          ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │                          3D GEOSPATIAL INTERFACE                            │
   │  • CesiumJS 3D Photoreal / OSM Tiles   • Open-Source CCTV Video Mesh        │
   │  • Real-Time Traffic Congestion Vector • Interactive Triage Command Cockpit │
   └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Section 1 — Data Science & Machine Learning Pipeline

CivicPulse Sight features an end-to-end data pipeline implemented in Python with full visualizations and reproducible notebooks ([`training/smart_city_analysis.ipynb`](file:///c:/SDE%20Projects/SmartCity/training/smart_city_analysis.ipynb)).

### 1. Ingested Datasets
- **`locations.csv` (1,000 rows):** Coordinates (`latitude`, `longitude`), `zone` (ZONE_01 to ZONE_20), `road_type` (Local, Collector, Residential, Arterial, Highway), `road_condition` (Good, Fair, Poor, Critical), `population_density`, and proximity flags (`near_school`, `near_hospital`, `pedestrian_activity`).
- **`incidents.csv` (10,000 rows):** Historical incident records from 2025 detailing `incident_type` (Pothole, Flooding, Streetlight outage, Blocked drain, Collision, Signal failure), `severity` (Low, Medium, High, Critical), `reported_by` (Citizen, Authority, Police, Sensor), `resolution_time_hours`, and `injuries`.
- **`public_complaints.csv` (8,000 rows):** Citizen feedback detailing `category`, `priority` (Low, Normal, High), `status` (Open, Assigned, In progress, Resolved, Closed), and elapsed `days_open`.

### 2. Rigorous Outlier Handling & Preprocessing
- **Anomaly Detection:** Evaluated across both Z-Score ($|z| > 3.0$) and Interquartile Range ($1.5 \times \text{IQR}$).
- **Winsorization:** Applied two-sided clipping at the 1st and 99th percentiles for long-tailed duration metrics (`avg_resolution_hours` compressed from 10–66h to 16–54h), retaining vital high-severity anomalies without mathematical distortion.
- **Robust Scaling:** Standardized skewed metrics using `RobustScaler` (median-centered and interquartile-ranged) rather than Gaussian `StandardScaler`.
- **Shrinkage Regularization:** Sparse locations are stabilized toward their respective zone means using empirical Bayes shrinkage:
  $$\hat{\theta}_i = \frac{n_i \cdot \bar{x}_i + 3 \cdot \mu_{\text{zone}}}{n_i + 3}$$

### 3. Transparent Priority Formulation
The composite priority score ($0 - 100$) is derived from 6 weighted pillars:
- **Severity Load (30%):** Exponential-weighted severity ($\text{Low}=1, \text{Med}=2, \text{High}=4, \text{Critical}=8$) with a 120-day half-life decay.
- **Unresolved Backlog (20%):** Right-censored active hours of pending and aging incidents.
- **Public Complaint Pressure (15%):** Weighted volume of active citizen complaints.
- **Spatial Exposure (15%):** Proximity to vulnerable infrastructure (schools, trauma hospitals, pedestrian activity, high population density).
- **Life Safety & Injuries (10%):** Casualty and injury counts from vehicular or structural incidents.
- **Worsening Trend (10%):** Positive slope of incidents over preceding quarters.

### 4. Surrogate Regularized Models
Linear surrogate models (Ridge, ElasticNet, Lasso, OLS) are fitted across the feature space to provide auditable coefficient importance to civil stakeholders:
- **Ridge Regression ($\ell_2$ penalty):** Demonstrates stable parameter shrinkage and provides feature importance rankings without zeroing out correlated urban risk indicators.
- **Bootstrap Stability:** 200 Poisson resamples yield 10th–90th percentile rank intervals and the exact probability that an identified site remains in the Top 50.

---

## 🌐 Section 2 — 3D Geospatial Console & CCTV Mesh

CivicPulse Sight pairs its backend engine with an interactive, high-performance 3D geospatial console built on **CesiumJS**:

### 🛰️ Key Geospatial Capabilities
- **Photorealistic & OpenStreetMap 3D Buildings:** Real-time 3D tileset rendering of building volumes, topography, and street corridors.
- **Austin, TX & Global Coordination:** Pre-configured geospatial views with coordinates, compass heading, camera tilt, and elevation controls.
- **Open-Source CCTV Surveillance Mesh:**
  - Map markers with color-coded operational health.
  - Interactive camera viewing frustums and coverage viewsheds.
  - Live RTSP/HLS video stream simulations in modal viewports.
  - Auto-hop patrol mode between high-density intersections.
- **Dynamic Traffic Telemetry:**
  - Real-time simulation of roadway flow velocity.
  - Congestion heatmapping overlaid directly onto arterial and collector corridors.
  - Quick-toggle layer controls for incidents, sensors, traffic, and cameras.

---

## 📂 Project Directory Structure

```plaintext
SmartCity/
├── .gitignore                      # Strict multi-layer security & ignore specification
├── README.md                       # Comprehensive project documentation
├── index.html                      # Standalone CivicPulse Sight triage audit & validation web app
├── PRD.md                          # Product Requirements & Design Specifications
├── TECH_STACK.md                   # Architectural components & runtime licenses
│
├── 03_smart_city_where_fix_first/  # Datathon 2026 track datasets
│   ├── locations.csv               # 1,000 spatial and contextual location rows
│   ├── incidents.csv               # 10,000 incident historical records
│   └── public_complaints.csv       # 8,000 citizen complaint submissions
│
├── training/                       # Pure Custom From-Scratch ML & Regularization Pipeline
│   ├── train_all_models.py         # Autonomous trainer for 4 pure from-scratch custom ML models
│   ├── preprocess/                 # Clean preprocessed features & train/test splits
│   │   ├── preprocessed_dataset.csv# Unified feature matrix with engineered indicators
│   │   ├── features_train.csv      # Training split (800 rows, 80%)
│   │   └── features_test.csv       # Holdout evaluation test split (200 rows, 20%)
│   ├── 01_custom_linear_regression/# From-scratch Ridge Normal Equation (L2)
│   │   ├── model/                  # scratch_linear_regression.joblib & architecture spec
│   │   ├── metrics.json            # Acc: 87.5%, RMSE: 1.182, R²: 0.9858
│   │   └── *.png                   # Confusion matrix, pred vs actual, weights
│   ├── 02_custom_logistic_regression/# From-scratch Softmax Multi-Class Gradient Descent
│   │   ├── model/                  # scratch_logistic_regression.joblib & architecture spec
│   │   ├── metrics.json            # Acc: 82.5%, Macro F1: 0.7799
│   │   └── *.png                   # Confusion matrix, ROC curves, loss history
│   ├── 03_custom_random_forest/    # From-scratch Bagging Decision Trees Ensemble
│   │   ├── model/                  # scratch_random_forest.joblib & architecture spec
│   │   ├── metrics.json            # Acc: 72.0%, RMSE: 4.274, R²: 0.8149
│   │   └── *.png                   # Feature importance, pred vs actual, confusion matrix
│   ├── 04_custom_hybrid_ensemble/  # Stacking + Spatial Empirical Bayes Shrinkage
│   │   ├── model/                  # scratch_hybrid_ensemble.joblib & architecture spec
│   │   ├── metrics.json            # Acc: 80.5%, RMSE: 2.449, R²: 0.9392
│   │   └── *.png                   # Zone shrinkage, pred vs actual, confusion matrix
│   └── 05_models_evaluation_comparison/# Side-by-side matrices & comparison summaries
│       ├── models_metrics_comparison_table.csv
│       ├── models_metrics_summary.json
│       ├── all_models_side_by_side_matrix.png
│       └── all_models_confusion_matrices.png
│   ├── build_nb.py                 # Reproducible Python notebook generator script
│   └── smart_city_analysis.ipynb   # Interactive Jupyter Notebook with Section 9 Multi-Model Comparison
│
├── deploy.bat                      # Windows 1-Click Deployment Launcher (Auto-Installs & Launches Browser)
├── deploy.command                  # macOS 1-Click Double-Clickable Launcher (Terminal + Auto-Browser)
├── deploy.sh                       # Unix/macOS/Linux Shell Launcher Script
├── package.json                    # Project manifest, scripts, and dependencies
├── vite.config.js                  # Vite server & proxy configuration
├── index.html                      # 3D Cockpit HTML entrypoint (CesiumJS)
├── triage-audit.html               # Comprehensive standalone Triage & Validation Engine
├── style.css                       # Global cockpit styles
│
├── public/                         # Public web assets
│   ├── manifest.webmanifest        # PWA configuration
│   ├── audit.html                  # Full Triage Audit web interface
│   └── smartcity/                  # Urban Priority Engine UI & Data
│       ├── index.html              # Interactive triage map & priority ranking UI
│       ├── architecture.html       # Pipeline specification & methodology
│       ├── training_plots/         # Mirrored model evaluation & comparison plots
│       └── data/
│           ├── locations.json      # Exported scored locations
│           ├── priorities.json     # 1,000 municipal road sectors
│           ├── model_inference.json# Exported ML model coefficients & inference contract
│           └── validation.json     # Integrity checks and model metrics
└── src/                            # Modular JavaScript source code
    ├── main.js                     # CesiumJS initialization & camera controllers
    ├── civicpulse/                 # CivicPulse Intel Hub
    │   ├── civicpulse-intel.js     # Camera dossier HUD, citizen complaints & admin console
    │   └── civicpulse-ui.css       # Glassmorphism styling, reticle & expand modal
    ├── layers/                     # Data layer providers (CCTV, Traffic, ADS-B, FIRMS)
    ├── ui/                         # Dark sci-fi chrome, HUD, and dock templates
    └── voice/                      # Hands-free natural language map navigation
```

---

## 🚀 Getting Started & Local Reproduction

### Prerequisites
- **Node.js**: `v20.0.0` or higher (Node 24 recommended)
- **Python**: `3.10` or higher with `pip`
- Modern browser with WebGL 2.0 support (Chrome, Edge, Firefox, Brave)

---

### ⚡ 1-Click Instant Deployment

#### 🪟 On Windows:
Simply double-click or run:
```cmd
deploy.bat
```

#### 🍎 On macOS:
Simply double-click in Finder:
```bash
deploy.command
```
*(Or in Terminal run: `./deploy.sh`)*

Both launchers will automatically:
1. Verify Node.js presence.
2. Automatically run `npm install` if `node_modules/` is absent.
3. Print all live web links in the console.
4. Auto-launch your default browser to [`http://localhost:4173/`](http://localhost:4173/).
5. Start the live Cesium & Vite server.

---

### 💻 Manual CLI Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Launch the local development server:
   ```bash
   npm run dev
   ```

3. Open your browser:
   - **3D Geospatial Console (with CCTV & Traffic):** [`http://localhost:4173/`](http://localhost:4173/)
   - **Urban Priority Command Center:** [`http://localhost:4173/smartcity/index.html`](http://localhost:4173/smartcity/index.html)
   - **Triage Audit & Model Validation:** [`http://localhost:4173/audit.html`](http://localhost:4173/audit.html)
   - **Triage Architecture Guide:** [`http://localhost:4173/smartcity/architecture.html`](http://localhost:4173/smartcity/architecture.html)

---

### 2. Running the Data Science & Modeling Pipeline

1. Ensure the required Python packages are installed:
   ```bash
   pip install numpy pandas matplotlib seaborn scipy scikit-learn jupyterlab
   ```

2. Run the automated notebook builder:
   ```bash
   python training/build_nb.py
   ```

3. Launch Jupyter to inspect interactive EDA and regularized models:
   ```bash
   jupyter lab training/smart_city_analysis.ipynb
   ```

---

## 🔒 Security & Privacy Guarantees

CivicPulse Sight strictly enforces data safety policies in its root [`.gitignore`](file:///.gitignore):
- **Dependencies:** All `node_modules/` and build outputs are strictly barred from version control.
- **Credentials & Keys:** Private keys (`*.pem`, `*.key`, `*.pfx`, `*.p12`, `*.p8`, `*.keystore`, `id_rsa*`, `id_ed25519*`), service accounts (`service_account*.json`), secrets (`secrets.json`, `token.json`), and local environment configs (`.env*`) are completely ignored.
- **No Private Data Leakage:** All spatial benchmarks utilize public datasets or sanitized synthetic research records.

---

## 📜 Intellectual Property & Licenses

- **Core Application:** Released under the [MIT License](LICENSE).
- **Geospatial Tiles:** Powered by CesiumJS, OpenStreetMap, and public-domain cartography.
- **Author & Signature:** Built with precision by the **CivicPulse Sight** Team.
