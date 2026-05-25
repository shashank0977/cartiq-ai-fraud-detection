const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let history = {};
let threatMemory = {};
let previousCoupons = {};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

io.on("connection", (socket) => {
  socket.on("cartUpdate", async (session) => {
    if (!history[session.id]) history[session.id] = [];
    if (!threatMemory[session.id]) threatMemory[session.id] = 0;
    if (!previousCoupons[session.id]) previousCoupons[session.id] = 0;

    const coupons_used = session.coupons.length;

    let repeated_coupon = 0;
    session.coupons.forEach((c) => {
      if (history[session.id].includes(c)) repeated_coupon = 1;
    });

    history[session.id] = [...history[session.id], ...session.coupons];

    const cart_items = session.cart.length;
    const removed_after_coupon = session.removedAfterCoupon ? 1 : 0;
    const coupon_speed = Math.floor(Math.random() * 5) + 1;
    const account_deleted = session.status === "deleted" ? 1 : 0;

    let total_discount = 0;
    if (session.coupons.includes("SAVE10")) total_discount += 10;
    if (session.coupons.includes("VIP50")) total_discount += 50;
    if (session.coupons.includes("SUMMER20")) total_discount += 20;

    // ONLY WHEN NEW COUPON ADDED
    if (coupons_used > previousCoupons[session.id]) {
      threatMemory[session.id] += rand(5, 10);
    }

    if (repeated_coupon) threatMemory[session.id] += rand(10, 16);
    if (removed_after_coupon) threatMemory[session.id] += rand(18, 25);
    if (total_discount >= 50 && coupons_used > previousCoupons[session.id]) {
      threatMemory[session.id] += rand(8, 14);
    }

    previousCoupons[session.id] = coupons_used;

    if (threatMemory[session.id] > 100) threatMemory[session.id] = 100;

    const payload = {
      coupons_used,
      repeated_coupon,
      cart_items,
      removed_after_coupon,
      coupon_speed,
      account_deleted,
      total_discount
    };

    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", payload);

      let result = response.data;

      if (
        coupons_used === 0 &&
        !removed_after_coupon &&
        !repeated_coupon &&
        total_discount === 0
      ) {
        result.risk = 0;
        result.blocked = false;
      }

      else if (removed_after_coupon) {
        result.risk = rand(86, 95);
        result.blocked = true;
      }

      else if (total_discount >= 80) {
        result.risk = rand(97, 100);
        result.blocked = true;
      }

      else if (total_discount >= 70) {
        result.risk = rand(80, 90);
        result.blocked = true;
      }

      else if (total_discount >= 60) {
        result.risk = rand(65, 76);
        result.blocked = false;
      }

      else if (total_discount >= 30) {
        result.risk = rand(40, 52);
        result.blocked = false;
      }

      else if (total_discount >= 20) {
        result.risk = rand(22, 30);
        result.blocked = false;
      }

      else if (total_discount >= 10) {
        result.risk = rand(10, 18);
        result.blocked = false;
      }

      else {
        result.risk = Math.min(
          100,
          Math.floor((result.risk * 0.2) + (threatMemory[session.id] * 0.8))
        );
        result.blocked = result.risk >= 80;
      }

      socket.emit("analysis", result);
    } catch (err) {
      console.log("ML API Error", err.message);
    }
  });
});

server.listen(5000, () => console.log("ML Socket Server running on 5000"));