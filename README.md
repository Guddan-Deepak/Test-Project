<div align="center">

# 🛡️ S.H.I.E.L.D
**Security Heuristic Intelligence & Event Logging Dashboard**


<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" />
</p>

<h3>Advanced SOC-style platform for Security Analysis, Threat Simulation, and Real-time Monitoring.</h3>


</div>

## � Project Overview

**S.H.I.E.L.D**  is a lightweight yet powerful platform designed to bridge the gap between theoretical cybersecurity knowledge and practical application.

It simulates a realistic SOC (Security Operations Center) environment where users can:
1.  **Attack**: Launch simulated cyber-attacks (SQLi, XSS, Brute-force).
2.  **Monitor**: Watch the attacks be detected in real-time.
3.  **Analyze**: Investigate incidents using an AI-powered Chatbot.
4.  **Defend**: Implement blocks and countermeasures.

> **Team Diamonds**: Built with ❤️ for developers, students, and security enthusiasts.

---


📝 Problem Statement (PS Number 6)

The Morphin Grid is under attack by the Cyber Kaiju, which floods the system with rapid, mutating intrusions. The old security modules are failing, allowing suspicious activities to slip past and rogue packets to penetrate the weak firewall, leaving the team without a single, centralized place to monitor incidents.
The project objective is to design and implement a mini Security Operations Center system (the MicroSOC Command Center) that can:

-Simulate real-time cyber attacks.

-Process and categorize threats.

-Allow analysts to view incidents.

-Provide essential, actionable dashboards.


## ⚡ Tech Stack

*   **Backend**: Node.js, Express.js (High-performance REST API)
*   **Database**: MongoDB (Scalable document storage for logs)
*   **Real-time**: Socket.io (Bi-directional low-latency communication)
*   **Frontend**: React + Vite (Fast, modern UI), Tailwind CSS (Premium styling)
*   **AI Engine**: Google Gemini Pro (Generative AI for threat analysis)



## 😎 System Architecture / High-level design
The following diagrams illustrate the core data flow of the S.H.I.E.L.D ecosystem.
<img width="1227" height="788" alt="image" src="https://github.com/user-attachments/assets/fa66a8fb-b29a-49f3-a3de-b826ef29f215" />
<img width="1227" height="788" alt="image" src="https://github.com/user-attachments/assets/6d901016-87fb-4214-a50a-b804e4556769" />
<img width="1227" height="788" alt="image" src="https://github.com/user-attachments/assets/9cca97e6-77af-45f4-943f-ceb098b85483" />


