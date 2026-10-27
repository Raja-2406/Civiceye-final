# CIVICEYE: Crowdsourced Civic Issue Reporting and Resolution System

> **Bannari Amman Institute of Technology (Autonomous Institution Affiliated to Anna University)**  
> **Department of Computer Science and Business Systems**  
> Project Team:
> - **Arunrajan N M** (7376232CB103) - Admin Module
> - **Firzaan I** (7376232CB117) - Backend Developer
> - **Rajagopal S** (7376232CB139) - Citizen Module  
> Supervisor: **Dr. Deepa Priya B S**, Associate Professor  
> Head of Department: **Dr. Venkatesan R**, Associate Professor  

---

## 🏛️ System Overview

**CivicEye** is an AI-assisted crowdsourced civic grievance management platform connecting citizens, municipal departments, field verifiers, and city administrators into a unified digital chain of responsibility:

$$\text{Citizen} \longrightarrow \text{Department Head} \longrightarrow \text{Verifier} \longrightarrow \text{Resolution} \longrightarrow \text{Citizen Confirmation}$$

### Key Capabilities Built-in:
1. **Citizen Portal (Tracking Vault)**:
   - Geotagged issue reporting with interactive Leaflet map, draggable marker, GPS accuracy sampling, and address reverse geocoding.
   - **Intelligent Duplicate Detection**: Real-time 500m radius buffer scan with semantic text cosine similarity and live duplicate alert modal.
   - **Complaint Tracking Vault**: Lifecycle progress stepper (`SUBMITTED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`) with unique `#CMP` tracking identifiers.
   - **Resolution Confirmation**: Citizen inspects resolved grievance, provides 1–5 star rating with feedback, and closes case.
   - **Identity Node**: Phone OTP verification simulation to eliminate spam reports.

2. **Department Head Command Center**:
   - Departmental scope isolation (Roads & Infrastructure, Streetlights & Electricity, Waste Management & Sanitation, Water Supply, Public Safety & Other Civic Hazards).
   - 8 KPI cards: Total, Unassigned, Critical, High Priority, Due Soon, SLA Breached, Resolved, Escalated.
   - 3 Queue Tabs: All Complaints, Unassigned Queue, Assigned Queue.
   - Operations Matrix with quick Verifier Assignment / Reassignment modal.

3. **Field Verifier Portal**:
   - Field officer task queue restricted to assigned complaints.
   - On-site inspection logging with status progression (`IN_PROGRESS` / `RESOLVED`), notes, and proof image upload.

4. **Super Administrator & Municipal Analytics**:
   - City-wide incident matrix and priority reassignment privilege.
   - **AI Model Review & Manual Correction**: Inspect Google Gemini / Rule-based NLP categorization and confidence scores; re-route misclassified grievances with audit trail.
   - **Civic Analytics Dashboard**: Daily complaint volume time-series trends (Critical, Resolved, Total), top taxonomy distribution bar charts, and department SLA compliance matrix.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Connection String (or local MongoDB / in-memory auto-fallback)

### 1. Installation
The project dependencies are already installed. If running on a new machine:
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Configure Environment (`server/.env`)
Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/civiceye?retryWrites=true&w=majority
JWT_SECRET=civiceye_jwt_secret_token_key_2026_secured
GEMINI_API_KEY=your_gemini_api_key_here
AUTO_SEED=true
```
*(Note: If no MongoDB Atlas URI is provided, the server automatically starts an in-memory MongoDB database so you can test the system immediately with zero configuration!)*

### 3. Start the Application

**Option A: Start Backend and Frontend in separate terminals**
```bash
# Terminal 1 - Backend REST API
cd server
npm run dev

# Terminal 2 - Frontend UI
cd client
npm run dev
```

Visit the frontend at: **`http://localhost:5173`**  
REST API available at: **`http://localhost:5000/api`**

---

## 👥 Demo Evaluation Accounts

You can switch between any of these roles with **one click** using the **"Switch Role"** menu in the header, or log in with these credentials:

| Role | Name | Email | Password | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Demo Citizen | `citizen@civiceye.gov` | `Citizen123!` | Personal Complaints & Vault |
| **Dept Head** | Er. S. Rajagopal | `roads.head@civiceye.gov` | `DeptHead123!` | Roads & Infrastructure |
| **Dept Head** | Dr. M. Arunrajan | `waste.head@civiceye.gov` | `DeptHead123!` | Waste Management & Sanitation |
| **Dept Head** | Er. I. Firzaan | `water.head@civiceye.gov` | `DeptHead123!` | Water Supply |
| **Verifier** | K. Ramanathan | `verifier.roads@civiceye.gov` | `Verifier123!` | Assigned Field Inspections |
| **Super Admin** | Commissioner Office | `admin@civiceye.gov` | `Admin123!` | City-Wide Monitoring & Oversight |

---

## 📋 Pre-Seeded Evaluation Incidents

The database includes the exact test records featured in Chapter V of the report:
- **`#CMP62745974`**: "pothole" at *Sathy – Athani – Bhavani Road, Satyamangalam* (Status: `SUBMITTED`, Priority: `HIGH`, SLA: `ON_TRACK`)
- **`#CMP62745980`**: "Major Pothole on Main Road" near *Bus Stand Junction* (Status: `ASSIGNED` to K. Ramanathan)
- **`#CMP73194821`**: "Overflowing Community Dustbin near Bazaar" (Status: `IN_PROGRESS`)
- **`#CMP88203114`**: "Drinking Water Pipeline Burst on North Street" (Status: `RESOLVED`)
- **`#CMP91048239`**: "Four consecutive streetlights unlit near BIT College Gate" (Status: `CLOSED` with 5-star citizen confirmation)

---

## 📡 REST API Architecture

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | Public | Citizen registration |
| `/api/auth/login` | POST | Public | User login & JWT issuance |
| `/api/auth/otp/send` | POST | Public | 6-Digit SMS OTP generator |
| `/api/auth/otp/verify` | POST | Public | Verifies citizen phone identity |
| `/api/complaints/check-duplicate` | POST | Public | Real-time 500m proximity & semantic similarity check |
| `/api/complaints/classify-preview` | POST | Public | AI/NLP classification recommendation |
| `/api/complaints` | POST | Citizen | Submit grievance with geotag & evidence |
| `/api/complaints/my` | GET | Citizen | Retrieve citizen's own complaints |
| `/api/complaints/track/:trackingId` | GET | Public | Public lifecycle tracking by `#CMP...` |
| `/api/complaints/:id/confirm-resolution` | POST | Citizen | Confirm resolution & rate service |
| `/api/department/queue` | GET | Dept Head | Departmental operations matrix & KPIs |
| `/api/department/staff` | GET | Dept Head | List department verifiers |
| `/api/department/assign-verifier` | POST | Dept Head | Assign / reassign verifier |
| `/api/department/status/:id` | PATCH | Dept Head | Update complaint status |
| `/api/verifier/assigned` | GET | Verifier | Tasks assigned to logged-in verifier |
| `/api/verifier/inspect/:id` | POST | Verifier | Record inspection findings & resolution proof |
| `/api/admin/metrics` | GET | Admin / Head | City-wide performance metrics |
| `/api/admin/complaints` | GET | Admin | City-wide grievance master list |
| `/api/admin/analytics` | GET | Admin / Head | Time-series trend & workload matrix |
| `/api/admin/reassign-priority/:id` | PATCH | Admin | Super admin priority override |
| `/api/admin/correct-category/:id` | PATCH | Admin | AI classification review & re-routing |
