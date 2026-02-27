🛡️ SecureScan AI — Explainable Fraud Detection
-----------------------------------------------


📌 Overview
------------
SecureScan AI is a high-fidelity fraud detection dashboard that uses Explainable Artificial Intelligence (XAI) to bridge the gap between complex machine learning predictions and human understanding.

Instead of just telling whether a transaction is fraud, the system explains why it is fraud.

By integrating XGBoost with SHAP (SHapley Additive exPlanations), the platform produces interpretable AI decisions that analysts, banks, and compliance teams can trust.

🚀 Key Features
----------------

Real-time Risk Audit

Instantly evaluates transactions

Displays fraud probability meter

Provides a clear verdict banner (Safe / Suspicious / Fraud)

🧠 Explainable Narratives
--------------------------

Converts ML reasoning into human-readable explanations

Example:

“Transaction amount deviated significantly from user's normal spending pattern.”

📊 SHAP Visualizations
-----------------------

Interactive feature contribution graphs

Shows mathematical push & pull behind predictions

Analysts can see which factor caused the fraud flag

🧩 Modern XAI Architecture
---------------------------

FastAPI Python backend

React + Vite frontend dashboard

End-to-end explainable ML pipeline

🌙 Responsive Dark-Mode UI

Micro-animations

Optimized for large screens & dashboards

🛠️ Tech Stack

-------------
Backend
-------

🐍 Python

⚡ FastAPI

🌲 XGBoost (Fraud Classification)

🔎 SHAP (Explainable AI)

📦 Joblib

🐼 Pandas

🧪 Scikit-Learn Pipeline

Frontend
---------
⚛️ React (Vite)

🎞️ Framer Motion

📈 Chart.js

🎨 Lucide React Icons

🌑 Dark UI Dashboard

🏗️ System Architecture
-----------------------
The system follows a 4-stage intelligent pipeline:

Input

User enters transaction details
(Amount, Time, Network, Device, Location, Merchant)

Processing

FastAPI cleans and transforms data

Scikit-Learn preprocessing pipeline applied

Inference

XGBoost predicts fraud probability

Explanation

SHAP calculates feature contribution

React dashboard visualizes reasoning

📥 Installation
1️⃣ Clone Repository
git clone (https://github.com/SMARANVELPULA/explainable-AI-in-secure-financial-analytics)
cd securescan-ai
2️⃣ Backend Setup
cd backend
pip install -r requirements.txt
uvicorn app:app --reload

Backend will run at:

http://127.0.0.1:8000
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

Frontend will run at:

http://localhost:5173
📊 How the Model Makes Decisions

SecureScan AI does not behave like a black-box model.

For every transaction, SHAP computes the contribution score of each feature:

Feature	Effect
High Transaction Amount	Increases fraud probability
Known Device	Decreases fraud probability
New Location	Increases fraud probability
Frequent Merchant	Decreases fraud probability

The dashboard visualizes this using bar graphs and explanation reports.

🎯 Use Cases

Banking & FinTech fraud monitoring

Payment gateway transaction auditing

Compliance & regulatory analytics

Cybersecurity risk analysis

Explainable AI research demonstrations

👤 Author
----------
**Smaran Velpula
Computer Science Engineering (Data Science)
Ace Engineering College**

💻 Web Development

📊 Data Analytics

🤖 Machine Learning & Explainable AI


⭐ Support

If you found this project useful:

Star ⭐ the repository

Share with friends

Use it in research / college projects
