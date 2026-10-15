/**
 * Generates and triggers print/download of an invoice PDF for orders.
 * Uses Blob URL to bypass popup blockers.
 */
function openOrDownloadHTML(html, filename) {
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      // Revoke after 2 minutes
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    } else {
      // Fallback: trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  } catch (err) {
    console.error('PDF open error:', err);
    alert('Could not open PDF. Please check your browser settings and allow popups for this site.');
  }
}

export function downloadInvoicePDF(order) {
  const isWholesale = !!order.buyer || !!order.orderNumber?.startsWith('WHO');
  const invoiceNumber = order.orderNumber || `INV-${order._id?.slice(-6)}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const customerName =
    order.deliveryAddress?.label ||
    order.buyer?.name ||
    order.buyer?.businessName ||
    'Valued Customer';
  const customerAddress = order.deliveryAddress?.line1
    ? `${order.deliveryAddress.line1}${order.deliveryAddress.city ? ', ' + order.deliveryAddress.city : ''}, Sri Lanka`
    : order.buyer?.email || 'Negombo, Sri Lanka';

  const itemsHtml = (order.items || [])
    .map(
      (item, idx) => `
    <tr>
      <td style="padding:12px 10px;font-size:13px;color:#374151;text-align:center;">${idx + 1}</td>
      <td style="padding:12px 10px;font-size:13px;font-weight:600;color:#111827;">${item.name || item.product?.name || 'Product'}</td>
      <td style="padding:12px 10px;font-size:13px;color:#374151;text-align:center;">${item.quantity} ${item.unit || 'kg'}</td>
      <td style="padding:12px 10px;font-size:13px;color:#374151;text-align:right;">Rs. ${(item.unitPrice ?? (item.subtotal / item.quantity) ?? 0).toLocaleString('en-LK')}</td>
      <td style="padding:12px 10px;font-size:13px;font-weight:700;color:#15803d;text-align:right;">Rs. ${(item.subtotal ?? 0).toLocaleString('en-LK')}</td>
    </tr>
  `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoiceNumber} - KBR Fresh Foods</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; background: #fff; }
    .invoice-wrap { max-width: 780px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #15803d; padding-bottom: 20px; margin-bottom: 28px; }
    .brand-name { font-size: 22px; font-weight: 800; color: #15803d; letter-spacing: -0.5px; }
    .brand-sub { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #166534; margin-top: 3px; }
    .brand-contact { font-size: 11px; color: #6b7280; margin-top: 6px; line-height: 1.6; }
    .inv-title { text-align: right; }
    .inv-title h1 { font-size: 26px; font-weight: 900; color: #111827; letter-spacing: -1px; }
    .inv-title .inv-no { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .inv-title .inv-date { font-size: 12px; color: #6b7280; }
    .status-badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 3px 10px; border-radius: 99px; margin-top: 6px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .detail-box { background: #f9fafb; border: 1px solid #f0f0f0; border-radius: 10px; padding: 14px 18px; }
    .detail-box h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 6px; }
    .detail-box p { font-size: 13px; color: #374151; line-height: 1.6; }
    .detail-box strong { color: #111827; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f0fdf4; border-bottom: 2px solid #bbf7d0; }
    thead th { padding: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #166534; text-align: left; }
    thead th:last-child { text-align: right; }
    tbody tr { border-bottom: 1px solid #f3f4f6; }
    tbody tr:hover { background: #fafafa; }
    .totals-section { width: 280px; margin-left: auto; }
    .totals-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; color: #6b7280; }
    .totals-row.grand { border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: 800; color: #15803d; }
    .footer { border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 18px; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.8; }
    .lk-flag-bar { height: 3px; background: linear-gradient(90deg, #8B4513 0%, #F5A623 30%, #15803d 70%, #F5A623 100%); border-radius: 2px; margin-bottom: 6px; }
    @media print {
      body { padding: 10px; }
      .invoice-wrap { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="invoice-wrap">
    <div class="header">
      <div>
        <div class="brand-name">🌿 KBR Fresh Foods</div>
        <div class="brand-sub">Negombo, Sri Lanka · Since 2010</div>
        <div class="brand-contact">
          No. 45, Colombo Road, Negombo 11500, Sri Lanka<br/>
          Tel: +94 31 222 1450 &nbsp;|&nbsp; info@kbrfreshfoods.lk<br/>
          Business Reg: PV 00045231
        </div>
      </div>
      <div class="inv-title">
        <h1>${isWholesale ? 'BULK INVOICE' : 'TAX INVOICE'}</h1>
        <div class="inv-no"><strong>#</strong> ${invoiceNumber}</div>
        <div class="inv-date">Date: ${orderDate}</div>
        <div class="status-badge">${(order.status || 'PAID').toUpperCase()}</div>
      </div>
    </div>

    <div class="details-grid">
      <div class="detail-box">
        <h3>Billed To</h3>
        <p><strong>${customerName}</strong></p>
        <p>${customerAddress}</p>
        ${order.paymentMethod ? `<p style="margin-top:6px;">Payment: <strong>${order.paymentMethod.toUpperCase()}</strong></p>` : ''}
      </div>
      <div class="detail-box">
        <h3>Order Information</h3>
        <p>Reference: <strong>${order.orderNumber || order._id || '—'}</strong></p>
        <p>Type: <strong>${isWholesale ? 'Wholesale Bulk Order' : 'Retail Order'}</strong></p>
        ${order.estimatedDeliveryTime ? `<p>ETA: <strong>${new Date(order.estimatedDeliveryTime).toLocaleString('en-LK')}</strong></p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:40px;text-align:center;">#</th>
          <th>Item Description</th>
          <th style="text-align:center;width:90px;">Qty</th>
          <th style="text-align:right;width:110px;">Unit Price</th>
          <th style="text-align:right;width:110px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#9ca3af;">No items</td></tr>'}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals-row">
        <span>Items Subtotal</span>
        <span>Rs. ${(order.itemsTotal || 0).toLocaleString('en-LK')}</span>
      </div>
      ${order.deliveryFee ? `
      <div class="totals-row">
        <span>Delivery Fee</span>
        <span>Rs. ${order.deliveryFee.toLocaleString('en-LK')}</span>
      </div>` : ''}
      <div class="totals-row grand">
        <span>Total (LKR)</span>
        <span>Rs. ${(order.totalAmount || order.itemsTotal || 0).toLocaleString('en-LK')}</span>
      </div>
    </div>

    <div class="footer">
      <div class="lk-flag-bar"></div>
      <p>Thank you for choosing <strong>KBR Fresh Foods</strong> — Fresh from the Farm to Your Door.</p>
      <p>For inquiries: +94 31 222 1450 | info@kbrfreshfoods.lk | www.kbrfreshfoods.lk</p>
      <p style="margin-top:4px;font-size:10px;">This is a computer generated invoice. No signature required.</p>
    </div>
  </div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 500));</script>
