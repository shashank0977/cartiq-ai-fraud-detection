import { useState, useEffect } from "react";
import io from "socket.io-client";
import CartPanel from "./components/CartPanel";
import DetectionPanel from "./components/DetectionPanel";

const socket = io("http://localhost:5000");

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

  // receive AI result
  useEffect(() => {
    socket.on("analysis", (data) => {
      console.log("AI RESPONSE:", data);
      setAnalysis(data);
    });

    return () => socket.off("analysis");
  }, []);

  // send cart updates
  const updateSession = (newSession) => {
    setSession(newSession);
    socket.emit("cartUpdate", newSession);
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