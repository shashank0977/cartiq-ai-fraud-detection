from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)

model = joblib.load("fraud_transfer_model.pkl")
scaler = joblib.load("scaler.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    features = pd.DataFrame([{
    "coupons_used": data["coupons_used"],
    "repeated_coupon": data["repeated_coupon"],
    "cart_items": data["cart_items"],
    "removed_after_coupon": data["removed_after_coupon"],
    "coupon_speed": data["coupon_speed"],
    "account_deleted": data["account_deleted"],
    "total_discount": data["total_discount"]
    }])

    scaled = scaler.transform(features)
    prob = model.predict_proba(scaled)[0][1]

    risk = int(prob * 18)

    risk += data["coupons_used"] * 5
    risk += data["repeated_coupon"] * 10
    risk += data["removed_after_coupon"] * 16

    if data["cart_items"] >= 4:
        risk += 4

    if data["total_discount"] >= 50:
        risk += 8

    risk = min(risk, 100)

    events = []

    if data["coupons_used"] >= 1:
        events.append({
            "type": "Promo Event Captured",
            "severity": "LOW",
            "confidence": risk,
            "time": "LIVE"
        })

    if data["coupons_used"] >= 2:
        events.append({
            "type": "Coupon Stacking Pattern Detected",
            "severity": "HIGH",
            "confidence": risk,
            "time": "LIVE"
        })

    if data["removed_after_coupon"] == 1:
        events.append({
            "type": "Cart Manipulation After Coupon Trigger",
            "severity": "CRITICAL",
            "confidence": risk,
            "time": "LIVE"
        })

    if data["repeated_coupon"] == 1:
        events.append({
            "type": "Repeated Promo Reuse Attempt",
            "severity": "MEDIUM",
            "confidence": risk,
            "time": "LIVE"
        })

    return jsonify({
        "events": events,
        "risk": risk,
        "blocked": risk >= 80
    })

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)