## � API Documentation

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/v1/auth/login` | `POST` | Authenticate Analyst/Admin |
| `/api/v1/logs` | `GET` | Fetch filtered security logs |
| `/api/v1/incidents` | `GET` | Retrieve active incidents |
| `/api/v1/chat` | `POST` | **RAG Agent**: Ask AI about threats |
| `/api/v1/admin/blocklist` | `POST` | Block a malicious IP address |



## 🚀 Features

# Mini Security Operations Center (Mini-SOC)

This project simulates a real-world Security Operations Center (SOC) environment through continuous monitoring, automated threat processing, and incident lifecycle management.

## 🚀 Features Implemented

### 1. 🔐 Authentication & Access Control
**Feature:** Secure Login with Role-Based Access Control (RBAC)  
**Technical Implementation:**
- **Authentication:** Users authenticate via username/password login. The system leverages JSON Web Tokens (JWT) for session management.
- **Authorization (RBAC):** JWT payload contains the user's role: Admin or Analyst.
  - **Admins:** Elevated permissions, including access to configuration endpoints and IP blocking.
  - **Analysts:** Restricted to viewing dashboards, logs, and managing incident status.
- **Implementation:** Middleware in the Express.js backend validates the JWT and checks the role before granting access to protected routes (e.g., `/api/v1/admin/blocklist`).

---

### 2. 📝 Log Ingestion & Storage
**Feature:** Continuous, real-time ingestion and structured storage of security logs.  
**Technical Implementation:**
- **Ingestion Endpoint:** Node.js/Express server exposes a high-throughput POST endpoint for logs from the external Log Generator.
- **Data Structure:** Logs are stored in MongoDB with a strict schema:
  - `timestamp`
  - `attackType` (e.g., SQLi, XSS, Brute-Force)
  - `sourceIp`
  - `targetSystem`
  - `rawLogContent`
- **Real-time Push:** Socket.io broadcasts newly ingested logs to connected Analyst and Admin clients for near-zero-latency dashboard updates.

---

### 3. 🧠 Threat Classification Engine
**Feature:** Rule-driven analysis to identify and escalate threat patterns.  
**Technical Implementation:**
- **Processing Pipeline:** Asynchronous Worker Thread analyzes logs after ingestion.
- **Rule-Set Logic:** Example – Brute-Force Detection:
  - On a `failed_login` event, the system counts similar events from the same `sourceIp` within the last `N` seconds.
  - If the count exceeds threshold `T` (e.g., 5 failures in 60 seconds), the log is marked high-severity and an incident is created.
- **Efficiency:** Focuses on log metadata for fast, heuristic-based threat identification.

---

### 4. 🚨 Incident Management & Lifecycle
**Feature:** Automated conversion of threats into trackable incidents.  
**Technical Implementation:**
- **Incident Creation:** Aggregates related logs into a new MongoDB incident document.
- **Workflow Tracking:** Each incident has a `status` field: `Open`, `In Progress`, `Resolved`.
- **API for Management:** PATCH endpoints (e.g., `/api/v1/incidents/:id`) allow analysts to update `assignedTo` and `status`, enabling lifecycle tracking.

---

### 5. 📊 Dashboards & Visualization
**Feature:** Real-time visualization of attack trends and security posture.  
**Technical Implementation:**
- **Data Aggregation:** Backend provides fast MongoDB Aggregation Queries for:
  - **Attack Trends:** Group logs by timestamp (hour/day)
  - **Severity Distribution:** Count by severity
  - **Top Attacker IPs:** Count by `sourceIp` sorted descending
- **Frontend Rendering:** React frontend uses Chart.js or Recharts for dynamic, interactive charts and heatmaps.


## 🛠️ Setup & Installation

Follow these steps to deploy S.H.I.E.L.D locally.

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Running locally or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/shield-project.git
cd shield-project
```

### 2. Backend Configuration
```bash
cd WebApplication/Backend
npm install
```
Create a `.env` file:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/shield
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=super_secret_key
GEMINI_API_KEY=your_google_api_key
```
Start the server:
```bash
npm run dev
```

### 3. Dashboard (Frontend) Setup
```bash
cd ../Frontend
npm install
npm run dev
# Accessible at http://localhost:5173
```

### 4. Attacker Simulator Setup
```bash
cd ../../Attacker/frontend
npm install
npm run dev
# Accessible at http://localhost:5174
```

Deployment Link (if deployed)


Screenshots / GIFs of working features


Error Handling & Reliability considerations


AI/ML Integration details (if added)

Team members and responsibilities


## 🛠 Future Roadmap

- [ ] **Containerization with Docker**: Fully containerize the backend, frontend, and database to simplify deployment, ensure environment consistency, and enable easy scaling.  

- [ ] **Advanced SIEM(Security Information and Event Management) Integration**: Streamline log forwarding to platforms like Splunk or Elasticsearch for centralized monitoring, deep analytics, and historical threat correlation.  

- [ ] **Automated Threat Response**: Introduce intelligent agents capable of detecting suspicious activity and taking automated defensive actions, such as IP blocking, alert escalation, or patching vulnerabilities.  

- [ ] **Multi-Organization Support**: Enable the platform to serve multiple clients with isolated dashboards, data segregation, and customizable access control, while maintaining a shared backend infrastructure.  

- [ ] **Enhanced Analytics & Reporting**: Implement predictive analytics and detailed reporting tools to identify emerging threat patterns and generate actionable insights for security teams.  

- [ ] **Scalable Real-Time Monitoring**: Optimize the system to handle higher log volumes and support multiple concurrent dashboards with near-zero latency updates.


<div align="center">


**Built by Team Diamonds** 💎
*Security simplified. Monitoring mastered.*

</div>
