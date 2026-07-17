const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

const generateInvoicePDF = async (invoice, client, project) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const tempDir = os.tmpdir();
      const filePath = path.join(tempDir, `invoice-${invoice._id}.pdf`);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header / Title
      doc.fontSize(20).text('INVOICE', { align: 'right' });
      doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
      doc.text(`Date: ${new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString()}`, { align: 'right' });
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Client Info
      doc.fontSize(12).text('Billed To:', { underline: true });
      doc.fontSize(10).text(`Name: ${client.name}`);
      doc.text(`Email: ${client.email}`);
      if (client.company) doc.text(`Company: ${client.company}`);
      doc.moveDown();

      // Project Info
      doc.fontSize(12).text('Project:', { underline: true });
      doc.fontSize(10).text(`Title: ${project.title}`);
      doc.text(`Billing Type: ${project.billingType}`);
      doc.moveDown();

      // Items Table Header
      doc.fontSize(12).text('Line Items', { underline: true });
      doc.moveDown(0.5);

      const tableTop = 280;
      doc.fontSize(10);
      doc.text('Description', 50, tableTop);
      doc.text('Quantity', 250, tableTop, { width: 90, align: 'right' });
      doc.text('Rate', 340, tableTop, { width: 90, align: 'right' });
      doc.text('Amount', 430, tableTop, { width: 90, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(520, tableTop + 15).stroke();

      // Items
      let y = tableTop + 25;
      invoice.items.forEach((item) => {
        doc.text(item.description, 50, y, { width: 190 });
        doc.text(item.quantity.toString(), 250, y, { width: 90, align: 'right' });
        doc.text(item.rate.toFixed(2), 340, y, { width: 90, align: 'right' });
        doc.text(item.amount.toFixed(2), 430, y, { width: 90, align: 'right' });
        y += 20;
      });

      doc.moveTo(50, y).lineTo(520, y).stroke();
      y += 10;

      // Totals
      doc.text('Subtotal:', 340, y, { width: 90, align: 'right' });
      doc.text(invoice.subtotal.toFixed(2), 430, y, { width: 90, align: 'right' });
      y += 15;

      if (invoice.taxRate) {
        const taxAmount = invoice.subtotal * (invoice.taxRate / 100);
        doc.text(`Tax (${invoice.taxRate}%):`, 340, y, { width: 90, align: 'right' });
        doc.text(taxAmount.toFixed(2), 430, y, { width: 90, align: 'right' });
        y += 15;
      }

      if (invoice.discountAmount) {
        doc.text('Discount:', 340, y, { width: 90, align: 'right' });
        doc.text(`-${invoice.discountAmount.toFixed(2)}`, 430, y, { width: 90, align: 'right' });
        y += 15;
      }

      if (invoice.lateFeeAmount) {
        doc.text('Late Fee:', 340, y, { width: 90, align: 'right' });
        doc.text(invoice.lateFeeAmount.toFixed(2), 430, y, { width: 90, align: 'right' });
        y += 15;
      }

      doc.fontSize(12).text('Total:', 340, y, { width: 90, align: 'right' });
      doc.text(invoice.totalAmount.toFixed(2), 430, y, { width: 90, align: 'right' });

      doc.end();

      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoicePDF;
