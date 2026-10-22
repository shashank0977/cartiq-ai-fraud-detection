import { useState, useEffect } from "react";
import CartPanel from "./components/CartPanel";

function App() {
  const [sessions, setSessions] = useState([
    { id: "sess_001", cart: [], coupons: [], status: "ACTIVE", removedAfterCoupon: false, risk: 0, logs: [] }
  ]);
  const [selectedId, setSelectedId] = useState("sess_001");
  const selectedSession = sessions.find(s => s.id === selectedId);

  const updateSession = (newSession) => {
    setSessions(prev => prev.map(s => s.id === newSession.id ? newSession : s));
  };

  useEffect(() => {
    if (!selectedSession) return;
    
    let risk = 0;
    let logs = [];
    const count = selectedSession.coupons.length;
    const save10Count = selectedSession.coupons.filter(c => c === "SAVE10").length;

    if (count >= 1) {
      risk += 35;
      logs.push({ msg: `Coupon stacking detected: ${count} coupons`, level: "MEDIUM" });
    }
    if (count >= 2) {
      risk += 35;
      logs.push({ msg: `Multiple coupons abused: ${selectedSession.coupons.join(", ")}`, level: "HIGH" });
    }
    if (count >= 3) {
      risk += 40;
      logs.push({ msg: `CRITICAL: ${count}x coupon abuse - Discount farming!`, level: "CRITICAL" });
    }
    if (save10Count > 1) {
      risk += 20;
      logs.push({ msg: `Same coupon SAVE10 used ${save10Count} times`, level: "HIGH" });
    }
    if (selectedSession.removedAfterCoupon) {
      risk += 25;
      logs.push({ msg: "Cart manipulation after coupon", level: "MEDIUM" });
    }

    if (risk > 100) risk = 100;
    
    let status = "ACTIVE";
    if (risk >= 75) status = "BLOCKED";
    else if (risk >= 50) status = "FLAGGED";

    const updated = { ...selectedSession, risk, status, logs };
    
    if (selectedSession.risk !== risk || selectedSession.status !== status || selectedSession.logs.length !== logs.length) {
      setSessions(prev => prev.map(s => s.id === selectedSession.id ? updated : s));
    }
  }, [selectedSession?.coupons, selectedSession?.removedAfterCoupon, selectedId]);

  let discountPercent = 0;
  selectedSession?.coupons.forEach(code => {
    if (code === "SAVE10") discountPercent += 10;
    if (code === "VIP50") discountPercent += 50;
    if (code === "SUMMER20") discountPercent += 20;
  });
  if (discountPercent > 80) discountPercent = 80;

  return (
    <div className="flex h-screen">
      <div className="w-1/2 overflow-hidden">
        {selectedSession && <CartPanel session={selectedSession} updateSession={updateSession} />}
      </div>
      <div className="w-1/2 bg-slate-900 text-white p-6 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-4">🛡️ CartIQ Security Dashboard</h2>
        
        <div className="bg-slate-800 p-4 rounded-xl mb-4">
          <p>Risk Score</p>
          <div className="w-full bg-gray-700 h-6 rounded">
            <div className={`h-6 rounded ${selectedSession?.risk >= 75 ? 'bg-red-500' : selectedSession?.risk >= 50 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{width: `${selectedSession?.risk || 0}%`}}></div>
          </div>
          <p className="text-4xl font-bold mt-2">{selectedSession?.risk || 0}% - {selectedSession?.status}</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl">
          <h3 className="font-bold mb-2">Live Threat Activity</h3>
          {selectedSession?.logs?.length === 0 ? <p>No threats</p> : selectedSession?.logs?.map((log, i) => (
            <div key={i} className={`p-2 mb-2 rounded ${log.level === 'CRITICAL' ? 'bg-red-900' : log.level === 'HIGH' ? 'bg-orange-900' : 'bg-yellow-900'}`}>
              [{log.level}] {log.msg}
            </div>
          ))}
        </div>

        <div className="bg-slate-800 p-4 rounded-xl mt-4 border border-cyan-500/30">
          <h3 className="font-bold text-cyan-400 mb-2">🤖 CartIQ AI Decision Engine</h3>
          {selectedSession?.risk < 30 && (
            <div className="text-green-300">
              <p className="font-bold">✅ Transaction Allowed</p>
              <p className="text-sm mt-1 text-slate-300">No fraud detected. Normal shopping. Proceed to checkout.</p>
            </div>
          )}
          {selectedSession?.risk >= 30 && selectedSession?.risk < 60 && (
            <div className="text-yellow-300">
              <p className="font-bold">⚠️ Under Monitoring</p>
              <p className="text-sm mt-1 text-slate-300">Coupon stacking detected. System tracking. User flagged for review. AI learning pattern.</p>
            </div>
          )}
          {selectedSession?.risk >= 60 && selectedSession?.risk < 85 && (
            <div className="text-orange-300">
              <p className="font-bold">🚩 FLAGGED - Action Required</p>
              <p className="text-sm mt-1 text-slate-300">High risk! App will: 1. Block coupons 2. Require CAPTCHA 3. Notify admin. Promo abuse!</p>
            </div>
          )}
          {selectedSession?.risk >= 85 && (
            <div className="text-red-400">
              <p className="font-bold">🔴 BLOCKED - Fraud Confirmed</p>
              <p className="text-sm mt-1 text-slate-300">App Action: 1. Session AUTO-BLOCKED 2. Checkout Disabled 3. Order Cancelled 4. IP Flagged. Saved {discountPercent}% loss - Business Protected!</p>
            </div>
          )}
        </div>

        {/* OPTION 2 - IMPROVED VERSION */}
        <div className="bg-slate-800 p-4 rounded-xl mt-4 border border-slate-700">
          <h3 className="font-bold mb-3 flex items-center gap-2">📊 What CartIQ Does?</h3>
          <div className="text-sm text-slate-300 space-y-2">
            <p>✅ <b>Real-Time Fraud Detection Engine</b></p>
            <p>• Multiple coupon stacking (SAVE10 + VIP50)</p>
            <p>• Same coupon reuse (SAVE10 x 3)</p>
            <p>• Cart manipulation after coupon apply</p>
            <p>• 80%+ discount farming attempt</p>
            <p className="pt-2 text-cyan-400 font-semibold">→ Based on Risk Score, it auto-blocks session and prevents revenue loss.</p>
          </div>
        </div>

        <div className="mt-4 text-sm bg-slate-800 p-3 rounded">
          <p>Coupons: {selectedSession?.coupons.join(", ") || "None"} (Count: {selectedSession?.coupons.length})</p>
          <p>Discount: {discountPercent}% | Cart: {selectedSession?.cart.length} items</p>
        </div>
      </div>
    </div>
  );
}

export default App;
