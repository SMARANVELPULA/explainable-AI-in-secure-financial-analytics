import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import "./App.css";

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale
);

const FEATURE_INFO = {
  TransactionAmt: { label: "Transaction Amount", description: "Higher amounts often deviate from standard spending behavior." },
  ProductCD: { label: "Product Type", description: "Certain categories (Online, Retail, etc.) have distinct risk profiles." },
  card4: { label: "Card Network", description: "Fraud patterns vary across networks like Visa or MasterCard." },
  card6: { label: "Card Type", description: "Credit cards are historically more prone to fraud than debit cards." },
  DeviceType: { label: "Device Used", description: "Mobile vs Desktop sessions indicate different security levels." },
};

function App() {
  const [form, setForm] = useState({
    TransactionAmt: "",
    ProductCD: "W",
    card4: "visa",
    card6: "credit",
    DeviceType: "desktop",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const generateNarrative = (res) => {
    if (!res || !res.shap_values) return "";
    const entries = Object.entries(res.shap_values).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    const topRisks = entries.filter(([_, v]) => v > 0).slice(0, 2);
    const topSafeguards = entries.filter(([_, v]) => v < 0).slice(0, 2);

    let text = `The AI model has determined this transaction is ${res.label} with a ${(res.fraud_probability * 100).toFixed(2)}% probability. `;
    if (topRisks.length > 0) {
      text += `Key indicators of concern include ${topRisks.map(([f]) => FEATURE_INFO[f]?.label || f).join(" and ")}, which significantly increased the risk profile. `;
    }
    if (topSafeguards.length > 0) {
      text += `Conversely, the transaction's ${topSafeguards.map(([f]) => FEATURE_INFO[f]?.label || f).join(" and ")} acted as mitigating factors.`;
    }
    return text;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Ensure we send a valid float to the FastAPI backend
    const floatAmount = parseFloat(form.TransactionAmt);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: { 
            ...form, 
            TransactionAmt: isNaN(floatAmount) ? 0.0 : floatAmount 
          },
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Backend error: Ensure your FastAPI server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const probPercent = result ? (result.fraud_probability * 100).toFixed(2) : 0;
  const probData = result && {
    labels: ["Fraud Risk", "Safe"],
    datasets: [{ data: [probPercent, 100 - probPercent], backgroundColor: ["#ef4444", "#10b981"], borderWidth: 0 }],
  };

  const shapEntries = result?.shap_values && Object.entries(result.shap_values)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 6);

  const shapData = shapEntries && {
    labels: shapEntries.map(([f]) => FEATURE_INFO[f]?.label || f),
    datasets: [{ data: shapEntries.map(([, v]) => v), backgroundColor: shapEntries.map(([, v]) => v >= 0 ? "#ef4444" : "#10b981"), borderRadius: 5 }],
  };

  return (
    <div className="dashboard-wrapper">
      <nav className="top-nav">
        <div className="brand">🛡️ <h1>SecureScan AI</h1></div>
        <div className="status-indicator">XAI Engine: <span className="online">Operational</span></div>
      </nav>

      <main className="main-content">
        <section className="input-panel card">
          <div className="panel-header">
            <h3>Transaction Audit Entry</h3>
            <p>Input data for real-time SHAP analysis.</p>
          </div>
          
          <form onSubmit={submit} className="modern-form">
            <div className="form-group">
              <label>Amount (USD)</label>
              {/* FIXED: step="any" allows float/decimal values */}
              <input 
                name="TransactionAmt" 
                type="number" 
                step="any" 
                placeholder="e.g. 499.50" 
                value={form.TransactionAmt}
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="grid-row">
              <div className="form-group">
                <label>Product CD</label>
                <select name="ProductCD" value={form.ProductCD} onChange={handleChange}>
                  <option value="W">Online (W)</option>
                  <option value="R">Retail (R)</option>
                  <option value="C">Credit (C)</option>
                  <option value="H">Home (H)</option> 
                  <option value="S">Service (S)</option> 
                </select>
              </div>
              <div className="form-group">
                <label>Card Network</label>
                <select name="card4" value={form.card4} onChange={handleChange}>
                  <option value="visa">Visa</option>
                  <option value="mastercard">MasterCard</option>
                  <option value="american express">Amex</option>
                </select>
              </div>
            </div>
            <div className="grid-row">
              <div className="form-group">
                <label>Type</label>
                <select name="card6" value={form.card6} onChange={handleChange}>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
              <div className="form-group">
                <label>Device</label>
                <select name="DeviceType" value={form.DeviceType} onChange={handleChange}>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>
            <button type="submit" className="scan-btn" disabled={loading}>
              {loading ? "Analyzing..." : "Execute Risk Audit"}
            </button>
          </form>
        </section>

        <section className="result-panel">
          {!result ? (
            <div className="empty-state">
              <p>Initialize a scan to view explainable results</p>
            </div>
          ) : (
            <div className="fade-in">
              <div className={`risk-banner ${result.risk_level.toLowerCase().replace(" ", "-")}`}>
                <div><span className="tiny-label">AI Status</span><h2>{result.label}</h2></div>
                <div style={{textAlign: 'right'}}><span className="tiny-label">Confidence</span><h2>{probPercent}%</h2></div>
              </div>

              <div className="viz-grid">
                <div className="chart-card card">
                  <h4>Risk Probability</h4>
                  <div className="donut-container">
                    <Doughnut data={probData} options={{ cutout: "75%", plugins: { legend: { display: false } } }} />
                  </div>
                </div>
                <div className="chart-card card">
                  <h4>Feature Contribution (SHAP)</h4>
                  <Bar data={shapData} options={{ indexAxis: "y", plugins: { legend: { display: false } } }} />
                </div>
              </div>

              <div className="analysis-summary card fade-in">
                <div className="summary-header">📝 <h4>Automated Audit Narrative</h4></div>
                <div className="narrative-content">
                  <p className="narrative-text">{generateNarrative(result)}</p>
                  <div className="technical-footer">
                    <span><strong>Architecture:</strong> Explainable XGBoost</span>
                    <span><strong>Explainability Layer:</strong> SHAP Values</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;