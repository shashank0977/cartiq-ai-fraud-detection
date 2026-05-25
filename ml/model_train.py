import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestClassifier
import joblib
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

    score = 0

    score += coupons_used * 15
    score += repeated_coupon * 20
    score += removed_after_coupon * 25
    score += (5 if cart_items >= 4 else 0)
    score += (15 if coupon_speed <= 2 else 0)
    score += account_deleted * 20
    score += int(total_discount / 5)

    score += random.randint(-10, 10)

    fraud = 1 if score >= 45 else 0

    rows.append([
        coupons_used,
        repeated_coupon,
        cart_items,
        removed_after_coupon,
        coupon_speed,
        account_deleted,
        total_discount,
        fraud
    ])

df = pd.DataFrame(rows, columns=[
    "coupons_used",
    "repeated_coupon",
    "cart_items",
    "removed_after_coupon",
    "coupon_speed",
    "account_deleted",
    "total_discount",
    "fraud"
])

X = df.drop("fraud", axis=1)
y = df["fraud"]

scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

model = RandomForestClassifier(n_estimators=300)
model.fit(X_scaled, y)

joblib.dump(model, "fraud_transfer_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("ML MODEL RETRAINED")