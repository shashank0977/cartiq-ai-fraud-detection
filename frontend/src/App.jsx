import { useState } from "react";
import CartPanel from "./components/CartPanel";
import DetectionPanel from "./components/DetectionPanel";

const ML_API = "https://cartiq-ml-api.onrender.com";

export default function App() {
  const [session, setSession] = useState({
    id: "normal_user_001",
    status: "active",
    cart: [],
    coupons: [],
    removedAfterCoupon: false
  });

  const [analysis, setAnalysis] = useState({
    events: [],
    risk: 0,
    blocked: false
  });

  const updateSession = async (newSession) => {
    setSession(newSession);

    // LOCAL FALLBACK LOGIC - Demo never fails
    let risk = 0;
    let events = [];

    if (newSession.coupons?.length > 1) {
      risk += 35;
      events.push({ type: "Coupon Stacking Abuse", severity: "HIGH", confidence: 75, time: new Date().toLocaleTimeString() });
    }
    if (newSession.removedAfterCoupon) {
      risk += 30;
      events.push({ type: "Cart Remove Exploit", severity: "CRITICAL", confidence: 85, time: new Date().toLocaleTimeString() });
    }
    if (newSession.coupons?.length >= 1 && newSession.cart?.length === 0) {
      risk += 20;
      events.push({ type: "Ghost Promo Abuse", severity: "MEDIUM", confidence: 60, time: new Date().toLocaleTimeString() });
    }
    if (newSession.coupons?.length > 0) {
      risk += 10;
    }

    // Try ML API also
    try {
      const res = await fetch(`${ML_API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupons_used: newSession.coupons?.length || 0,
          cart_items: newSession.cart?.length || 0,
          removed_after_coupon: newSession.removedAfterCoupon ? 1 : 0,
        })
      });
      const mlData = await res.json();
      if (mlData.risk) risk = mlData.risk;
      if (mlData.events?.length) events = mlData.events;
      console.log("ML API:", mlData);
    } catch (e) {
      console.log("Using local logic, ML API sleeping");
    }

    setAnalysis({
      events,
      risk: Math.min(risk, 95),
      blocked: risk >= 75
    });
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <div className="w-1/2 border-r border-slate-700">
        <CartPanel session={session} updateSession={updateSession} />
      </div>
      <div className="w-1/2">
        <DetectionPanel analysis={analysis} />
      </div>
    </div>
  );
}
