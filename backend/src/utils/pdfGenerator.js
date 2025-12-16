const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateInvoicePDF(invoice, client, project) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });

      const filePath = path.join(
        __dirname,
        `../invoices/invoice-${invoice._id}.pdf`
      );

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ========== HEADER ==========
      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .text("INVOICE", { align: "center" })
        .moveDown(2);

      // ========== INVOICE INFO SECTION ==========
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text("Invoice Number:", 50, doc.y, { continued: true })
        .font('Helvetica')
        .text(` ${invoice.invoiceNumber}`, { align: 'left' });

      doc
        .font('Helvetica-Bold')
        .text("Issue Date:", 50, doc.y, { continued: true })
        .font('Helvetica')
        .text(` ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, { align: 'left' });

      doc
        .font('Helvetica-Bold')
        .text("Due Date:", 50, doc.y, { continued: true })
        .font('Helvetica')
        .text(` ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, { align: 'left' });

      doc.moveDown(1.5);

      // ========== CLIENT DETAILS ==========
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text("BILL TO:", 50, doc.y);

      if (client) {
        doc
          .fontSize(11)
          .font('Helvetica')
          .text(client.name, 50, doc.y)
          .text(client.email || "No email provided", 50, doc.y)
          .text(client.company || "", 50, doc.y);
      } else {
        doc
          .fontSize(11)
          .font('Helvetica-Oblique')
          .text("Client information not available", 50, doc.y);
      }

      doc.moveDown(1.5);

      // ========== PROJECT DETAILS ==========
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text("PROJECT:", 50, doc.y);

      if (project) {
        doc
          .fontSize(11)
          .font('Helvetica')
          .text(project.title, 50, doc.y)
          .text(project.description || "No description", 50, doc.y);
      } else {
        doc
          .fontSize(11)
          .font('Helvetica-Oblique')
          .text("Project information not available", 50, doc.y);
      }

      doc.moveDown(2);

      // ========== TABLE HEADER ==========
      const tableTop = doc.y;
      
      // Header background (light gray)
      doc
        .rect(50, tableTop, 500, 25)
        .fillAndStroke('#f0f0f0', '#000000');

      // Header text
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text("DESCRIPTION", 60, tableTop + 8, { width: 200, align: 'left' })
        .text("QTY/HOURS", 260, tableTop + 8, { width: 50, align: 'center' })
        .text("RATE", 320, tableTop + 8, { width: 80, align: 'right' })
        .text("AMOUNT", 420, tableTop + 8, { width: 120, align: 'right' });

      doc.moveDown(0.5);

      // ========== TABLE ROWS ==========
      let yPosition = doc.y + 10;

      invoice.items.forEach((item, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.rect(50, yPosition - 5, 500, 25).fill('#fafafa');
        }

        const quantity = item.quantity || item.hours || 0;
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#000000')
          .text(item.description || 'N/A', 60, yPosition, { width: 190, align: 'left' })
          .text(quantity.toString(), 260, yPosition, { width: 50, align: 'center' })
          .text(item.rate ? `₹${item.rate.toFixed(2)}` : '₹0.00', 320, yPosition, { width: 80, align: 'right' })
          .text(item.amount ? `₹${item.amount.toFixed(2)}` : '₹0.00', 420, yPosition, { width: 120, align: 'right' });

        yPosition += 25;
      });

      doc.y = yPosition + 5;

      // ========== BOTTOM LINE ==========
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor('#000000')
        .lineWidth(2)
        .stroke();

      doc.moveDown(1);

      // ========== TOTAL SECTION ==========
      const totalY = doc.y;
      
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text("TOTAL AMOUNT:", 350, totalY, { width: 100, align: 'left' })
        .fontSize(16)
        .text(
          invoice.totalAmount ? `₹${invoice.totalAmount.toFixed(2)}` : '₹0.00', 
          450, 
          totalY, 
          { width: 90, align: 'right' }
        );

      doc.moveDown(1.5);

      // ========== STATUS ==========
      const statusColor = invoice.status === 'paid' ? '#28a745' : 
                          invoice.status === 'overdue' ? '#dc3545' : '#ffc107';
      
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(statusColor)
        .text(`STATUS: ${invoice.status.toUpperCase()}`, 350, doc.y, { width: 190, align: 'right' });

      // ========== FOOTER ==========
      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .fillColor('#666666')
        .text(
          "Thank you for your business!", 
          50, 
          doc.page.height - 80, 
          { align: 'center', width: 500 }
        );

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generateInvoicePDF;
