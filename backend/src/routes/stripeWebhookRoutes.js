const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Invoice = require("../models/Invoice");

router.post("/", async (req, res) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed.");
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Payment Successful Event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const invoiceId = paymentIntent.metadata.invoiceId;

    console.log("Payment Success for Invoice:", invoiceId);

    // Update invoice status
    await Invoice.findByIdAndUpdate(invoiceId, { status: "paid" });

    console.log("Invoice marked as PAID");
  }

  res.json({ received: true });
});

module.exports = router;
