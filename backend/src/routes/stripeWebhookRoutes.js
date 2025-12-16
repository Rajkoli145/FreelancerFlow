const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

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

    try {
      // Find the invoice
      const invoice = await Invoice.findById(invoiceId);
      
      if (!invoice) {
        console.error("Invoice not found:", invoiceId);
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Create payment record
      const payment = await Payment.create({
        userId: invoice.userId,
        invoiceId: invoice._id,
        amount: paymentIntent.amount / 100, // Stripe uses cents
        paymentDate: new Date(),
        paymentMethod: "credit_card",
        referenceNumber: paymentIntent.id,
        stripePaymentIntentId: paymentIntent.id,
        notes: "Payment via Stripe"
      });

      // Update invoice amountPaid (status will auto-update via pre-save hook)
      invoice.amountPaid += payment.amount;
      await invoice.save();

      console.log("Payment recorded and invoice updated:", {
        paymentId: payment._id,
        invoiceStatus: invoice.status,
        amountPaid: invoice.amountPaid
      });

    } catch (error) {
      console.error("Error processing payment:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.json({ received: true });
});

module.exports = router;
