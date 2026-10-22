from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# AUTO-TRAIN if pkl files missing - Render fix
def load_or_train():
    pkl_path = os.path.join(BASE_DIR, "fraud_transfer_model.pkl")
    scaler_path = os.path.join(BASE_DIR, "scaler.pkl")
    
    if not os.path.exists(pkl_path) or not os.path.exists(scaler_path):
        print("Models not found, training...")
        import numpy as np
        from sklearn.preprocessing import MinMaxScaler
        from sklearn.ensemble import RandomForestClassifier
        import random
        rows = []
        for i in range(7000):
            coupons_used = np.random.randint(0, 4)
            repeated_coupon = np.random.randint(0, 2)
            cart_items = np.random.randint(1, 8)
            removed_after_coupon = np.random.randint(0, 2)
            coupon_speed = np.random.randint(1, 10)
            account_deleted = np.random.randint(0, 2)
            total_discount = coupons_used * np.random.randint(5, 30)
            score = coupons_used*15 + repeated_coupon*20 + removed_after_coupon*25 + (5 if cart_items>=4 else 0) + (15 if coupon_speed<=2 else 0) + account_deleted*20 + int(total_discount/5) + random.randint(-10,10)
            fraud = 1 if score >=45 else 0
            rows.append([coupons_used, repeated_coupon, cart_items, removed_after_coupon, coupon_speed, account_deleted, total_discount, fraud])
        df = pd.DataFrame(rows, columns=["coupons_used","repeated_coupon","cart_items","removed_after_coupon","coupon_speed","account_deleted","total_discount","fraud"])
        X = df.drop("fraud", axis=1)
        y = df["fraud"]
        scaler_obj = MinMaxScaler()
        X_scaled = scaler_obj.fit_transform(X)
        model_obj = RandomForestClassifier(n_estimators=300)
        model_obj.fit(X_scaled, y)
        joblib.dump(model_obj, pkl_path)
        joblib.dump(scaler_obj, scaler_path)
        print("Models trained!")
        return model_obj, scaler_obj
    else:
        return joblib.load(pkl_path), joblib.load(scaler_path)

model, scaler = load_or_train()

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "CartIQ ML API Running", "model": "Hybrid Fraud Detection"})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    features = pd.DataFrame([{
        "coupons_used": data.get("coupons_used", 0),
        "repeated_coupon": data.get("repeated_coupon", 0),
        "cart_items": data.get("cart_items", 0),
        "removed_after_coupon": data.get("removed_after_coupon", 0),
        "coupon_speed": data.get("coupon_speed", 0),
        "account_deleted": data.get("account_deleted", 0),
        "total_discount": data.get("total_discount", 0)
    }])
    scaled = scaler.transform(features)
    prob = model.predict_proba(scaled)[0][1]
    ml_risk = int(prob * 60)
    rule_risk = 0
    rule_risk += data.get("coupons_used", 0) * 5
    rule_risk += data.get("repeated_coupon", 0) * 15
    rule_risk += data.get("removed_after_coupon", 0) * 20
    if data.get("cart_items", 0) >= 4:
        rule_risk += 5
    if data.get("total_discount", 0) >= 50:
        rule_risk += 10
    risk = min(ml_risk + rule_risk, 100)
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
