"use strict";

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const razorpayService = require("../classes/RazorpayService");
const userStore = require("../classes/UserStore");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    req.userId = decoded.sub || decoded.id || decoded.userId;
    req.userName = decoded.name;
    req.userPicture = decoded.picture;
    req.userEmail = decoded.email;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// POST /api/payment/create-order
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const order = await razorpayService.createOrder(9900); // ₹99
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("create-order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// POST /api/payment/verify
router.post("/verify", authMiddleware, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment fields" });
  }

  const isValid = razorpayService.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );

  if (!isValid) {
    return res.status(400).json({ error: "Payment verification failed" });
  }

  userStore.setPremium(req.userId);

  // Emit real-time premium unlock via SocketManager (attached to app)
  const socketManager = req.app.get("socketManager");
  if (socketManager) {
    socketManager.emitToUser(req.userId, "premium_unlocked", {
      isPremium: true,
    });
  }

  return res.json({ success: true, isPremium: true });
});

// GET /api/payment/status
router.get("/status", authMiddleware, (req, res) => {
  const isPremium = userStore.isPremium(req.userId);
  res.json({ isPremium });
});

module.exports = router;
