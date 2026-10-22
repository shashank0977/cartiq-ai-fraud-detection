import sys
import json
import joblib
import numpy as np
import os

# FIX: Absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "fraud_transfer_model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

data = json.loads(sys.argv[1])

features = np.array([[
    data["coupons_used"],
    data["repeated_coupon"],
    data["cart_items"],
    data["removed_after_coupon"],
    data["coupon_speed"],
    data["account_deleted"],
    data["total_discount"]
]])

scaled = scaler.transform(features)

prediction = model.predict(scaled)[0]
prob = model.predict_proba(scaled)[0][1]

risk = int(prob * 35)

# behavioral live boosters
risk += data["coupons_used"] * 8
risk += data["repeated_coupon"] * 12
risk += data["removed_after_coupon"] * 18

if data["cart_items"] >= 4:
    risk += 5

if data["total_discount"] >= 50:
    risk += 10

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

if data["cart_items"] >= 4:
    events.append({
        "type": "Bulk Cart Pattern Under Observation",
        "severity": "LOW",
        "confidence": risk,
        "time": "LIVE"
    })

print(json.dumps({
    "events": events,
    "risk": risk,
    "blocked": risk >= 80
}))