</body>
</html>`;

  openOrDownloadHTML(html, `KBR-Invoice-${invoiceNumber}.html`);
}

export function downloadInventoryPDF(products) {
  const rowsHtml = (products || [])
    .map(
      (p, idx) => `
    <tr>
      <td style="padding:9px 10px;font-size:12px;color:#374151;text-align:center;">${idx + 1}</td>
      <td style="padding:9px 10px;font-size:12px;font-weight:600;color:#111827;">${p.name}</td>
      <td style="padding:9px 10px;font-size:11px;color:#6b7280;">${p.itemCode || '—'}</td>
      <td style="padding:9px 10px;font-size:12px;color:#4b5563;">${p.category?.name || 'General'}</td>
      <td style="padding:9px 10px;font-size:12px;font-weight:700;text-align:center;color:${p.stockQuantity <= (p.lowStockThreshold || 10) ? '#dc2626' : '#15803d'};">${p.stockQuantity} ${p.unit || 'kg'}</td>
      <td style="padding:9px 10px;font-size:12px;text-align:right;">Rs. ${(p.purchasePrice || 0).toLocaleString('en-LK')}</td>
      <td style="padding:9px 10px;font-size:12px;text-align:right;">Rs. ${(p.retailPrice || 0).toLocaleString('en-LK')}</td>
      <td style="padding:9px 10px;font-size:12px;text-align:right;">Rs. ${(p.wholesalePrice || 0).toLocaleString('en-LK')}</td>
      <td style="padding:9px 10px;font-size:11px;color:#6b7280;">${p.supplierName || '—'}</td>
    </tr>
  `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Inventory Report - KBR Fresh Foods</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1f2937; background: #fff; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #15803d; padding-bottom: 16px; margin-bottom: 20px; }
    .brand-name { font-size: 20px; font-weight: 800; color: #15803d; }
    .brand-sub { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #166534; }
    .report-info { text-align: right; font-size: 12px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f0fdf4; border-bottom: 2px solid #bbf7d0; }
    thead th { padding: 9px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #166534; text-align: left; }
    tbody tr { border-bottom: 1px solid #f0f0f0; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .summary { margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .summary-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; }
    .summary-card .val { font-size: 20px; font-weight: 800; color: #15803d; }
    .summary-card .lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; }
    .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 14px; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-name">🌿 KBR Fresh Foods</div>
      <div class="brand-sub">Stock & Inventory Valuation Report</div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px;">No. 45, Colombo Road, Negombo 11500, Sri Lanka</div>
    </div>
    <div class="report-info">
      <p><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-LK', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <p><strong>Total SKUs:</strong> ${(products || []).length}</p>
      <p><strong>Generated By:</strong> KBR Management System</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align:center;width:35px;">#</th>
        <th>Product Name</th>
        <th>Item Code</th>
        <th>Category</th>
        <th style="text-align:center;">Stock Qty</th>
        <th style="text-align:right;">Buy Price</th>
        <th style="text-align:right;">Retail Price</th>
        <th style="text-align:right;">Wholesale</th>
        <th>Supplier</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="9" style="text-align:center;padding:20px;color:#9ca3af;">No products found</td></tr>'}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-card">
      <div class="val">${(products || []).length}</div>
      <div class="lbl">Total Products</div>
    </div>
    <div class="summary-card">
      <div class="val">${(products || []).filter(p => p.stockQuantity > 0).length}</div>
      <div class="lbl">In Stock</div>
    </div>
    <div class="summary-card">
      <div class="val">${(products || []).filter(p => p.stockQuantity <= (p.lowStockThreshold || 10)).length}</div>
      <div class="lbl">Low Stock Alert</div>
    </div>
  </div>

  <div class="footer">
    <p>CONFIDENTIAL — Internal Inventory Report · KBR Fresh Foods (Pvt) Ltd. · Negombo, Sri Lanka</p>
  </div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 500));</script>
</body>
</html>`;

  openOrDownloadHTML(html, `KBR-Inventory-Report-${new Date().toISOString().split('T')[0]}.html`);
}
