const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF invoice for an order
 * @param {Object} order - Populated Mongoose order document (requires items and customer to be populated)
 * @returns {Promise<string>} Promise that resolves to the absolute file path of the generated PDF
 */
exports.generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(__dirname, '..', 'public', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const filePath = path.join(invoicesDir, `invoice_${order.orderNumber}.pdf`);
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // --- Header ---
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text('KBR Fresh Foods', 50, 57)
        .fontSize(10)
        .text('123 Main Road', 200, 50, { align: 'right' })
        .text('Negombo, Sri Lanka', 200, 65, { align: 'right' })
        .text('Phone: +94 77 123 4567', 200, 80, { align: 'right' })
        .moveDown();

      doc.moveTo(50, 110).lineTo(550, 110).stroke();

      // --- Customer Details ---
      doc
        .fontSize(14)
        .fillColor('#333333')
        .text('INVOICE', 50, 130)
        .fontSize(10)
        .text(`Order Number: ${order.orderNumber}`, 50, 150)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 165)
        .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 50, 180)
        
        // Billed To
        .text('Billed To:', 350, 130)
        .text(order.customer?.name || 'Valued Customer', 350, 150)
        .text(order.customer?.email || '', 350, 165)
        .text(order.customer?.phone || '', 350, 180)
        .moveDown();

      // Delivery Address
      if (order.deliveryAddress && order.deliveryAddress.line1) {
        doc.text('Delivery Address:', 50, 210)
           .text(order.deliveryAddress.line1, 50, 225);
        if (order.deliveryAddress.line2) {
          doc.text(order.deliveryAddress.line2, 50, 240);
        }
        doc.text(order.deliveryAddress.city || 'Negombo', 50, order.deliveryAddress.line2 ? 255 : 240);
      }

      // --- Item Table Header ---
      const tableTop = 300;
      doc.font('Helvetica-Bold');
      generateTableRow(doc, tableTop, 'Item', 'Qty', 'Unit Price (Rs)', 'Total (Rs)');
      generateHr(doc, tableTop + 20);
      doc.font('Helvetica');

      // --- Item Rows ---
      let i;
      let position = tableTop + 30;
      for (i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        generateTableRow(
          doc,
          position,
          item.name || 'Product',
          item.quantity,
          item.unitPrice,
          item.subtotal
        );
        generateHr(doc, position + 20);
        position += 30;
      }

      // --- Totals ---
      const subtotalPosition = position + 10;
      doc.font('Helvetica-Bold');
      generateTableRow(doc, subtotalPosition, '', '', 'Subtotal:', order.itemsTotal);
      generateTableRow(doc, subtotalPosition + 20, '', '', 'Delivery Fee:', order.deliveryFee);
      doc.font('Helvetica-Bold').fontSize(12);
      generateTableRow(doc, subtotalPosition + 40, '', '', 'Grand Total:', order.totalAmount);

      doc.font('Helvetica');

      // --- Footer ---
      doc.fontSize(10).text(
        'Thank you for shopping with KBR Fresh Foods. Freshness guaranteed!',
        50,
        700,
        { align: 'center', width: 500 }
      );

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

    } catch (err) {
      reject(err);
    }
  });
};

function generateTableRow(doc, y, item, qty, unitCost, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y, { width: 250 })
    .text(qty, 300, y, { width: 50, align: 'center' })
    .text(unitCost, 350, y, { width: 100, align: 'right' })
    .text(lineTotal, 450, y, { width: 100, align: 'right' });
}

function generateHr(doc, y) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}
