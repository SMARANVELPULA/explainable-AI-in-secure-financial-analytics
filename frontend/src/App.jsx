import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Zap, Activity, Info, ChevronRight, BrainCircuit, AlertTriangle, CheckCircle, Cpu } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const translateFeature = (name) => {
  const cleanName = name.replace("num__", "").replace("cat__", "");
  const mapping = {
    TransactionAmt: "Transaction Amount",
    ProductCD_W: "Online Service (W)",
    ProductCD_R: "Retail Store (R)",
    ProductCD_C: "Credit Product (C)",
    ProductCD_H: "Home Service (H)",
    card4_visa: "Visa Network",
    card4_mastercard: "MasterCard Network",
    card4_american_express: "AmEx Network",
    card6_credit: "Credit Card Type",
    card6_debit: "Debit Card Type",
    DeviceType_mobile: "Mobile Device Access",
    DeviceType_desktop: "Desktop Terminal",
    DeviceType_card_machine: "POS Card Machine",
    hour: "Time of Transaction",
    day_of_week: "Day of the Week"
  };
  return mapping[cleanName] || cleanName;
};

function App() {
  const [form, setForm] = useState({ TransactionAmt: "", ProductCD: "W", card4: "visa", card6: "credit", DeviceType: "desktop" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null); 
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: { ...form, TransactionAmt: parseFloat(form.TransactionAmt) || 0 } }),
      });
      const data = await res.json();
      setTimeout(() => { setResult(data); setLoading(false); }, 1000);
    } catch (err) {
      alert("Backend error: Connection failed.");
      setLoading(false);
    }
  };

  const probPercent = result ? (result.fraud_probability * 100).toFixed(2) : 0;

  // Structured Narrative Logic for Readability
  const getRefinedNarrative = (res) => {
    const sorted = Object.entries(res.shap_values).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    const probPercent = (res.fraud_probability * 100).toFixed(2);
    
    const highRisk = sorted.filter(([_, v]) => v > 0.05).slice(0, 3).map(([f]) => translateFeature(f));
    const safeguards = sorted.filter(([_, v]) => v < -0.05).slice(0, 3).map(([f]) => translateFeature(f));

    return (
      <div className="structured-narrative">
        <section className="narrative-section">
          <h5 className="section-title summary">EXECUTIVE SUMMARY</h5>
          <p>System classified as <strong>{res.label}</strong> ({res.risk_level}) with a confidence score of <strong>{probPercent}%</strong> probability.</p>
        </section>

        {highRisk.length > 0 && (
          <section className="narrative-section">
            <h5 className="section-title risk">CORE RISK INDICATORS</h5>
            <ul>
              {highRisk.map((item, i) => (
                <li key={i}><strong>{item}:</strong> Significantly deviated from behavioral baseline.</li>
              ))}
            </ul>
          </section>
        )}

        {safeguards.length > 0 && (
          <section className="narrative-section">
            <h5 className="section-title safe">MITIGATING SAFEGUARDS</h5>
            <ul>
              {safeguards.map((item, i) => (
                <li key={i}><strong>{item}:</strong> Aligned with verified legitimate patterns, lowering the risk profile.</li>
              ))}
            </ul>
          </section>
        )}

        <section className="narrative-section">
          <h5 className="section-title conclusion">CONCLUSION</h5>
          <p className="conclusion-text">
            {res.fraud_probability >= 0.30 
              ? "Irregular risk profile detected. Secondary verification is recommended for the audit team." 
              : "Behavioral metrics confirm this transaction follows normal operational parameters."}
          </p>
        </section>
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper">
      <nav className="top-nav">
        <div className="brand">
            <motion.div animate={{ rotate: loading ? 360 : 0 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                <ShieldCheck size={32} color="var(--accent)" />
            </motion.div>
            <h1>SecureScan <span className="ai-glow">AI</span></h1>
        </div>
        <div className="status-indicator">
          {loading ? <span className="analyzing-tag"><Activity size={16} className="spin" /> QUANTUM AUDIT IN PROGRESS...</span> : 
          <div className="engine-status"><div className="pulse-dot"></div> XAI Engine: <span className="online">Operational</span></div>}
        </div>
      </nav>

      <main className="main-content">
        <motion.section initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="input-panel card">
          <div className="panel-header">
            <Cpu size={20} color="var(--accent)" />
            <h3>Transaction Audit</h3>
          </div>
          <form onSubmit={submit} className="modern-form">
            <div className="form-group">
              <label>Amount (USD)</label>
              <input name="TransactionAmt" type="number" step="any" value={form.TransactionAmt} onChange={handleChange} required placeholder="Enter amount..." />
            </div>
            <div className="grid-row">
              <div className="form-group">
                <label>Product Category</label>
                <select name="ProductCD" value={form.ProductCD} onChange={handleChange}>
                  <option value="W">Online (Web)</option><option value="R">Retail (Store)</option>
                  <option value="C">Credit Line</option><option value="H">Home Services</option>
                </select>
              </div>
              <div className="form-group">
                <label>Network</label>
                <select name="card4" value={form.card4} onChange={handleChange}>
                  <option value="visa">Visa</option><option value="mastercard">MasterCard</option>
                  <option value="american express">American Express (AmEx)</option>
                </select>
              </div>
            </div>
            <div className="grid-row">
              <div className="form-group">
                <label>Card Type</label>
                <select name="card6" value={form.card6} onChange={handleChange}>
                  <option value="credit">Credit Card</option><option value="debit">Debit Card</option>
                </select>
              </div>
              <div className="form-group">
                <label>Device Source</label>
                <select name="DeviceType" value={form.DeviceType} onChange={handleChange}>
                  <option value="desktop">Desktop System</option><option value="mobile">Mobile App</option>
                  <option value="card_machine">POS Card Machine</option>
                </select>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="scan-btn" disabled={loading}>
              {loading ? "Calculating Neural Weights..." : "EXECUTE RISK AUDIT"}
            </motion.button>
          </form>
        </motion.section>

        <section className="result-panel">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                <BrainCircuit size={60} strokeWidth={1} className="floating" />
                <p>Initialize a high-fidelity scan to reveal hidden risk factors.</p>
              </motion.div>
            ) : (
              <motion.div key="res" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={`risk-banner ${result.risk_level.toLowerCase().replace(" ", "-")}`}>
                  <div className="banner-left">
                    {result.fraud_prediction === 1 ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
                    <div><span className="tiny-label">Final Verdict</span><h2>{result.label}</h2></div>
                  </div>
                  <div className="banner-right">
                    <span className="tiny-label">Risk Probability</span>
                    <h2 className="glow-text">{probPercent}%</h2>
                  </div>
                </div>

                <div className="viz-grid">
                  <div className="chart-card card">
                    <h4>Risk Probability Meter</h4>
                    <div className="gauge-container">
                        <Doughnut data={{
                            datasets: [{
                                data: [probPercent, 100 - probPercent],
                                backgroundColor: [probPercent > 70 ? "#ef4444" : probPercent > 30 ? "#f59e0b" : "#10b981", "#1e293b"],
                                borderWidth: 0, circumference: 180, rotation: 270, cutout: "85%",
                            }]
                        }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        <div className="gauge-text">
                            <span className="g-val">{probPercent}%</span>
                            <span className="g-lbl">{result.risk_level}</span>
                        </div>
                    </div>
                  </div>

                  <div className="chart-card card">
                    <h4>XAI Feature Contributions</h4>
                    <div className="bar-container">
                      <Bar data={{
                          labels: Object.entries(result.shap_values).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 6).map(e => translateFeature(e[0])),
                          datasets: [{
                              data: Object.entries(result.shap_values).sort((a,b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 6).map(e => e[1]),
                              backgroundColor: (c) => c.raw >= 0 ? "#ef4444" : "#10b981",
                              borderRadius: 8,
                          }]
                      }} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { display: false }, ticks: { color: '#f8fafc', font: { weight: 'bold' } } } } }} />
                    </div>
                  </div>
                </div>

                <div className="analysis-summary card highlight-border">
                  <div className="summary-header"><Info size={20} color="var(--accent)" /> <h4>Explainable Audit Narrative</h4></div>
                  {getRefinedNarrative(result)}
                  <div className="technical-footer">
                    <span><strong>Architecture:</strong> Explainable Gradient Boosting (XGBoost)</span>
                    <span className="badge-live">LIVE ANALYTICS ENGINE</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default App;