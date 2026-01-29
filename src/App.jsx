import React, { useState } from 'react';

const defaultInvoice = {
  businessName: '', businessEmail: '', businessAddress: '', businessPhone: '', businessLogo: null,
  customerName: '', customerAddress: '', customerZipCode: '',
  invoiceNumber: 'INV-001', issueDate: new Date().toISOString().split('T')[0], dueDate: '', paymentTerms: 'Within 30 Days',
  items: [{ id: 1, description: '', quantity: 1, price: 0 }],
  paymentMethod: 'Bank', bankName: '', branchName: '', bankAddress: '', accountName: '', accountNumber: '', routingNumber: '', sortCode: '', swift: '', iban: '',
  currency: 'USD'
};

const currencies = [
  { code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' },
  { code: 'CAD', symbol: 'C$' }, { code: 'AUD', symbol: 'A$' }, { code: 'JPY', symbol: '¥' }, { code: 'INR', symbol: '₹' },
];

const paymentTermsOptions = ['Due on Receipt', 'Within 7 Days', 'Within 14 Days', 'Within 30 Days', 'Within 45 Days', 'Within 60 Days', 'Within 90 Days'];

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState(defaultInvoice);
  const [logoPreview, setLogoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('business');

  const currencySymbol = currencies.find(c => c.code === invoice.currency)?.symbol || '$';
  const updateField = (field, value) => setInvoice(prev => ({ ...prev, [field]: value }));
  const updateItem = (id, field, value) => setInvoice(prev => ({ ...prev, items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item) }));
  const addItem = () => { const newId = Math.max(...invoice.items.map(i => i.id)) + 1; setInvoice(prev => ({ ...prev, items: [...prev.items, { id: newId, description: '', quantity: 1, price: 0 }] })); };
  const removeItem = (id) => { if (invoice.items.length > 1) setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) })); };
  const handleLogoUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setLogoPreview(reader.result); updateField('businessLogo', reader.result); }; reader.readAsDataURL(file); } };

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const formatCurrency = (amount) => `${currencySymbol}${amount.toFixed(2)}`;
  const formatDate = (dateStr) => { if (!dateStr) return ''; return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); };

