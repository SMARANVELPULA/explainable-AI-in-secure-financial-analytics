from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
import pandas as pd
import joblib
import xgboost as xgb

# Load trained artifacts
preprocessor = joblib.load("preprocessor.pkl")
xgb_model = xgb.Booster()
xgb_model.load_model("xgboost_model.json")
feature_names = preprocessor.get_feature_names_out()

app = FastAPI(title="SecureScan AI - XAI Engine")

# Enable CORS for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transaction(BaseModel):
    features: Dict[str, Any]

def build_dataframe(features: Dict[str, Any]) -> pd.DataFrame:
    data = features.copy()
    now = datetime.utcnow()
    data["hour"] = now.hour
    data["day_of_week"] = now.weekday()
    
    cols = ["TransactionAmt", "ProductCD", "card4", "card6", "DeviceType", "hour", "day_of_week"]
    df = pd.DataFrame([data])
    
    for c in cols:
        if c not in df:
            df[c] = 0 if c in ["TransactionAmt", "hour", "day_of_week"] else "unknown"
    
    df = df[cols]
    df["TransactionAmt"] = pd.to_numeric(df["TransactionAmt"], errors="coerce").fillna(0.0)
    return df

@app.post("/predict")
def predict_fraud(tx: Transaction):
    try:
        df = build_dataframe(tx.features)
        X = preprocessor.transform(df)
        dmatrix = xgb.DMatrix(X)

        prob = float(xgb_model.predict(dmatrix)[0])
        shap_values = xgb_model.predict(dmatrix, pred_contribs=True)[0][:-1]

        shap_dict = {feature_names[i]: float(shap_values[i]) for i in range(len(feature_names))}

        if prob >= 0.7557:
            label, risk, pred = "Fraud Detected", "High Risk", 1
        elif prob >= 0.30:
            label, risk, pred = "Manual Review", "Medium Risk", 0
        else:
            label, risk, pred = "Legitimate", "Low Risk", 0

        return {
            "fraud_probability": round(prob, 4),
            "fraud_prediction": pred,
            "risk_level": risk,
            "label": label,
            "shap_values": shap_dict
        }
    except Exception as e:
        raise HTTPException(500, str(e))