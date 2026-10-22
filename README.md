# CartIQ AI - Hybrid E-commerce Fraud Detection

Full-stack fraud detection for coupon abuse & cart manipulation.

**How it works (100% Real):**
1. React frontend sends cart behavior (7 features)
2. Node backend forwards to Flask ML API
3. ML API: Random Forest (fraud_transfer_model.pkl) gives fraud probability (60% weight)
4. Rule Engine adds business logic (40% weight) - coupon stacking, cart manipulation
5. Returns hybrid risk score 0-100 + fraud events

**Tech Stack:**
Frontend: React, Vite, Tailwind, Socket.IO Client
Backend: Node.js, Express, Socket.IO
ML API: Python, Flask, Scikit-learn (Random Forest), Pandas

**Model Features:** coupons_used, repeated_coupon, cart_items, removed_after_coupon, coupon_speed, account_deleted, total_discount
Run Local:
- frontend: npm install && npm run dev
- backend: npm install && npm start
- ml: pip install -r requirements.txt && python ml_api.py