const downloadPDF = () => {
  const printWindow = window.open('', '_blank');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { height: 100%; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color:#111827;
      font-size: 12px;
      line-height: 1.35;
    }

    /* A4 + margins like the sample */
    @page { size: A4; margin: 56px 56px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }

    .row { display:flex; justify-content:space-between; align-items:flex-start; gap: 24px; }
    .muted { color:#6b7280; }
    .rule { height:1px; background:#e5e7eb; width:100%; }

    /* Header */
    .header { padding-top: 6px; }
    .biz-name { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
    .biz-lines div { margin: 2px 0; font-size: 12px; color:#6b7280; }

    .inv-title { font-size: 18px; font-weight: 700; letter-spacing: .4px; text-align:right; margin-bottom: 4px; }
    .meta { text-align:right; font-size: 12px; line-height: 1.5; }
    .meta .label { font-weight: 700; color:#6b7280; }
    .meta .value { font-weight: 700; color:#374151; }
    .meta .rowline { margin: 1px 0; }

    /* Issued to */
    .section { margin-top: 18px; }
    .section-title { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
    .issued { padding: 10px 0 12px 0; }
    .issued .line { margin: 3px 0; font-size: 12px; }
    .issued .line strong { color:#111827; }

    /* Table */
    table { width:100%; border-collapse:collapse; margin-top: 16px; }
    thead th {
      background:#f3f4f6;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      padding: 10px 12px;
      font-size: 12px;
      text-align:left;
      font-weight: 700;
      color:#111827;
    }
    tbody td {
      padding: 12px 12px;
      border-bottom: 1px solid #eef2f7;
      font-size: 12px;
      color:#111827;
    }
    td.center, th.center { text-align:center; }
    td.right, th.right { text-align:right; }
    tbody td.product { font-weight: 700; }

    /* Totals */
    .totals-wrap {
      display:flex;
      justify-content:flex-end;
      margin-top: 64px;   /* creates the same whitespace gap as the sample */
    }
    .totals {
      min-width: 260px;
    }
    .totals .trow {
      display:flex;
      justify-content:space-between;
      align-items:baseline;
      padding: 6px 0;
      font-size: 13px;
    }
    .totals .trow .tlabel { font-weight: 700; color:#111827; }
    .totals .trow .tval { font-weight: 400; color:#111827; }
    .totals .trow.total {
      padding-top: 10px;
      font-size: 16px;
    }
    .totals .trow.total .tlabel { font-weight: 700; }
    .totals .trow.total .tval { font-weight: 700; }

    /* Payment */
    .payment { margin-top: 18px; padding-top: 16px; }
    .payment h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
    .payment .method { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
    .pay-grid { font-size: 12px; }
    .pay-row { display:flex; gap: 12px; margin: 2px 0; }
    .pay-label { width: 95px; color:#111827; }
    .pay-value { color:#111827; }
  </style>
</head>

<body>
  <!-- HEADER -->
  <div class="header row">
    <div style="max-width: 60%;">
      ${logoPreview ? `<img src="${logoPreview}" style="max-width:160px; max-height:60px; margin-bottom:10px;" />` : ``}
      <div class="biz-name">${invoice.businessName || "Your Business Name"}</div>
      <div class="biz-lines">
        ${invoice.businessAddress ? `<div>${invoice.businessAddress}</div>` : ``}
        ${invoice.businessEmail ? `<div>${invoice.businessEmail}</div>` : ``}
        ${invoice.businessPhone ? `<div>${invoice.businessPhone}</div>` : ``}
      </div>
    </div>

    <div style="min-width: 260px;">
      <div class="inv-title">INVOICE</div>
      <div class="meta">
        <div class="rowline"><span class="label">Invoice #:</span> <span class="value">${invoice.invoiceNumber}</span></div>
        <div class="rowline"><span class="label">Issue Date:</span> <span class="value">${formatDate(invoice.issueDate)}</span></div>
        <div class="rowline"><span class="label">Due Date:</span> <span class="value">${formatDate(invoice.dueDate) || "On Receipt"}</span></div>
        <div class="rowline"><span class="label">Terms of Payment:</span> <span class="value">${invoice.paymentTerms}</span></div>
      </div>
    </div>
  </div>

  <div style="margin-top: 18px;" class="rule"></div>

  <!-- ISSUED TO -->
  <div class="section issued">
    <div class="section-title">Issued To:</div>
    <div class="line"><strong>Name:</strong> ${invoice.customerName || ""}</div>
    <div class="line"><span class="muted">Address:</span> <span class="muted">${invoice.customerAddress || ""}</span></div>
    <div class="line"><span class="muted">Zip Code:</span> <span class="muted">${invoice.customerZipCode || ""}</span></div>
  </div>

  <div class="rule"></div>

  <!-- ITEMS TABLE -->
  <table>
    <thead>
      <tr>
        <th style="width:50%;">Product</th>
        <th class="center" style="width:12%;">Qty</th>
        <th class="right" style="width:19%;">Unit Price</th>
        <th class="right" style="width:19%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${
        invoice.items.map(item => `
          <tr>
            <td class="product">${item.description || ""}</td>
            <td class="center">${item.quantity}</td>
            <td class="right">${formatCurrency(item.price)}</td>
            <td class="right">${formatCurrency(item.quantity * item.price)}</td>
          </tr>
        `).join("")
      }
    </tbody>
  </table>

  <!-- TOTALS -->
  <div class="totals-wrap">
    <div class="totals">
      <div class="trow"><div class="tlabel">Subtotal:</div><div class="tval">${formatCurrency(subtotal)}</div></div>
      <div class="trow total"><div class="tlabel">Total:</div><div class="tval">${formatCurrency(subtotal)}</div></div>
    </div>
  </div>

  <div style="margin-top: 18px;" class="rule"></div>

  <!-- PAYMENT DETAILS -->
  <div class="payment">
    <h3>Payment Details</h3>
    <div class="method">Method: ${invoice.paymentMethod}</div>

    <div class="pay-grid">
      <div class="pay-row"><div class="pay-label">Bank:</div><div class="pay-value">${invoice.bankName || ""}</div></div>
      <div class="pay-row"><div class="pay-label">Branch:</div><div class="pay-value">${invoice.branchName || ""}</div></div>
      <div class="pay-row"><div class="pay-label">Address:</div><div class="pay-value">${invoice.bankAddress || ""}</div></div>
      <div class="pay-row"><div class="pay-label">Account Name:</div><div class="pay-value">${invoice.accountName || ""}</div></div>
      <div class="pay-row"><div class="pay-label">Account #:</div><div class="pay-value">${invoice.accountNumber || ""}</div></div>
      <div class="pay-row"><div class="pay-label">Routing #:</div><div class="pay-value">${invoice.routingNumber || ""}</div></div>
      <div class="pay-row"><div class="pay-label">Sort Code #:</div><div class="pay-value">${invoice.sortCode || ""}</div></div>
      <div class="pay-row"><div class="pay-label">SWIFT:</div><div class="pay-value">${invoice.swift || ""}</div></div>
      <div class="pay-row"><div class="pay-label">IBAN:</div><div class="pay-value">${invoice.iban || ""}</div></div>
    </div>
  </div>

</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
};


  const tabs = [
    { id: 'business', label: 'Business', icon: '🏢' },
    { id: 'customer', label: 'Customer', icon: '👤' },
    { id: 'invoice', label: 'Details', icon: '📄' },
    { id: 'items', label: 'Items', icon: '📋' },
    { id: 'payment', label: 'Payment', icon: '💳' },
  ];

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter, sans-serif', background: 'white', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input, select, textarea { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Invoice Generator</h1>
            <p style={{ color: '#6b7280', fontSize: '13px' }}>Create professional invoices</p>
          </div>
          <button onClick={downloadPDF} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Panel */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', width: '100%', maxWidth: '450px', minWidth: '320px', flex: '1 1 400px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 14px', background: 'transparent', border: 'none', fontSize: '12px', fontWeight: '500', color: activeTab === tab.id ? '#2563eb' : '#6b7280', cursor: 'pointer', borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '20px' }}>
            {activeTab === 'business' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Logo</label>
                  <label style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', display: 'block', background: '#f9fafb' }}>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    {logoPreview ? <img src={logoPreview} alt="Logo" style={{ maxWidth: '120px', maxHeight: '60px' }} /> : <div style={{ color: '#6b7280', fontSize: '13px' }}>📷 Click to upload</div>}
                  </label>
                </div>
                <div><label style={labelStyle}>Business Name</label><input style={inputStyle} placeholder="Your Company Name" value={invoice.businessName} onChange={(e) => updateField('businessName', e.target.value)} /></div>
                <div><label style={labelStyle}>Address</label><input style={inputStyle} placeholder="123 Business St, City, State" value={invoice.businessAddress} onChange={(e) => updateField('businessAddress', e.target.value)} /></div>
                <div><label style={labelStyle}>Email</label><input style={inputStyle} placeholder="billing@company.com" value={invoice.businessEmail} onChange={(e) => updateField('businessEmail', e.target.value)} /></div>
                <div><label style={labelStyle}>Phone</label><input style={inputStyle} placeholder="(555) 123-4567" value={invoice.businessPhone} onChange={(e) => updateField('businessPhone', e.target.value)} /></div>
              </div>
            )}

            {activeTab === 'customer' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div><label style={labelStyle}>Customer Name</label><input style={inputStyle} placeholder="Client Name or Company" value={invoice.customerName} onChange={(e) => updateField('customerName', e.target.value)} /></div>
                <div><label style={labelStyle}>Address</label><input style={inputStyle} placeholder="123 Client St, City, State" value={invoice.customerAddress} onChange={(e) => updateField('customerAddress', e.target.value)} /></div>
                <div><label style={labelStyle}>Zip Code</label><input style={inputStyle} placeholder="12345" value={invoice.customerZipCode} onChange={(e) => updateField('customerZipCode', e.target.value)} /></div>
              </div>
            )}

            {activeTab === 'invoice' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>Invoice #</label><input style={inputStyle} value={invoice.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} /></div>
                  <div><label style={labelStyle}>Currency</label><select style={inputStyle} value={invoice.currency} onChange={(e) => updateField('currency', e.target.value)}>{currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}</select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>Issue Date</label><input type="date" style={inputStyle} value={invoice.issueDate} onChange={(e) => updateField('issueDate', e.target.value)} /></div>
                  <div><label style={labelStyle}>Due Date</label><input type="date" style={inputStyle} value={invoice.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} /></div>
                </div>
                <div><label style={labelStyle}>Payment Terms</label><select style={inputStyle} value={invoice.paymentTerms} onChange={(e) => updateField('paymentTerms', e.target.value)}>{paymentTermsOptions.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
            )}

            {activeTab === 'items' && (
              <div>
                {invoice.items.map((item, idx) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 50px 70px 70px 32px', gap: '6px', alignItems: 'end', padding: '10px', background: '#f9fafb', borderRadius: '6px', marginBottom: '8px', border: '1px solid #e5e7eb' }}>
                    <div>{idx === 0 && <label style={labelStyle}>Product</label>}<input style={{...inputStyle, padding: '8px 10px', fontSize: '13px'}} placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} /></div>
                    <div>{idx === 0 && <label style={labelStyle}>Qty</label>}<input type="number" min="1" style={{...inputStyle, padding: '8px 6px', fontSize: '13px', textAlign: 'center'}} value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} /></div>
                    <div>{idx === 0 && <label style={labelStyle}>Price</label>}<input type="number" min="0" step="0.01" style={{...inputStyle, padding: '8px 6px', fontSize: '13px'}} placeholder="0.00" value={item.price || ''} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} /></div>
                    <div>{idx === 0 && <label style={labelStyle}>Total</label>}<input style={{ ...inputStyle, padding: '8px 6px', fontSize: '13px', background: '#f3f4f6', fontWeight: '500' }} value={formatCurrency(item.quantity * item.price)} disabled /></div>
                    <div>{idx === 0 && <label style={{ ...labelStyle, opacity: 0 }}>X</label>}<button onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} style={{ width: '100%', padding: '8px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: invoice.items.length === 1 ? 0.4 : 1, fontSize: '12px' }}>✕</button></div>
                  </div>
                ))}
                <button onClick={addItem} style={{ marginTop: '8px', padding: '10px 20px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>+ Add Item</button>
              </div>
            )}

            {activeTab === 'payment' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div><label style={labelStyle}>Payment Method</label><select style={inputStyle} value={invoice.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)}><option value="Bank">Bank Transfer</option><option value="Check">Check</option><option value="Cash">Cash</option><option value="PayPal">PayPal</option></select></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>Bank Name</label><input style={inputStyle} placeholder="Bank name" value={invoice.bankName} onChange={(e) => updateField('bankName', e.target.value)} /></div>
                  <div><label style={labelStyle}>Branch</label><input style={inputStyle} placeholder="Branch" value={invoice.branchName} onChange={(e) => updateField('branchName', e.target.value)} /></div>
                </div>
                <div><label style={labelStyle}>Bank Address</label><input style={inputStyle} placeholder="Bank address" value={invoice.bankAddress} onChange={(e) => updateField('bankAddress', e.target.value)} /></div>
                <div><label style={labelStyle}>Account Name</label><input style={inputStyle} placeholder="Account holder" value={invoice.accountName} onChange={(e) => updateField('accountName', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>Account #</label><input style={inputStyle} placeholder="Account number" value={invoice.accountNumber} onChange={(e) => updateField('accountNumber', e.target.value)} /></div>
                  <div><label style={labelStyle}>Routing #</label><input style={inputStyle} placeholder="Routing number" value={invoice.routingNumber} onChange={(e) => updateField('routingNumber', e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={labelStyle}>Sort Code</label><input style={inputStyle} placeholder="Sort code" value={invoice.sortCode} onChange={(e) => updateField('sortCode', e.target.value)} /></div>
                  <div><label style={labelStyle}>SWIFT</label><input style={inputStyle} placeholder="SWIFT" value={invoice.swift} onChange={(e) => updateField('swift', e.target.value)} /></div>
                </div>
                <div><label style={labelStyle}>IBAN</label><input style={inputStyle} placeholder="IBAN" value={invoice.iban} onChange={(e) => updateField('iban', e.target.value)} /></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', flex: '2 1 500px', minWidth: '320px' }}>
          <div style={{ background: '#f9fafb', padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Live Preview</span>
          </div>
          
          <div style={{ padding: '40px', minHeight: '600px', overflowX: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '45px', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ maxWidth: '350px', minWidth: '200px' }}>
                {logoPreview && <img src={logoPreview} alt="Logo" style={{ maxWidth: '150px', maxHeight: '60px', marginBottom: '12px' }} />}
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e40af', marginBottom: '8px' }}>{invoice.businessName || 'Your Business Name'}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
                  {invoice.businessAddress && <div>{invoice.businessAddress}</div>}
                  {invoice.businessEmail && <div>{invoice.businessEmail}</div>}
                  {invoice.businessPhone && <div>{invoice.businessPhone}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '200px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>INVOICE</div>
                <div style={{ fontSize: '13px', lineHeight: '2', textAlign: 'right' }}>
                  <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Invoice #:</span> <span style={{ color: '#374151' }}>{invoice.invoiceNumber}</span></div>
                  <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Issue Date:</span> <span style={{ color: '#374151' }}>{formatDate(invoice.issueDate)}</span></div>
                  <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Due Date:</span> <span style={{ color: '#374151' }}>{formatDate(invoice.dueDate) || 'On Receipt'}</span></div>
                  <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Terms of Payment:</span> <span style={{ color: '#374151' }}>{invoice.paymentTerms}</span></div>
                </div>
              </div>
            </div>

            {/* Issued To */}
            <div style={{ marginBottom: '35px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937', marginBottom: '10px' }}>Issued To:</div>
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '2' }}>
                <div><span style={{ fontWeight: '600', color: '#1f2937' }}>Name:</span> {invoice.customerName}</div>
                <div><span style={{ fontWeight: '600', color: '#1f2937' }}>Address:</span> {invoice.customerAddress}</div>
                <div><span style={{ fontWeight: '600', color: '#1f2937' }}>Zip Code:</span> {invoice.customerZipCode}</div>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ overflowX: 'auto', marginBottom: '25px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#f1f5f9', textAlign: 'left', padding: '12px 14px', fontSize: '13px', color: '#475569', fontWeight: '600', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>Product</th>
                    <th style={{ background: '#f1f5f9', textAlign: 'center', padding: '12px 14px', fontSize: '13px', color: '#475569', fontWeight: '600', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', width: '60px' }}>Qty</th>
                    <th style={{ background: '#f1f5f9', textAlign: 'right', padding: '12px 14px', fontSize: '13px', color: '#475569', fontWeight: '600', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', width: '100px' }}>Unit Price</th>
                    <th style={{ background: '#f1f5f9', textAlign: 'right', padding: '12px 14px', fontSize: '13px', color: '#475569', fontWeight: '600', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', width: '100px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: '14px', fontSize: '13px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#374151' }}>{item.description || ''}</td>
                      <td style={{ padding: '14px', fontSize: '13px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#374151' }}>{item.quantity}</td>
                      <td style={{ padding: '14px', fontSize: '13px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#374151' }}>{formatCurrency(item.price)}</td>
                      <td style={{ padding: '14px', fontSize: '13px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', color: '#374151' }}>{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
              <div style={{ width: '220px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}><span style={{ color: '#6b7280' }}>Subtotal:</span><span style={{ color: '#374151' }}>{formatCurrency(subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', fontWeight: '700' }}><span style={{ color: '#1f2937' }}>Total:</span><span style={{ color: '#1f2937' }}>{formatCurrency(subtotal)}</span></div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937', marginBottom: '14px' }}>Payment Details</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>Method: {invoice.paymentMethod}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '2' }}>
                <div><span style={{ fontWeight: '500', color: '#4b5563', display: 'inline-block', width: '95px' }}>Bank:</span> {invoice.bankName}</div>
                <div><span style={{ fontWeight: '500', color: '#4b5563', display: 'inline-block', width: '95px' }}>Branch:</span> {invoice.branchName}</div>
                <div><span style={{ fontWeight: '500', color: '#4b5563', display: 'inline-block', width: '95px' }}>Address:</span> {invoice.bankAddress}</div>
                <div><span style={{ fontWeight: '500', color: '#4b5563', display: 'inline-block', width: '95px' }}>Account Name:</span> {invoice.accountName}</div>
                <div><span style={{ fontWeight: '500', color: '#4b5563', display: 'inline-block', width: '95px' }}>Account #:</span> {invoice.accountNumber}</div>
                <div><span style={{ fontWeight: '500', color: '#4b5563', display: 'inline-block', width: '95px' }}>Routing #:</span> {invoice.routingNumber}</div>
                <div><span style={{ fontWeight: '500', color: '#4b5563', display: 'inline-block', width: '95px' }}>Sort Code #:</span> {invoice.sortCode}</div>
                <div><span style={{ fontWeight: '500', color: '#4b5563', display: 'inline-block', width: '95px' }}>SWIFT:</span> {invoice.swift}</div>
                <div><span style={{ fontWeight: '500', color: '#4b5563', display: 'inline-block', width: '95px' }}>IBAN:</span> {invoice.iban}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '13px' }}>Free to use • No signup required • Your data stays in your browser</div>
    </div>
  );
}
