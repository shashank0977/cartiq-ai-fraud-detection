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

    // Count duplicates properly
    const save10Count = selectedSession.coupons.filter(c => c === "SAVE10").length;
    const vipCount = selectedSession.coupons.filter(c => c === "VIP50").length;
    const summerCount = selectedSession.coupons.filter(c => c === "SUMMER20").length;

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
    
    // Only update if changed to avoid loop
    if (selectedSession.risk !== risk || selectedSession.status !== status) {
      setSessions(prev => prev.map(s => s.id === selectedSession.id ? updated : s));
    }
  }, [selectedSession?.coupons, selectedSession?.removedAfterCoupon, selectedId]);

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

        <div className="mt-4 text-sm">
          <p>Coupons: {selectedSession?.coupons.join(", ") || "None"} (Count: {selectedSession?.coupons.length})</p>
        </div>
      </div>
    </div>
  );
}

export default App;
