'use strict';

const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    this._razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create a Razorpay order.
   * @param {number} amountInPaise - Amount in smallest currency unit (paise)
   * @returns {Promise<object>} Razorpay order object
   */
  async createOrder(amountInPaise = 9900) {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await this._razorpay.orders.create(options);
    return order;
  }

  /**
   * Verify Razorpay payment signature.
   * @param {string} orderId
   * @param {string} paymentId
   * @param {string} signature
   * @returns {boolean}
   */
  verifyPayment(orderId, paymentId, signature) {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  }
}

module.exports = new RazorpayService();
