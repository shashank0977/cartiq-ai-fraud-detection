import { useState, useEffect } from "react";
import io from "socket.io-client";
import CartPanel from "./components/CartPanel";
import DetectionPanel from "./components/DetectionPanel";

// FIX: Use deployed backend URL
const BACKEND_URL = "https://cartiq-ml-api.onrender.com";
// Okavela nee main backend vere URL lo unte daani URL pettu
// Ex: https://cartiq-backend.onrender.com

const socket = io(BACKEND_URL);

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

  useEffect(() => {
    socket.on("analysis", (data) => {
      console.log("AI RESPONSE:", data);
      setAnalysis(data);
    });
    socket.on("connect_error", (err) => {
      console.log("Socket error:", err.message);
    });
    return () => socket.off("analysis");
  }, []);

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
