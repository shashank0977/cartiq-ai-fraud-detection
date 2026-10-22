import { motion } from "framer-motion";

export default function RiskGauge({ risk }) {
  const safeRisk = risk ?? 0; // FIX: undefined ayte 0

  const color =
    safeRisk >= 80
      ? "text-red-500"
      : safeRisk >= 50
      ? "text-orange-400"
      : safeRisk >= 20
      ? "text-yellow-400"
      : "text-green-400";

  const barColor =
    safeRisk >= 80
      ? "bg-red-500"
      : safeRisk >= 50
      ? "bg-orange-400"
      : safeRisk >= 20
      ? "bg-yellow-400"
      : "bg-green-400";

  return (
    <div className="text-center">
      <motion.h1
        key={safeRisk}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-7xl font-bold ${color}`}
      >
        {safeRisk}%
      </motion.h1>

      <div className="w-full bg-slate-700 h-5 rounded-full mt-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeRisk}%` }}
          transition={{ duration: 0.8 }}
          className={`${barColor} h-5 rounded-full`}
        />
      </div>
    </div>
  );
}
