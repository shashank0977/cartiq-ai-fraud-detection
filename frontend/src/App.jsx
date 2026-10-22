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
    
    // Direct call to ML API
    try {
      const payload = {
        coupons_used: newSession.coupons?.length || 0,
        repeated_coupon: 0, // logic add
        cart_items: newSession.cart?.length || 0,
        removed_after_coupon: newSession.removedAfterCoupon ? 1 : 0,
        coupon_speed: 1,
        account_deleted: 0,
        total_discount: 60
      };
      
      const res = await fetch(`${ML_API}/predict`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log("AI RESPONSE:", data);
      setAnalysis(data);
    } catch(e) {
      console.log("API Error:", e);
    }
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
