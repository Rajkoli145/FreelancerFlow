const Invoice = require("../models/Invoice");

// Convert user full name to initials -> Raj Koli => RK
function getUserInitials(fullName) {
  if (!fullName) return "USR";
  return fullName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase())
    .join("");
}

// Generate next sequence number for the user in the current year
async function getNextSequence(userId) {
  const currentYear = new Date().getFullYear();

  const lastInvoice = await Invoice.findOne({ userId })
    .sort({ createdAt: -1 });

  if (!lastInvoice) return "0001";

  const lastInvoiceNumber = lastInvoice.invoiceNumber;
  const parts = lastInvoiceNumber.split("-");

  if (parts.length < 4) return "0001";

  let lastSequence = parseInt(parts[3]);
  let nextSeq = (lastSequence + 1).toString().padStart(4, "0");

  return nextSeq;
}

// MAIN FUNCTION: Create Invoice Number
async function generateInvoiceNumber(user) {
  const initials = getUserInitials(user.fullName || "USER");

  const year = new Date().getFullYear();

  const sequence = await getNextSequence(user._id);

  return `INV-${year}-${initials}-${sequence}`;
}

module.exports = generateInvoiceNumber;
