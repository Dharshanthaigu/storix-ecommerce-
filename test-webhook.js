const crypto = require("crypto");

const WEBHOOK_SECRET = "my_test_webhook_secret_123";
const RAZORPAY_ORDER_ID = "order_TAvsAFY2wSFcvD";

const payload = {
  entity: "event",
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_test123456",
        order_id: RAZORPAY_ORDER_ID,
        amount: 79900,
        currency: "INR",
        status: "captured",
      },
    },
  },
  created_at: Math.floor(Date.now() / 1000),
};

const body = JSON.stringify(payload);

const signature = crypto
  .createHmac("sha256", WEBHOOK_SECRET)
  .update(body)
  .digest("hex");

console.log("Body:", body);
console.log("Signature:", signature);