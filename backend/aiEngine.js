let history = {};

const WEIGHTS = {
  STACK: 25,
  REMOVE: 35,
  REUSE: 15,
  VELOCITY: 20,
  GHOST: 40
};

function detect(session) {
  let events = [];
  let risk = 0;
  const now = Date.now();

  if (!history[session.id]) history[session.id] = [];

  // COUPON STACKING
  if (session.coupons.length >= 2) {
    events.push(event("Coupon Stacking Pattern Detected", "HIGH", 88));
    risk += WEIGHTS.STACK;
  }

  // ADD REMOVE EXPLOIT
  if (session.removedAfterCoupon) {
    events.push(event("Cart Manipulation After Coupon Trigger", "CRITICAL", 96));
    risk += WEIGHTS.REMOVE;
  }

  // COUPON REUSE
  const used = history[session.id].map((h) => h.code);
  session.coupons.forEach((c) => {
    if (used.includes(c)) {
      events.push(event("Repeated Promo Reuse Attempt", "MEDIUM", 76));
      risk += WEIGHTS.REUSE;
    }
  });

  // VELOCITY
  const recent = history[session.id].filter((h) => now - h.time < 5000);
  if (recent.length > 3) {
    events.push(event("High Velocity Coupon Execution", "HIGH", 91));
    risk += WEIGHTS.VELOCITY;
  }

  // GHOST ACCOUNT
  if (session.status === "deleted" && session.coupons.length > 0) {
    events.push(event("Ghost Account Promo Abuse", "CRITICAL", 99));
    risk += WEIGHTS.GHOST;
  }

  // NORMAL INFO EVENTS
  if (session.coupons.length === 1) {
    events.push(event("Promo Event Captured", "LOW", 52));
  }

  if (session.cart.length >= 4) {
    events.push(event("Bulk Cart Pattern Under Observation", "LOW", 48));
  }

  session.coupons.forEach((c) => {
    history[session.id].push({ code: c, time: now });
  });

  return {
    events,
    risk: Math.min(risk, 100),
    blocked: risk >= 80
  };
}

function event(type, severity, confidence) {
  return {
    type,
    severity,
    confidence,
    time: new Date().toLocaleTimeString()
  };
}

module.exports = { detect };