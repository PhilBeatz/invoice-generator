import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedInvoice } from '../supabaseService';
import QRCode from 'qrcode';

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

function PaymentQRCode({ url, label, color }) {
  const [dataUrl, setDataUrl] = useState(null);
  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { width: 160, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then(setDataUrl)
      .catch(console.error);
  }, [url]);
  if (!dataUrl) return null;
  return React.createElement('div', { style: { textAlign: 'center', padding: '16px', background: '#fff', borderRadius: '8px', border: `1px solid ${color}40` } },
    React.createElement('img', { src: dataUrl, alt: `${label} QR Code`, style: { width: '140px', height: '140px' } }),
    React.createElement('div', { style: { fontSize: '13px', fontWeight: '600', color, marginTop: '8px' } }, `Pay with ${label}`),
    React.createElement('a', { href: url, target: '_blank', rel: 'noopener noreferrer', style: { fontSize: '12px', color, textDecoration: 'underline', display: 'block', marginTop: '4px' } }, `Open ${label}`)
  );
}

export default function SharedInvoiceView() {
  const { token } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [share, setShare] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadSharedInvoice = async (password = null) => {
    try {
      const result = await getSharedInvoice(token, password);
      if (result.error) {
        if (result.error === 'password_required') {
          setPasswordRequired(true);
          if (password) setPasswordError(true);
        } else {
          setError(result.error);
        }
      } else {
        setInvoice(result.invoice);
        setShare(result.share);
        setPasswordRequired(false);
        setPasswordError(false);
      }
    } catch (e) {
      console.error('Error loading shared invoice:', e);
      setError('notfound');
    }
    setLoading(false);
  };

  useEffect(() => { loadSharedInvoice(); }, [token]);

  const handlePasswordSubmit = () => {
    setLoading(true);
    loadSharedInvoice(passwordInput);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', INR: '₹' };
    return `${symbols[currency] || '$'}${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;

    const items = invoice.items || [];
    const isHours = invoice.invoiceMode === 'hours';

    const itemRows = items.map(item => {
      const qty = isHours ? item.hours : item.quantity;
      const price = isHours ? item.rate : item.price;
      const amt = (qty || 0) * (price || 0);
      return `<tr>
        <td style="padding:14px 16px;font-size:14px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1f2937">${item.description || 'Item'}${item.sku ? `<div style="font-size:11px;color:#9ca3af;margin-top:2px">SKU: ${item.sku}</div>` : ''}</td>
        <td style="padding:14px 16px;font-size:14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#6b7280">${qty}</td>
        <td style="padding:14px 16px;font-size:14px;border-bottom:1px solid #e2e8f0;text-align:right;color:#6b7280">${formatCurrency(price, invoice.currency)}</td>
        <td style="padding:14px 16px;font-size:14px;border-bottom:1px solid #e2e8f0;text-align:right;color:#1f2937;font-weight:500">${formatCurrency(amt, invoice.currency)}</td>
      </tr>`;
    }).join('');

    const paymentHtml = (invoice.paymentMethods && invoice.paymentMethods.length > 0)
      ? `<div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0">
          <div style="font-size:15px;font-weight:700;color:#1f2937;margin-bottom:14px">Payment Details</div>
          ${invoice.paymentMethods.map(m => `<div style="font-size:13px;color:#6b7280;margin-bottom:4px"><span style="font-weight:500;color:#374151">${m.label}:</span> ${m.value}</div>`).join('')}
        </div>`
      : '';

    const htmlContent = `<!DOCTYPE html><html><head>
      <title>Invoice ${invoice.invoiceNumber || ''}</title>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',sans-serif;padding:30px 40px;color:#1f2937;font-size:14px;line-height:1.5;background:white}
        @media print{body{padding:0;margin:0}@page{margin:10mm;size:auto}}
      </style>
    </head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;flex-wrap:wrap;gap:15px">
        <div>
          ${invoice.logoPreview ? `<img src="${invoice.logoPreview}" style="max-width:180px;max-height:70px;margin-bottom:12px" />` : ''}
          <div style="font-size:22px;font-weight:700;color:#1e40af;margin-bottom:6px">${invoice.businessName || 'Company'}</div>
          <div style="color:#6b7280;font-size:14px;line-height:1.8">
            ${invoice.businessAddress ? invoice.businessAddress + '<br>' : ''}
            ${invoice.businessEmail ? invoice.businessEmail + '<br>' : ''}
            ${invoice.businessPhone || ''}
          </div>
        </div>
        <div style="text-align:right">
          <div style="display:inline-block;padding:8px 20px;background:#3b82f6;color:white;border-radius:4px;font-size:18px;font-weight:700;margin-bottom:12px">INVOICE</div>
          <div style="font-size:14px;line-height:2">
            <div><span style="color:#3b82f6;font-weight:500">Invoice #:</span> ${invoice.invoiceNumber || ''}</div>
            <div><span style="color:#3b82f6;font-weight:500">Issue Date:</span> ${formatDate(invoice.issueDate || invoice.createdAt)}</div>
            ${invoice.dueDate ? `<div><span style="color:#3b82f6;font-weight:500">Due Date:</span> ${formatDate(invoice.dueDate)}</div>` : ''}
          </div>
        </div>
      </div>

      <div style="margin-bottom:25px">
        <h3 style="font-size:15px;font-weight:700;color:#1f2937;margin-bottom:12px">Issued To:</h3>
        <div style="font-size:14px;color:#6b7280;line-height:1.8">
          <div><strong style="color:#1f2937">${invoice.customerName || 'Customer'}</strong></div>
          ${invoice.customerAddress ? `<div>${invoice.customerAddress}${invoice.customerZipCode ? `, ${invoice.customerZipCode}` : ''}</div>` : ''}
          ${invoice.customerEmail ? `<div>Email: ${invoice.customerEmail}</div>` : ''}
          ${invoice.customerPhone ? `<div>Phone: ${invoice.customerPhone}</div>` : ''}
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <thead><tr>
          <th style="text-align:left;padding:14px 16px;background:#f1f5f9;color:#475569;font-size:14px;font-weight:600;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">${isHours ? 'Service' : 'Product'}</th>
          <th style="text-align:center;padding:14px 16px;background:#f1f5f9;color:#475569;font-size:14px;font-weight:600;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">${isHours ? 'Hrs' : 'Qty'}</th>
          <th style="text-align:right;padding:14px 16px;background:#f1f5f9;color:#475569;font-size:14px;font-weight:600;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">${isHours ? 'Rate' : 'Unit Price'}</th>
          <th style="text-align:right;padding:14px 16px;background:#f1f5f9;color:#475569;font-size:14px;font-weight:600;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">Amount</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="display:flex;justify-content:flex-end;margin-bottom:20px">
        <div style="width:280px">
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;border-bottom:1px solid #f1f5f9">
            <span style="color:#6b7280">Subtotal:</span>
            <span style="color:#374151">${formatCurrency(invoice.subtotal || invoice.total, invoice.currency)}</span>
          </div>
          ${invoice.discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;border-bottom:1px solid #f1f5f9"><span style="color:#6b7280">Discount:</span><span style="color:#dc2626">-${formatCurrency(invoice.discountAmount, invoice.currency)}</span></div>` : ''}
          ${invoice.taxAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:14px;border-bottom:1px solid #f1f5f9"><span style="color:#6b7280">Tax:</span><span style="color:#374151">${formatCurrency(invoice.taxAmount, invoice.currency)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:10px 14px;background:#f8fafc;border-radius:6px;margin-top:6px;font-weight:700;font-size:16px">
            <span style="color:#1f2937">Total:</span>
            <span style="color:#1f2937">${formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      ${paymentHtml}

      ${invoice.endMessage ? `<div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;text-align:center"><p style="font-size:14px;color:#6b7280;margin:0;font-style:italic">${invoice.endMessage}</p></div>` : ''}
    </body></html>`;

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
    doc.write(htmlContent);
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
  };

  const pageStyle = { minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ marginTop: '120px', textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errors = {
      notfound: { icon: '🔍', title: 'Invoice Not Found', msg: 'This share link is invalid or the invoice no longer exists.' },
      expired: { icon: '⏰', title: 'Link Expired', msg: 'This share link has expired and is no longer accessible.' },
      viewlimit: { icon: '👁️', title: 'View Limit Reached', msg: 'This share link has reached its maximum number of views.' },
      revoked: { icon: '🚫', title: 'Link Revoked', msg: 'This share link has been revoked by the invoice owner.' },
    };
    const e = errors[error] || errors.notfound;
    return (
      <div style={pageStyle}>
        <div style={{ marginTop: '80px', textAlign: 'center', maxWidth: '420px', background: '#fff', borderRadius: '12px', padding: '48px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{e.icon}</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>{e.title}</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>{e.msg}</p>
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '32px' }}>Powered by Day One Tools</p>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div style={pageStyle}>
        <div style={{ marginTop: '80px', textAlign: 'center', maxWidth: '400px', background: '#fff', borderRadius: '12px', padding: '40px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>Password Protected</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>This invoice is protected. Enter the password to view it.</p>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input type={showPassword ? 'text' : 'password'} value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }} onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} placeholder="Enter password" style={{ width: '100%', padding: '12px 42px 12px 16px', border: `2px solid ${passwordError ? '#ef4444' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }} />
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
          </div>
          {passwordError && <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '12px' }}>Incorrect password. Please try again.</p>}
          <button onClick={handlePasswordSubmit} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>View Invoice</button>
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '32px' }}>Powered by Day One Tools</p>
      </div>
    );
  }

  if (!invoice) return null;

  const statusInfo = [];
  if (share?.view_limit) statusInfo.push(`${share.view_count || 0} / ${share.view_limit} views`);
  if (!share?.expires_at) statusInfo.push('No expiration');
  else statusInfo.push(`Expires ${formatDate(share.expires_at)}`);

  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>{statusInfo.join(' • ')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={handleDownloadPDF} style={{ padding: '6px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>📥 Download PDF</button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>✓ Access Granted</span>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '36px 40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                {invoice.logoPreview && <img src={invoice.logoPreview} alt="Logo" style={{ maxWidth: '160px', maxHeight: '60px', marginBottom: '10px' }} />}
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>{invoice.businessName || 'Company'}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.7' }}>
                  {invoice.businessAddress && <div>{invoice.businessAddress}</div>}
                  {invoice.businessEmail && <div>{invoice.businessEmail}</div>}
                  {invoice.businessPhone && <div>{invoice.businessPhone}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-block', padding: '8px 20px', background: '#3b82f6', color: '#fff', borderRadius: '6px', fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>INVOICE</div>
                <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#4b5563' }}>
                  <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Invoice #:</span> {invoice.invoiceNumber}</div>
                  <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Issue Date:</span> {formatDate(invoice.issueDate || invoice.createdAt)}</div>
                  {invoice.dueDate && <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Due Date:</span> {formatDate(invoice.dueDate)}</div>}
                </div>
              </div>
            </div>

            {/* Issued To */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>Issued To:</div>
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '600', color: '#374151' }}>{invoice.customerName || 'Customer'}</div>
                {invoice.customerAddress && <div>{invoice.customerAddress}{invoice.customerZipCode ? `, ${invoice.customerZipCode}` : ''}</div>}
                {invoice.customerEmail && <div>Email: {invoice.customerEmail}</div>}
                {invoice.customerPhone && <div>Phone: {invoice.customerPhone}</div>}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 14px', background: '#f8fafc', color: '#475569', fontWeight: '600', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>{invoice.invoiceMode === 'hours' ? 'Service' : 'Product'}</th>
                  <th style={{ textAlign: 'center', padding: '12px 14px', background: '#f8fafc', color: '#475569', fontWeight: '600', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', width: '70px' }}>{invoice.invoiceMode === 'hours' ? 'Hrs' : 'Qty'}</th>
                  <th style={{ textAlign: 'right', padding: '12px 14px', background: '#f8fafc', color: '#475569', fontWeight: '600', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', width: '100px' }}>{invoice.invoiceMode === 'hours' ? 'Rate' : 'Unit Price'}</th>
                  <th style={{ textAlign: 'right', padding: '12px 14px', background: '#f8fafc', color: '#475569', fontWeight: '600', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', width: '100px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, idx) => {
                  const qty = invoice.invoiceMode === 'hours' ? item.hours : item.quantity;
                  const price = invoice.invoiceMode === 'hours' ? item.rate : item.price;
                  const amt = (qty || 0) * (price || 0);
                  return (
                    <tr key={idx}>
                      <td style={{ padding: '14px', borderBottom: '1px solid #f1f5f9', fontWeight: '500', color: '#1f2937' }}>{item.description || 'Item'}{item.sku && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>SKU: {item.sku}</div>}</td>
                      <td style={{ padding: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', color: '#6b7280' }}>{qty}</td>
                      <td style={{ padding: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#6b7280' }}>{formatCurrency(price, invoice.currency)}</td>
                      <td style={{ padding: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#1f2937', fontWeight: '500' }}>{formatCurrency(amt, invoice.currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '260px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal:</span>
                  <span style={{ color: '#374151' }}>{formatCurrency(invoice.subtotal || invoice.total, invoice.currency)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#6b7280' }}>Discount:</span>
                    <span style={{ color: '#dc2626' }}>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#6b7280' }}>Tax:</span>
                    <span style={{ color: '#374151' }}>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', marginTop: '6px', fontWeight: '700', fontSize: '16px' }}>
                  <span style={{ color: '#1f2937' }}>Total:</span>
                  <span style={{ color: '#1f2937' }}>{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            {invoice.paymentMethods && invoice.paymentMethods.length > 0 && (
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>Payment Details</div>
                {invoice.paymentMethods.map((method, idx) => (
                  <div key={idx} style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>{method.label}:</span> {method.value}
                  </div>
                ))}
              </div>
            )}

            {invoice.endMessage && (
              <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, fontStyle: 'italic' }}>{invoice.endMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Customer</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{invoice.customerName || '—'}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Issued</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{formatDate(invoice.issueDate || invoice.createdAt)}</div>
          </div>
          {invoice.businessName && (
            <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Organization</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{invoice.businessName}</div>
            </div>
          )}
          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>STATUS</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {share?.view_limit && <span style={{ padding: '4px 10px', background: '#f3f4f6', color: '#6b7280', borderRadius: '4px', fontSize: '12px' }}>{share.view_count || 0} / {share.view_limit} views</span>}
              <span style={{ padding: '4px 10px', background: '#f3f4f6', color: '#6b7280', borderRadius: '4px', fontSize: '12px' }}>{share?.expires_at ? `Expires ${formatDate(share.expires_at)}` : 'No expiration'}</span>
            </div>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a', marginBottom: '4px' }}>✓ Access Granted</div>
            <div style={{ fontSize: '12px', color: '#4ade80', marginBottom: '12px' }}>You can view and download this invoice.</div>
            <button onClick={handleDownloadPDF} style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>📥 Download PDF</button>
          </div>
          {invoice.paymentMethods && invoice.paymentMethods.filter(pm => pm.type === 'venmo' || pm.type === 'cashapp').map((pm, idx) => {
            const url = getPaymentUrl(pm, invoice.total || 0, invoice.invoiceNumber);
            if (!url) return null;
            const label = pm.type === 'venmo' ? 'Venmo' : 'Cash App';
            const color = pm.type === 'venmo' ? '#008CFF' : '#00D632';
            return React.createElement(PaymentQRCode, { key: idx, url, label, color });
          })}
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '32px' }}>Powered by Day One Tools</p>
    </div>
  );
}
