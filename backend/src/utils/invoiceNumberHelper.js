const Invoice = require('../models/Invoice');

const generateInvoiceNumber = async (user) => {
  const count = await Invoice.countDocuments({ userId: user._id });
  const year = new Date().getFullYear();
  const index = (count + 1).toString().padStart(4, '0');
  return `INV-${year}-${index}`;
};

module.exports = generateInvoiceNumber;
