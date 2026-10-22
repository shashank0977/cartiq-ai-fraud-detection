from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# FIX: Absolute path - Render lo work avvadaniki
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load ML models with correct path
model = joblib.load(os.path.join(BASE_DIR, "fraud_transfer_model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "CartIQ ML API Running", "model": "Hybrid Fraud Detection"})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    # Prepare features for ML model
    features = pd.DataFrame([{
        "coupons_used": data.get("coupons_used", 0),
        "repeated_coupon": data.get("repeated_coupon", 0),
        "cart_items": data.get("cart_items", 0),
        "removed_after_coupon": data.get("removed_after_coupon", 0),
        "coupon_speed": data.get("coupon_speed", 0),
        "account_deleted": data.get("account_deleted", 0),
        "total_discount": data.get("total_discount", 0)
    }])

    # ML Prediction - base risk from Random Forest
    scaled = scaler.transform(features)
    prob = model.predict_proba(scaled)[0][1]
    ml_risk = int(prob * 60)  # 60% weight to ML

    # Rule Engine - business logic 40%
    rule_risk = 0
    rule_risk += data.get("coupons_used", 0) * 5
    rule_risk += data.get("repeated_coupon", 0) * 15
    rule_risk += data.get("removed_after_coupon", 0) * 20
    if data.get("cart_items", 0) >= 4:
        rule_risk += 5
    if data.get("total_discount", 0) >= 50:
        rule_risk += 10

    # Final hybrid risk
    risk = min(ml_risk + rule_risk, 100)

    # Generate events
    events = []
    if data.get("coupons_used", 0) >= 1:
        events.append({"type": "Coupon Usage Detected", "severity": "LOW", "confidence": risk})
    if data.get("coupons_used", 0) >= 2:
        events.append({"type": "Coupon Stacking - Potential Abuse", "severity": "HIGH", "confidence": risk})
    if data.get("removed_after_coupon", 0) == 1:
        events.append({"type": "Cart Manipulation After Coupon", "severity": "CRITICAL", "confidence": risk})
    if data.get("repeated_coupon", 0) == 1:
        events.append({"type": "Repeated Coupon Reuse", "severity": "MEDIUM", "confidence": risk})

    return jsonify({
        "risk_score": risk,
        "ml_probability": float(prob),
        "ml_contribution": ml_risk,
        "rule_contribution": rule_risk,
        "events": events,
        "is_fraud": risk >= 70,
        "blocked": risk >= 80
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
