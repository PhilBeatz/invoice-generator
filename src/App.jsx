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
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;padding:50px 60px;color:#1f2937;font-size:14px;line-height:1.6}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:35px;padding-bottom:25px;border-bottom:2px solid #d1d5db}
.business-info{max-width:320px}
.business-name{font-size:22px;font-weight:700;color:#111827;margin-bottom:10px}
.business-details{color:#4b5563;font-size:14px;line-height:1.7}
.logo-img{max-width:150px;max-height:60px;margin-bottom:12px}
.invoice-title h1{font-size:36px;font-weight:700;color:#111827;text-align:right;letter-spacing:-0.5px}
.invoice-meta{margin-top:15px;text-align:right;font-size:14px}
.invoice-meta-row{margin-bottom:6px}
.invoice-meta-label{color:#4b5563}
.invoice-meta-value{color:#111827;font-weight:500}
.issued-to{margin-bottom:35px}
.issued-to h3{font-size:14px;color:#111827;margin-bottom:14px;font-weight:600}
.issued-to-row{display:flex;margin-bottom:8px;font-size:14px}
.issued-to-label{width:85px;color:#4b5563}
.issued-to-value{color:#111827;font-weight:500}
.items-table{width:100%;border-collapse:collapse;margin-bottom:25px}
.items-table th{background:#f3f4f6;text-align:left;padding:14px 18px;font-size:13px;color:#374151;font-weight:600;border:1px solid #d1d5db}
.items-table th:nth-child(2),.items-table th:nth-child(3),.items-table th:nth-child(4){text-align:right}
.items-table td{padding:16px 18px;border:1px solid #d1d5db;font-size:14px}
.items-table td:nth-child(2),.items-table td:nth-child(3),.items-table td:nth-child(4){text-align:right}
.totals{display:flex;justify-content:flex-end;margin-bottom:35px}
.totals-box{width:300px}
.totals-row{display:flex;justify-content:space-between;padding:10px 0;font-size:14px;border-bottom:1px solid #e5e7eb}
.totals-row:last-child{border-bottom:none;padding-top:12px}
.totals-row.total{font-size:16px;font-weight:700}
.payment-details{margin-top:30px}
.payment-details h3{font-size:14px;color:#111827;margin-bottom:14px;font-weight:600}
.payment-grid{display:grid;grid-template-columns:1fr;gap:8px}
.payment-row{display:flex;font-size:14px}
.payment-label{width:110px;color:#4b5563}
.payment-value{color:#111827}
@media print{body{padding:0}@page{margin:50px 60px}}
</style></head><body>
<div class="header">
<div class="business-info">
${logoPreview ? `<img src="${logoPreview}" class="logo-img" />` : ''}
<div class="business-name">${invoice.businessName || 'Your Business Name'}</div>
<div class="business-details">${invoice.businessAddress ? invoice.businessAddress + '<br>' : ''}${invoice.businessEmail ? invoice.businessEmail + '<br>' : ''}${invoice.businessPhone || ''}</div>
</div>
<div class="invoice-title"><h1>INVOICE</h1>
<div class="invoice-meta">
<div class="invoice-meta-row"><span class="invoice-meta-label">Invoice #: </span><span class="invoice-meta-value">${invoice.invoiceNumber}</span></div>
<div class="invoice-meta-row"><span class="invoice-meta-label">Issue Date: </span><span class="invoice-meta-value">${formatDate(invoice.issueDate)}</span></div>
<div class="invoice-meta-row"><span class="invoice-meta-label">Due Date: </span><span class="invoice-meta-value">${formatDate(invoice.dueDate) || 'On Receipt'}</span></div>
<div class="invoice-meta-row"><span class="invoice-meta-label">Terms of Payment: </span><span class="invoice-meta-value">${invoice.paymentTerms}</span></div>
</div></div></div>
<div class="issued-to"><h3>Issued To:</h3>
<div class="issued-to-row"><span class="issued-to-label">Name:</span><span class="issued-to-value">${invoice.customerName || ''}</span></div>
<div class="issued-to-row"><span class="issued-to-label">Address:</span><span class="issued-to-value">${invoice.customerAddress || ''}</span></div>
<div class="issued-to-row"><span class="issued-to-label">Zip Code:</span><span class="issued-to-value">${invoice.customerZipCode || ''}</span></div>
</div>
<table class="items-table"><thead><tr><th style="width:50%">Product</th><th style="width:12%">Qty</th><th style="width:19%">Unit Price</th><th style="width:19%">Amount</th></tr></thead>
<tbody>${invoice.items.map(item => `<tr><td>${item.description || ''}</td><td>${item.quantity}</td><td>${formatCurrency(item.price)}</td><td>${formatCurrency(item.quantity * item.price)}</td></tr>`).join('')}</tbody></table>
<div class="totals"><div class="totals-box">
<div class="totals-row"><span>Subtotal:</span><span>${formatCurrency(subtotal)}</span></div>
<div class="totals-row total"><span>Total:</span><span>${formatCurrency(subtotal)}</span></div>
</div></div>
<div class="payment-details"><h3>Payment Details</h3>
<div class="payment-grid">
<div class="payment-row"><span class="payment-label">Method:</span><span class="payment-value">${invoice.paymentMethod}</span></div>
<div class="payment-row"><span class="payment-label">Bank:</span><span class="payment-value">${invoice.bankName}</span></div>
<div class="payment-row"><span class="payment-label">Branch:</span><span class="payment-value">${invoice.branchName}</span></div>
<div class="payment-row"><span class="payment-label">Address:</span><span class="payment-value">${invoice.bankAddress}</span></div>
<div class="payment-row"><span class="payment-label">Account Name:</span><span class="payment-value">${invoice.accountName}</span></div>
<div class="payment-row"><span class="payment-label">Account #:</span><span class="payment-value">${invoice.accountNumber}</span></div>
<div class="payment-row"><span class="payment-label">Routing #:</span><span class="payment-value">${invoice.routingNumber}</span></div>
<div class="payment-row"><span class="payment-label">Sort Code #:</span><span class="payment-value">${invoice.sortCode}</span></div>
<div class="payment-row"><span class="payment-label">SWIFT:</span><span class="payment-value">${invoice.swift}</span></div>
<div class="payment-row"><span class="payment-label">IBAN:</span><span class="payment-value">${invoice.iban}</span></div>
</div></div></body></html>`);
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

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter, sans-serif', background: 'white' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 32px', display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Panel */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 14px', background: 'transparent', border: 'none', fontSize: '12px', fontWeight: '500', color: activeTab === tab.id ? '#2563eb' : '#6b7280', cursor: 'pointer', borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={labelStyle}>Invoice #</label><input style={inputStyle} value={invoice.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} /></div>
                  <div><label style={labelStyle}>Currency</label><select style={inputStyle} value={invoice.currency} onChange={(e) => updateField('currency', e.target.value)}>{currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}</select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={labelStyle}>Issue Date</label><input type="date" style={inputStyle} value={invoice.issueDate} onChange={(e) => updateField('issueDate', e.target.value)} /></div>
                  <div><label style={labelStyle}>Due Date</label><input type="date" style={inputStyle} value={invoice.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} /></div>
                </div>
                <div><label style={labelStyle}>Payment Terms</label><select style={inputStyle} value={invoice.paymentTerms} onChange={(e) => updateField('paymentTerms', e.target.value)}>{paymentTermsOptions.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
            )}

            {activeTab === 'items' && (
              <div>
                {invoice.items.map((item, idx) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px 36px', gap: '8px', alignItems: 'end', padding: '12px', background: '#f9fafb', borderRadius: '6px', marginBottom: '8px', border: '1px solid #e5e7eb' }}>
                    <div>{idx === 0 && <label style={labelStyle}>Product</label>}<input style={inputStyle} placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} /></div>
                    <div>{idx === 0 && <label style={labelStyle}>Qty</label>}<input type="number" min="1" style={inputStyle} value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} /></div>
                    <div>{idx === 0 && <label style={labelStyle}>Price</label>}<input type="number" min="0" step="0.01" style={inputStyle} placeholder="0.00" value={item.price || ''} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} /></div>
                    <div>{idx === 0 && <label style={labelStyle}>Amount</label>}<input style={{ ...inputStyle, background: '#f3f4f6', fontWeight: '500' }} value={formatCurrency(item.quantity * item.price)} disabled /></div>
                    <div>{idx === 0 && <label style={{ ...labelStyle, opacity: 0 }}>X</label>}<button onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} style={{ width: '100%', padding: '10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: invoice.items.length === 1 ? 0.4 : 1 }}>✕</button></div>
                  </div>
                ))}
                <button onClick={addItem} style={{ marginTop: '8px', padding: '10px 20px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>+ Add Item</button>
              </div>
            )}

            {activeTab === 'payment' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div><label style={labelStyle}>Payment Method</label><select style={inputStyle} value={invoice.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)}><option value="Bank">Bank Transfer</option><option value="Check">Check</option><option value="Cash">Cash</option><option value="PayPal">PayPal</option></select></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={labelStyle}>Bank Name</label><input style={inputStyle} placeholder="Bank name" value={invoice.bankName} onChange={(e) => updateField('bankName', e.target.value)} /></div>
                  <div><label style={labelStyle}>Branch</label><input style={inputStyle} placeholder="Branch" value={invoice.branchName} onChange={(e) => updateField('branchName', e.target.value)} /></div>
                </div>
                <div><label style={labelStyle}>Bank Address</label><input style={inputStyle} placeholder="Bank address" value={invoice.bankAddress} onChange={(e) => updateField('bankAddress', e.target.value)} /></div>
                <div><label style={labelStyle}>Account Name</label><input style={inputStyle} placeholder="Account holder" value={invoice.accountName} onChange={(e) => updateField('accountName', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={labelStyle}>Account #</label><input style={inputStyle} placeholder="Account number" value={invoice.accountNumber} onChange={(e) => updateField('accountNumber', e.target.value)} /></div>
                  <div><label style={labelStyle}>Routing #</label><input style={inputStyle} placeholder="Routing number" value={invoice.routingNumber} onChange={(e) => updateField('routingNumber', e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={labelStyle}>Sort Code</label><input style={inputStyle} placeholder="Sort code" value={invoice.sortCode} onChange={(e) => updateField('sortCode', e.target.value)} /></div>
                  <div><label style={labelStyle}>SWIFT</label><input style={inputStyle} placeholder="SWIFT" value={invoice.swift} onChange={(e) => updateField('swift', e.target.value)} /></div>
                </div>
                <div><label style={labelStyle}>IBAN</label><input style={inputStyle} placeholder="IBAN" value={invoice.iban} onChange={(e) => updateField('iban', e.target.value)} /></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: '#f9fafb', padding: '12px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#6b7280' }}>Live Preview</span>
          </div>
          
          <div style={{ padding: '32px', minHeight: '700px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
              <div style={{ maxWidth: '280px' }}>
                {logoPreview && <img src={logoPreview} alt="Logo" style={{ maxWidth: '120px', maxHeight: '50px', marginBottom: '12px' }} />}
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{invoice.businessName || 'Your Business Name'}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                  {invoice.businessAddress && <div>{invoice.businessAddress}</div>}
                  {invoice.businessEmail && <div>{invoice.businessEmail}</div>}
                  {invoice.businessPhone && <div>{invoice.businessPhone}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>INVOICE</div>
                <div style={{ marginTop: '10px', fontSize: '13px' }}>
                  <div style={{ marginBottom: '3px' }}><span style={{ color: '#6b7280' }}>Invoice #: </span><span style={{ color: '#111827', fontWeight: '500' }}>{invoice.invoiceNumber}</span></div>
                  <div style={{ marginBottom: '3px' }}><span style={{ color: '#6b7280' }}>Issue Date: </span><span style={{ color: '#111827', fontWeight: '500' }}>{formatDate(invoice.issueDate)}</span></div>
                  <div style={{ marginBottom: '3px' }}><span style={{ color: '#6b7280' }}>Due Date: </span><span style={{ color: '#111827', fontWeight: '500' }}>{formatDate(invoice.dueDate) || 'On Receipt'}</span></div>
                  <div><span style={{ color: '#6b7280' }}>Terms: </span><span style={{ color: '#111827', fontWeight: '500' }}>{invoice.paymentTerms}</span></div>
                </div>
              </div>
            </div>

            {/* Issued To */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '10px', fontWeight: '600' }}>Issued To:</div>
              <div style={{ fontSize: '13px' }}>
                <div style={{ display: 'flex', marginBottom: '4px' }}><span style={{ width: '70px', color: '#6b7280' }}>Name:</span><span style={{ color: '#111827', fontWeight: '500' }}>{invoice.customerName || 'Customer Name'}</span></div>
                <div style={{ display: 'flex', marginBottom: '4px' }}><span style={{ width: '70px', color: '#6b7280' }}>Address:</span><span style={{ color: '#111827', fontWeight: '500' }}>{invoice.customerAddress}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '70px', color: '#6b7280' }}>Zip Code:</span><span style={{ color: '#111827', fontWeight: '500' }}>{invoice.customerZipCode}</span></div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th style={{ background: '#f3f4f6', textAlign: 'left', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', fontWeight: '600', border: '1px solid #e5e7eb' }}>Product</th>
                  <th style={{ background: '#f3f4f6', textAlign: 'right', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', fontWeight: '600', border: '1px solid #e5e7eb', width: '60px' }}>Qty</th>
                  <th style={{ background: '#f3f4f6', textAlign: 'right', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', fontWeight: '600', border: '1px solid #e5e7eb', width: '90px' }}>Unit Price</th>
                  <th style={{ background: '#f3f4f6', textAlign: 'right', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', fontWeight: '600', border: '1px solid #e5e7eb', width: '90px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}>{item.description || 'Item'}</td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontSize: '13px', textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontSize: '13px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                    <td style={{ padding: '12px', border: '1px solid #e5e7eb', fontSize: '13px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <div style={{ width: '220px', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', fontSize: '13px', borderBottom: '1px solid #e5e7eb' }}><span style={{ color: '#6b7280' }}>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', fontSize: '14px', fontWeight: '700', background: '#f3f4f6' }}><span>Total:</span><span>{formatCurrency(subtotal)}</span></div>
              </div>
            </div>

            {/* Payment Details */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '10px', fontWeight: '600' }}>Payment Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: '13px' }}>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>Method:</span><span style={{ color: '#111827' }}>{invoice.paymentMethod}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>Bank:</span><span style={{ color: '#111827' }}>{invoice.bankName}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>Branch:</span><span style={{ color: '#111827' }}>{invoice.branchName}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>Address:</span><span style={{ color: '#111827' }}>{invoice.bankAddress}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>Account Name:</span><span style={{ color: '#111827' }}>{invoice.accountName}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>Account #:</span><span style={{ color: '#111827' }}>{invoice.accountNumber}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>Routing #:</span><span style={{ color: '#111827' }}>{invoice.routingNumber}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>Sort Code #:</span><span style={{ color: '#111827' }}>{invoice.sortCode}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>SWIFT:</span><span style={{ color: '#111827' }}>{invoice.swift}</span></div>
                <div style={{ display: 'flex' }}><span style={{ width: '90px', color: '#6b7280' }}>IBAN:</span><span style={{ color: '#111827' }}>{invoice.iban}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '13px' }}>Free to use • No signup required • Your data stays in your browser</div>
    </div>
  );
}
