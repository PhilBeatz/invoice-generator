// src/invoicePdfUtils.js
// Shared utility for generating invoice HTML and triggering PDF download/view
import QRCode from 'qrcode';

const currencies = [
  { code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' },
  { code: 'CAD', symbol: 'C$' }, { code: 'AUD', symbol: 'A$' }, { code: 'JPY', symbol: '¥' },
  { code: 'INR', symbol: '₹' }, { code: 'CHF', symbol: 'CHF ' }, { code: 'CNY', symbol: '¥' },
  { code: 'MXN', symbol: 'MX$' }, { code: 'BRL', symbol: 'R$' }, { code: 'ZAR', symbol: 'R' },
  { code: 'KRW', symbol: '₩' }, { code: 'SGD', symbol: 'S$' }, { code: 'HKD', symbol: 'HK$' },
  { code: 'NZD', symbol: 'NZ$' }, { code: 'SEK', symbol: 'kr' }, { code: 'NOK', symbol: 'kr' },
  { code: 'DKK', symbol: 'kr' }, { code: 'AED', symbol: 'د.إ' }, { code: 'SAR', symbol: '﷼' },
];

function getCurrencySymbol(code) {
  return currencies.find(c => c.code === code)?.symbol || '$';
}

function formatDateDefault(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getItemTotal(item, mode) {
  return mode === 'hours' ? (item.hours || 0) * (item.rate || 0) : (item.quantity || 0) * (item.price || 0);
}

function calcTotals(invoice) {
  const subtotal = (invoice.items || []).reduce((sum, item) => sum + getItemTotal(item, invoice.invoiceMode), 0);
  const discountAmount = invoice.discount || 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = invoice.taxType === 'percent' ? (afterDiscount * (invoice.taxRate || 0) / 100) : (invoice.taxRate || 0);
  const shippingAmount = invoice.shippingCost || 0;
  const total = invoice.taxIncluded ? afterDiscount + shippingAmount : afterDiscount + taxAmount + shippingAmount;
  return { subtotal, discountAmount, afterDiscount, taxAmount, shippingAmount, total };
}

function getPaymentUrl(pm, amount, invoiceNumber) {
  const note = invoiceNumber ? `Invoice ${invoiceNumber}` : 'Invoice Payment';
  if (pm.type === 'venmo' && pm.venmoHandle) {
    return `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(pm.venmoHandle)}&amount=${amount}&note=${encodeURIComponent(note)}`;
  }
  if (pm.type === 'cashapp' && pm.cashappTag) {
    return `https://cash.app/$${encodeURIComponent(pm.cashappTag)}/${amount}`;
  }
  return null;
}

async function generatePaymentHTML(invoice) {
  if (!invoice.paymentMethods || invoice.paymentMethods.length === 0) return '';
  let html = '<div class="payment-details"><h3>Payment Details</h3>';
  for (const pm of invoice.paymentMethods) {
    if (pm.type === 'bank') {
      html += `<div class="payment-section"><div class="payment-method">Method: Bank</div><div class="payment-grid-two-col">
        <div class="payment-row"><span class="payment-label">Bank:</span><span class="payment-value">${pm.bankName || ''}</span></div>
        <div class="payment-row"><span class="payment-label">Branch:</span><span class="payment-value">${pm.branch || ''}</span></div>
        <div class="payment-row"><span class="payment-label">Address:</span><span class="payment-value">${pm.bankAddress || pm.address || ''}</span></div>
        <div class="payment-row"><span class="payment-label">Account Name:</span><span class="payment-value">${pm.accountName || ''}</span></div>
        <div class="payment-row"><span class="payment-label">Account #:</span><span class="payment-value">${pm.accountNumber || ''}</span></div>
        <div class="payment-row"><span class="payment-label">Routing #:</span><span class="payment-value">${pm.routingNumber || pm.routing || ''}</span></div>
        <div class="payment-row"><span class="payment-label">Sort Code:</span><span class="payment-value">${pm.sortCode || ''}</span></div>
        <div class="payment-row"><span class="payment-label">SWIFT:</span><span class="payment-value">${pm.swift || ''}</span></div>
        <div class="payment-row"><span class="payment-label">IBAN:</span><span class="payment-value">${pm.iban || ''}</span></div>
      </div></div>`;
    } else if (pm.type === 'paypal') {
      html += `<div class="payment-section"><div class="payment-method">Method: PayPal</div><div class="payment-grid">
        ${pm.paypalEmail ? `<div class="payment-row"><span class="payment-label">PayPal Email:</span><span class="payment-value">${pm.paypalEmail}</span></div>` : ''}
      </div></div>`;
    } else if (pm.type === 'venmo' || pm.type === 'cashapp') {
      const label = pm.type === 'venmo' ? 'Venmo' : 'Cash App';
      const color = pm.type === 'venmo' ? '#008CFF' : '#00D632';
      const handle = pm.type === 'venmo' ? `@${pm.venmoHandle}` : `$${pm.cashappTag}`;
      const total = calcTotals(invoice).total;
      const url = getPaymentUrl(pm, total, invoice.invoiceNumber);
      let qrImg = '';
      if (url) {
        try {
          const dataUrl = await QRCode.toDataURL(url, { width: 140, margin: 2 });
          qrImg = `<div style="text-align:center;margin-top:12px">
            <img src="${dataUrl}" style="width:120px;height:120px" />
            <div style="font-size:12px;color:${color};margin-top:6px;font-weight:600">Scan to pay with ${label}</div>
          </div>`;
        } catch (e) { /* QR generation failed, skip */ }
      }
      html += `<div class="payment-section"><div class="payment-method">Method: ${label}</div><div class="payment-grid">
        <div class="payment-row"><span class="payment-label">${label}:</span><span class="payment-value">${handle}</span></div>
      </div>${qrImg}</div>`;
    } else if (pm.type === 'crypto') {
      html += `<div class="payment-section"><div class="payment-method">Method: Cryptocurrency (${pm.cryptoType || pm.cryptoCurrency || ''})</div><div class="payment-grid">
        ${pm.walletAddress ? `<div class="payment-row"><span class="payment-label">Wallet Address:</span><span class="payment-value" style="word-break:break-all">${pm.walletAddress}</span></div>` : ''}
      </div></div>`;
    } else if (pm.type === 'custom') {
      html += `<div class="payment-section"><div class="payment-method">Method: ${pm.customName || pm.name || 'Custom'}</div><div class="payment-grid">
        ${(pm.customFields || []).map(f => f.label && f.value ? `<div class="payment-row"><span class="payment-label">${f.label}:</span><span class="payment-value">${f.value}</span></div>` : '').join('')}
        ${pm.customDetails ? `<div class="payment-row"><span class="payment-value">${pm.customDetails}</span></div>` : ''}
      </div></div>`;
    }
  }
  html += '</div>';
  return html;
}

function getTemplateCSS(template) {
  if (!template || template === 'regular') {
    return `
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;flex-wrap:wrap;gap:15px}
.business-name{font-size:22px;font-weight:700;color:#1e40af;margin-bottom:6px;white-space:nowrap}
.invoice-badge{display:inline-block;padding:8px 20px;background:#3b82f6;color:white;border-radius:4px;font-size:18px;font-weight:700;margin-bottom:12px}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none;background:#3b82f6;color:white;padding:10px;border-radius:4px}`;
  }
  if (template === 'bold') {
    return `
.header{background:#1a1a2e;color:white;padding:24px;margin:-30px -40px 30px;border-radius:0}
.business-name{font-size:22px;font-weight:700;color:white;margin-bottom:6px;white-space:nowrap}
.business-details{color:rgba(255,255,255,0.7)}
.logo-img{filter:brightness(0) invert(1)}
.invoice-badge{display:inline-block;padding:8px 20px;background:#10b981;color:white;border-radius:4px;font-size:18px;font-weight:700;margin-bottom:12px}
.invoice-meta-label{color:rgba(255,255,255,0.6)}
.invoice-meta-value{color:white}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none;background:#1a1a2e;color:white;padding:10px;border-radius:4px}`;
  }
  if (template === 'mono') {
    return `
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;flex-wrap:wrap;gap:15px}
.business-name{font-size:22px;font-weight:700;color:#1f2937;margin-bottom:6px;white-space:nowrap}
.invoice-badge{display:inline-block;padding:8px 20px;background:#f3f4f6;color:#374151;border-radius:4px;font-size:18px;font-weight:700;margin-bottom:12px}
.invoice-meta-label{color:#6b7280}
.items-table th{background:#f9fafb}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none;background:#f9fafb;color:#1f2937;padding:10px;border-radius:4px}`;
  }
  // modern
  return `
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;flex-wrap:wrap;gap:15px}
.business-name{font-size:22px;font-weight:700;color:#1f2937;margin-bottom:6px;white-space:nowrap}
.invoice-badge{display:inline-block;padding:8px 20px;background:#3b82f6;color:white;border-radius:4px;font-size:18px;font-weight:700;margin-bottom:12px}
.items-table th{background:#eff6ff;border-color:#dbeafe}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none;background:#3b82f6;color:white;padding:10px;border-radius:4px}`;
}

/**
 * Generate full invoice HTML
 * @param {Object} invoice - invoice data object
 * @param {Object} options - { template, logoDataUrl }
 */
export async function generateInvoiceHTML(invoice, options = {}) {
  const template = options.template || invoice.selectedTemplate || 'regular';
  const logo = options.logoDataUrl || invoice.logoPreview || invoice.businessLogo || '';
  const sym = getCurrencySymbol(invoice.currency);
  const fmt = (amount) => `${sym}${(parseFloat(amount) || 0).toFixed(2)}`;
  const fmtDate = formatDateDefault;
  const { subtotal, discountAmount, taxAmount, shippingAmount, total } = calcTotals(invoice);
  const mode = invoice.invoiceMode || 'products';

  return `<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;padding:30px 40px;color:#1f2937;font-size:14px;line-height:1.5;background:white}
@media print{
  body{padding:0;margin:0}
  @page{margin:10mm;size:auto}
  html,body{width:100%;height:auto}
}
.business-info{max-width:450px}
.business-details{color:#6b7280;font-size:14px;line-height:1.8}
.logo-img{max-width:180px;max-height:70px;margin-bottom:12px}
.invoice-title{text-align:right}
.invoice-meta{text-align:right;font-size:14px;line-height:2}
.invoice-meta-row{margin-bottom:2px}
.invoice-meta-label{color:#3b82f6;font-weight:500}
.invoice-meta-value{color:#374151}
.issued-to{margin-bottom:25px}
.issued-to h3{font-size:15px;font-weight:700;color:#1f2937;margin-bottom:12px}
.issued-to-row{margin-bottom:5px;font-size:14px;color:#6b7280}
.issued-to-row strong{color:#1f2937;font-weight:600}
.items-table{width:100%;border-collapse:collapse;margin-bottom:20px}
.items-table th{background:#f1f5f9;text-align:left;padding:14px 16px;font-size:14px;color:#475569;font-weight:600;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}
.items-table th:nth-child(2),.items-table th:nth-child(3),.items-table th:nth-child(4){text-align:center}
.items-table th:last-child{text-align:right}
.items-table td{padding:16px;font-size:14px;border-bottom:1px solid #e2e8f0;color:#374151}
.items-table td:first-child{font-weight:600}
.items-table td:nth-child(2),.items-table td:nth-child(3),.items-table td:nth-child(4){text-align:center}
.items-table td:last-child{text-align:right}
.totals{display:flex;justify-content:flex-end;margin-bottom:20px}
.totals-box{width:300px;text-align:right}
.totals-row{display:flex;justify-content:space-between;padding:8px 0;font-size:14px;border-bottom:1px solid #f1f5f9}
.totals-row span:first-child{color:#6b7280}
.totals-row span:last-child{color:#374151}
.payment-details{margin-top:20px}
.payment-details h3{font-size:16px;font-weight:700;color:#1f2937;margin-bottom:16px}
.payment-section{margin-bottom:20px;padding-bottom:15px;border-bottom:1px solid #e2e8f0}
.payment-section:last-child{border-bottom:none}
.payment-method{font-size:15px;font-weight:600;color:#1f2937;margin-bottom:12px}
.payment-grid{font-size:13px;color:#6b7280;line-height:2}
.payment-grid-two-col{display:grid;grid-template-columns:1fr 1fr;gap:4px 30px;font-size:13px;color:#6b7280;line-height:2}
.payment-row{display:flex;gap:10px}
.payment-label{min-width:110px;font-weight:500;color:#4b5563}
.payment-value{color:#6b7280}
${getTemplateCSS(template)}
</style></head><body>

<div class="header">
<div class="business-info">
${logo ? `<img src="${logo}" class="logo-img" />` : ''}
<div class="business-name">${invoice.businessName || 'Your Business Name'}</div>
<div class="business-details">${invoice.businessAddress ? invoice.businessAddress + '<br>' : ''}${invoice.businessEmail ? invoice.businessEmail + '<br>' : ''}${invoice.businessPhone || ''}</div>
</div>
<div class="invoice-title">
<div class="invoice-badge">INVOICE</div>
<div class="invoice-meta">
<div class="invoice-meta-row"><span class="invoice-meta-label">Invoice Number</span> <span class="invoice-meta-value">${invoice.invoiceNumber}</span></div>
<div class="invoice-meta-row"><span class="invoice-meta-label">Issue Date:</span> <span class="invoice-meta-value">${fmtDate(invoice.issueDate)}</span></div>
${invoice.dueDate ? `<div class="invoice-meta-row"><span class="invoice-meta-label">Due Date:</span> <span class="invoice-meta-value">${fmtDate(invoice.dueDate)}</span></div>` : ''}
${invoice.paymentTermsText ? `<div class="invoice-meta-row"><span class="invoice-meta-label">Terms:</span> <span class="invoice-meta-value">${invoice.paymentTermsText}</span></div>` : ''}
${(invoice.customFields || []).map(f => f.label && f.value ? `<div class="invoice-meta-row"><span class="invoice-meta-label">${f.label}:</span> <span class="invoice-meta-value">${f.value}</span></div>` : '').join('')}
</div>
</div>
</div>

<div class="issued-to">
<h3>Issued To:</h3>
<div class="issued-to-row"><strong>Name:</strong> ${invoice.customerName || ''}</div>
${invoice.customerIdentifier ? `<div class="issued-to-row"><strong>ID:</strong> ${invoice.customerIdentifier}</div>` : ''}
<div class="issued-to-row"><strong>Address:</strong> ${invoice.customerAddress || ''}${invoice.customerZipCode ? `, ${invoice.customerZipCode}` : ''}</div>
${invoice.customerPhone ? `<div class="issued-to-row"><strong>Phone:</strong> ${invoice.customerPhone}</div>` : ''}
${invoice.customerEmail ? `<div class="issued-to-row"><strong>Email:</strong> ${invoice.customerEmail}</div>` : ''}
</div>

<table class="items-table">
<thead><tr>
<th style="width:${mode === 'hours' ? '40%' : '35%'}">${mode === 'hours' ? 'Service' : 'Product'}</th>
${mode === 'products' ? '<th style="width:15%">SKU</th>' : ''}
<th style="width:12%">${mode === 'hours' ? 'Hours' : 'Qty'}</th>
<th style="width:18%">${mode === 'hours' ? 'Rate' : 'Price'}</th>
<th style="width:18%">Amount</th>
</tr></thead>
<tbody>${(invoice.items || []).map(item => `<tr>
<td>${item.description || ''}</td>
${mode === 'products' ? `<td>${item.sku || ''}</td>` : ''}
<td>${mode === 'hours' ? item.hours : item.quantity}</td>
<td>${fmt(mode === 'hours' ? item.rate : item.price)}</td>
<td>${fmt(getItemTotal(item, mode))}</td>
</tr>`).join('')}</tbody>
</table>

<div class="totals">
<div class="totals-box">
<div class="totals-row"><span>Subtotal:</span><span>${fmt(subtotal)}</span></div>
${discountAmount > 0 ? `<div class="totals-row"><span>Discount:</span><span>-${fmt(discountAmount)}</span></div>` : ''}
${!invoice.taxIncluded && taxAmount > 0 ? `<div class="totals-row"><span>Tax ${invoice.taxType === 'percent' ? `(${invoice.taxRate}%)` : ''}:</span><span>${fmt(taxAmount)}</span></div>` : ''}
${invoice.taxIncluded && invoice.taxRate > 0 ? `<div class="totals-row"><span>Tax (included):</span><span>${invoice.taxType === 'percent' ? `${invoice.taxRate}%` : fmt(invoice.taxRate)}</span></div>` : ''}
${shippingAmount > 0 ? `<div class="totals-row"><span>Shipping:</span><span>${fmt(shippingAmount)}</span></div>` : ''}
<div class="totals-row total"><span>Total:</span><span>${fmt(total)}</span></div>
</div>
</div>

${await generatePaymentHTML(invoice)}

${invoice.endMessage ? `<div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;font-size:13px;color:#6b7280;line-height:1.5">${invoice.endMessage}</div>` : ''}

</body></html>`;
}

/**
 * Open invoice in a new tab for viewing
 */
export async function viewInvoicePDF(invoice, options = {}) {
  const html = await generateInvoiceHTML(invoice, options);
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  }
}

/**
 * Download invoice as PDF via browser print dialog
 */
export async function downloadInvoicePDF(invoice, options = {}) {
  const html = await generateInvoiceHTML(invoice, options);
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = 'none';
  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentWindow || printFrame.contentDocument;
  const doc = frameDoc.document || frameDoc;
  doc.open();
  doc.write(html);
  doc.close();

  printFrame.onload = () => {
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 500);
  };
}
