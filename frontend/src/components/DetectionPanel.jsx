import RiskGauge from "./RiskGauge";
import { motion } from "framer-motion";

export default function DetectionPanel({ analysis }) {
  return (
    <div className="h-screen overflow-y-auto bg-white text-black p-6">

      {/* HEADER */}
      <div className="mb-8 border-b border-slate-700 pb-6">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          CartIQ Sentinel AI
        </h1>
        <p className="text-xl text-black mb-2">
          Real-Time Coupon Fraud Intelligence Engine
        </p>
        <p className="text-slate-400 text-sm leading-6">
          Monitoring live checkout behavior, discount misuse,
          suspicious promo stacking, checkout manipulation
          and ghost promo account abuse before payment completion.
        </p>
      </div>

      {/* LIVE RISK */}
      <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5 mb-8 shadow-xl">
        <h2 className="text-2xl font-semibold mb-4">Live Session Risk</h2>
        <RiskGauge risk={analysis.risk ?? analysis.events?.[0]?.confidence ?? 0} />
      </div>

      {/* QUICK STATUS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <InfoCard title="Events Triggered" value={analysis.events.length} />
        <InfoCard title="Top Confidence" value={`${analysis.events[0]?.confidence || 0}%`} />
        <InfoCard title="AI Monitor" value="ACTIVE" />
        <InfoCard title="Threat Engine" value={analysis.blocked ? "BLOCKED" : "WATCHING"} />
      </div>

      {/* BLOCK ALERT */}
      {analysis.blocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900 border border-red-500 rounded-xl p-4 mb-8 text-center font-bold text-red-200"
        >
          🚫 SESSION AUTO BLOCKED — FRAUD THRESHOLD EXCEEDED
        </motion.div>
      )}

      {/* LIVE EVENT LOGS */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Live Threat Activity</h2>

        {analysis.events.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-700 p-5 rounded-xl text-slate-400">
            No suspicious checkout behavior detected.
          </div>
        ) : (
          analysis.events.map((e, i) => (
            <motion.div
              key={i}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`rounded-xl p-4 mb-3 border ${
                e.severity === "CRITICAL"
                  ? "bg-red-950 border-red-500"
                  : e.severity === "HIGH"
                  ? "bg-orange-950 border-orange-500"
                  : e.severity === "MEDIUM"
                  ? "bg-yellow-900 border-yellow-500"
                  : "bg-slate-800 border-slate-600"
              }`}
            >
              <p className="text-xs text-slate-300">{e.time}</p>
              <h3 className="font-bold text-lg">{e.type}</h3>
              <p>Severity: {e.severity}</p>
              <p>Confidence: {e.confidence}%</p>
            </motion.div>
          ))
        )}
      </div>

      {/* AI COVERAGE */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-300">
          AI Coverage Matrix
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <SmallCard text="Coupon Stacking Abuse" />
          <SmallCard text="Promo Reuse Detection" />
          <SmallCard text="Cart Remove Exploit" />
          <SmallCard text="Velocity Coupon Attack" />
          <SmallCard text="Ghost Account Fraud" />
          <SmallCard text="Bulk Checkout Observation" />
        </div>
      </div>

      {/* ENTERPRISE BENEFITS */}
      <div className="border-t border-slate-700 pt-8 pb-16">
        <h2 className="text-4xl font-bold mb-3 text-white">
          Why Businesses Need CartIQ Sentinel
        </h2>
        <p className="text-slate-400 mb-8 leading-7">
          Built to protect e-commerce discount systems from revenue leakage,
          malicious coupon exploitation and invisible checkout fraud in real time.
        </p>

        <div className="grid grid-cols-2 gap-6">

          <BenefitCard
            title="Revenue Protection"
            desc="Prevents unauthorized discount stacking and protects promotional campaign budgets from abuse."
          />

          <BenefitCard
            title="Millisecond Detection"
            desc="AI engine monitors every coupon event instantly before checkout payment completion."
          />

          <BenefitCard
            title="Auto Session Blocking"
            desc="High-risk users are automatically flagged and blocked before fraudulent order confirmation."
          />

          <BenefitCard
            title="Behavior Intelligence"
            desc="Continuously analyzes suspicious shopping patterns, promo repetition and cart manipulation."
          />

          <BenefitCard
            title="Enterprise API Ready"
            desc="Can be deployed as a scalable backend middleware for Amazon, Flipkart, Myntra and Shopify."
          />

          <BenefitCard
            title="Fraud Loss Reduction"
            desc="Helps businesses reduce hidden promotional losses and increase operational trust."
          />

        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4">
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="text-2xl font-bold text-cyan-400">{value}</h3>
    </div>
  );
}

function SmallCard({ text }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-slate-300">
      ✔ {text}
    </div>
  );
}

function BenefitCard({ title, desc }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-slate-400 leading-6">{desc}</p>
    </div>
  );
}
