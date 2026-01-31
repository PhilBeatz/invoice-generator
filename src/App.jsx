import React, { useState, useEffect } from 'react';

const defaultInvoice = {
  businessName: '', businessEmail: '', businessAddress: '', businessPhone: '', businessLogo: null,
  customerName: '', customerAddress: '', customerZipCode: '',
  invoiceNumber: 'INV-001', issueDate: new Date().toISOString().split('T')[0], dueDate: '', paymentTerms: 'Within 30 Days',
  items: [{ id: 1, description: '', sku: '', quantity: 1, price: 0, hours: 1, rate: 0 }],
  showPaymentDetails: true,
  paymentMethod: 'Bank', bankName: '', branchName: '', bankAddress: '', accountName: '', accountNumber: '', routingNumber: '', sortCode: '', swift: '', iban: '',
  currency: 'USD',
  invoiceMode: 'products',
  shippingCost: 0,
  discount: 0,
  taxRate: 0,
  taxType: 'percent',
  taxIncluded: false,
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
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currencySymbol = currencies.find(c => c.code === invoice.currency)?.symbol || '$';
  const updateField = (field, value) => setInvoice(prev => ({ ...prev, [field]: value }));
  const updateItem = (id, field, value) => setInvoice(prev => ({ ...prev, items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item) }));
  const addItem = () => { 
    const newId = Math.max(...invoice.items.map(i => i.id)) + 1; 
    setInvoice(prev => ({ ...prev, items: [...prev.items, { id: newId, description: '', sku: '', quantity: 1, price: 0, hours: 1, rate: 0 }] })); 
  };
  const removeItem = (id) => { if (invoice.items.length > 1) setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) })); };
  
  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        updateField('businessLogo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };

  const getItemTotal = (item) => invoice.invoiceMode === 'hours' ? item.hours * item.rate : item.quantity * item.price;
  const subtotal = invoice.items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const discountAmount = invoice.discount || 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = invoice.taxType === 'percent' ? (afterDiscount * (invoice.taxRate || 0) / 100) : (invoice.taxRate || 0);
  const shippingAmount = invoice.shippingCost || 0;
  const total = invoice.taxIncluded ? afterDiscount + shippingAmount : afterDiscount + taxAmount + shippingAmount;

  const formatCurrency = (amount) => `${currencySymbol}${amount.toFixed(2)}`;
  const formatDate = (dateStr) => { if (!dateStr) return ''; return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;padding:70px 80px;color:#1f2937;font-size:15px;line-height:1.6}
@media print{body{padding:40px}@page{margin:40px}}

.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:50px;flex-wrap:wrap;gap:20px}
.business-info{max-width:400px}
.business-name{font-size:28px;font-weight:700;color:#1e40af;margin-bottom:8px}
.business-details{color:#6b7280;font-size:14px;line-height:1.8}
.logo-img{max-width:180px;max-height:70px;margin-bottom:12px}

.invoice-title{text-align:right}
.invoice-title h1{font-size:32px;font-weight:700;color:#1f2937;letter-spacing:-0.5px;margin-bottom:12px}

.invoice-meta{text-align:right;font-size:14px;line-height:2}
.invoice-meta-row{margin-bottom:2px}
.invoice-meta-label{color:#0891b2;font-weight:500}
.invoice-meta-value{color:#374151}

.issued-to{margin-bottom:40px}
.issued-to h3{font-size:15px;font-weight:700;color:#1f2937;margin-bottom:12px}
.issued-to-row{margin-bottom:5px;font-size:14px;color:#6b7280}
.issued-to-row strong{color:#1f2937;font-weight:600}

.items-table{width:100%;border-collapse:collapse;margin-bottom:30px}
.items-table th{background:#f1f5f9;text-align:left;padding:14px 16px;font-size:14px;color:#475569;font-weight:600;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}
.items-table th:nth-child(2),.items-table th:nth-child(3),.items-table th:nth-child(4){text-align:center}
.items-table th:last-child{text-align:right}
.items-table td{padding:16px;font-size:14px;border-bottom:1px solid #e2e8f0;color:#374151}
.items-table td:first-child{font-weight:600}
.items-table td:nth-child(2),.items-table td:nth-child(3),.items-table td:nth-child(4){text-align:center}
.items-table td:last-child{text-align:right}

.totals{display:flex;justify-content:flex-end;margin-bottom:50px}
.totals-box{width:300px;text-align:right}
.totals-row{display:flex;justify-content:space-between;padding:8px 0;font-size:14px;border-bottom:1px solid #f1f5f9}
.totals-row span:first-child{color:#6b7280}
.totals-row span:last-child{color:#374151}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none}
.totals-row.total span:first-child{color:#1f2937}
.totals-row.total span:last-child{color:#1f2937}

.payment-details{margin-top:30px}
.payment-details h3{font-size:16px;font-weight:700;color:#1f2937;margin-bottom:16px}
.payment-method{font-size:15px;font-weight:600;color:#1f2937;margin-bottom:12px}
.payment-grid{font-size:13px;color:#6b7280;line-height:2}
.payment-row{display:flex}
.payment-label{width:110px;font-weight:500;color:#4b5563}
.payment-value{color:#6b7280}
</style></head><body>

<div class="header">
<div class="business-info">
${logoPreview ? `<img src="${logoPreview}" class="logo-img" />` : ''}
<div class="business-name">${invoice.businessName || 'Your Business Name'}</div>
<div class="business-details">${invoice.businessAddress ? invoice.businessAddress + '<br>' : ''}${invoice.businessEmail ? invoice.businessEmail + '<br>' : ''}${invoice.businessPhone || ''}</div>
</div>
<div class="invoice-title">
<h1>INVOICE</h1>
<div class="invoice-meta">
<div class="invoice-meta-row"><span class="invoice-meta-label">Invoice #:</span> <span class="invoice-meta-value">${invoice.invoiceNumber}</span></div>
<div class="invoice-meta-row"><span class="invoice-meta-label">Issue Date:</span> <span class="invoice-meta-value">${formatDate(invoice.issueDate)}</span></div>
<div class="invoice-meta-row"><span class="invoice-meta-label">Due Date:</span> <span class="invoice-meta-value">${formatDate(invoice.dueDate) || 'On Receipt'}</span></div>
<div class="invoice-meta-row"><span class="invoice-meta-label">Terms of Payment:</span> <span class="invoice-meta-value">${invoice.paymentTerms}</span></div>
</div>
</div>
</div>

<div class="issued-to">
<h3>Issued To:</h3>
<div class="issued-to-row"><strong>Name:</strong> ${invoice.customerName || ''}</div>
<div class="issued-to-row"><strong>Address:</strong> ${invoice.customerAddress || ''}</div>
<div class="issued-to-row"><strong>Zip Code:</strong> ${invoice.customerZipCode || ''}</div>
</div>

<table class="items-table">
<thead><tr>
<th style="width:${invoice.invoiceMode === 'hours' ? '40%' : '35%'}">${invoice.invoiceMode === 'hours' ? 'Service' : 'Product'}</th>
${invoice.invoiceMode === 'products' ? '<th style="width:15%">SKU</th>' : ''}
<th style="width:12%">${invoice.invoiceMode === 'hours' ? 'Hours' : 'Qty'}</th>
<th style="width:18%">${invoice.invoiceMode === 'hours' ? 'Rate (/Hour)' : 'Unit Price'}</th>
<th style="width:18%">Amount</th>
</tr></thead>
<tbody>${invoice.items.map(item => `<tr>
<td>${item.description || ''}</td>
${invoice.invoiceMode === 'products' ? `<td>${item.sku || ''}</td>` : ''}
<td>${invoice.invoiceMode === 'hours' ? item.hours : item.quantity}</td>
<td>${formatCurrency(invoice.invoiceMode === 'hours' ? item.rate : item.price)}</td>
<td>${formatCurrency(getItemTotal(item))}</td>
</tr>`).join('')}</tbody>
</table>

<div class="totals">
<div class="totals-box">
<div class="totals-row"><span>Subtotal:</span><span>${formatCurrency(subtotal)}</span></div>
${discountAmount > 0 ? `<div class="totals-row"><span>Discount:</span><span>-${formatCurrency(discountAmount)}</span></div>` : ''}
${!invoice.taxIncluded && taxAmount > 0 ? `<div class="totals-row"><span>Tax ${invoice.taxType === 'percent' ? `(${invoice.taxRate}%)` : ''}:</span><span>${formatCurrency(taxAmount)}</span></div>` : ''}
${invoice.taxIncluded && invoice.taxRate > 0 ? `<div class="totals-row"><span>Tax (included):</span><span>${invoice.taxType === 'percent' ? `${invoice.taxRate}%` : formatCurrency(invoice.taxRate)}</span></div>` : ''}
${shippingAmount > 0 ? `<div class="totals-row"><span>Shipping:</span><span>${formatCurrency(shippingAmount)}</span></div>` : ''}
<div class="totals-row total"><span>Total:</span><span>${formatCurrency(total)}</span></div>
</div>
</div>

${invoice.showPaymentDetails ? `
<div class="payment-details">
<h3>Payment Details</h3>
<div class="payment-method">Method: ${invoice.paymentMethod}</div>
<div class="payment-grid">
<div class="payment-row"><span class="payment-label">Bank:</span><span class="payment-value">${invoice.bankName || ''}</span></div>
<div class="payment-row"><span class="payment-label">Branch:</span><span class="payment-value">${invoice.branchName || ''}</span></div>
<div class="payment-row"><span class="payment-label">Address:</span><span class="payment-value">${invoice.bankAddress || ''}</span></div>
<div class="payment-row"><span class="payment-label">Account Name:</span><span class="payment-value">${invoice.accountName || ''}</span></div>
<div class="payment-row"><span class="payment-label">Account #:</span><span class="payment-value">${invoice.accountNumber || ''}</span></div>
<div class="payment-row"><span class="payment-label">Routing #:</span><span class="payment-value">${invoice.routingNumber || ''}</span></div>
<div class="payment-row"><span class="payment-label">Sort Code #:</span><span class="payment-value">${invoice.sortCode || ''}</span></div>
<div class="payment-row"><span class="payment-label">SWIFT:</span><span class="payment-value">${invoice.swift || ''}</span></div>
<div class="payment-row"><span class="payment-label">IBAN:</span><span class="payment-value">${invoice.iban || ''}</span></div>
</div>
</div>
` : ''}

</body></html>`);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };

  const tabs = [
    { id: 'business', label: 'Company', icon: '🏢' },
    { id: 'customer', label: 'Customer', icon: '👤' },
    { id: 'invoice', label: 'Invoice', icon: '📄' },
    { id: 'items', label: 'Products', icon: '📦' },
    { id: 'payment', label: 'Payment', icon: '💳' },
  ];

  const colors = {
    bg: '#1a1a2e',
    bgLight: '#16213e',
    bgCard: '#1f2937',
    bgInput: '#374151',
    accent: '#06b6d4',
    accentHover: '#22d3ee',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    border: '#4b5563',
  };

  const inputStyle = { 
    width: '100%', 
    padding: '12px 14px', 
    border: `1px solid ${colors.border}`, 
    borderRadius: '8px', 
    fontSize: '16px', 
    fontFamily: 'Inter, sans-serif', 
    background: colors.bgInput, 
    color: colors.text,
    boxSizing: 'border-box',
    outline: 'none',
  };
  
  const labelStyle = { 
    display: 'block', 
    fontSize: '13px', 
    fontWeight: '500', 
    color: colors.textMuted, 
    marginBottom: '8px' 
  };

  // Determine what to show based on mobile state and preview toggle
  const showEditPanel = !isMobile || !showPreview;
  const showPreviewPanel = !isMobile || showPreview;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input, select, textarea { box-sizing: border-box; font-size: 16px !important; }
        input::placeholder, textarea::placeholder { color: #6b7280; }
        input:focus, select:focus, textarea:focus { border-color: #06b6d4 !important; outline: none; }
        select option { background: #374151; color: #f3f4f6; }
        .toggle-switch { position: relative; width: 48px; height: 26px; background: #4b5563; border-radius: 13px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
        .toggle-switch.active { background: #06b6d4; }
        .toggle-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .toggle-switch.active::after { transform: translateX(22px); }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: rgba(6, 182, 212, 0.1); }
        .mode-btn { transition: all 0.2s; cursor: pointer; }
        .mode-btn:hover { opacity: 0.9; }
      `}</style>

      {/* Hero Header */}
      <div style={{ background: colors.bg, padding: isMobile ? '30px 16px 20px' : '40px 20px 30px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: isMobile ? '28px' : '48px', 
          fontWeight: '800', 
          color: colors.text, 
          marginBottom: '12px',
          fontStyle: 'italic',
          letterSpacing: '-1px'
        }}>
          Free Invoice Generator
        </h1>
        <p style={{ 
          color: colors.textMuted, 
          fontSize: isMobile ? '14px' : '18px', 
          maxWidth: '700px', 
          margin: '0 auto',
          lineHeight: '1.6',
          padding: '0 8px'
        }}>
          Use our free online invoice generator to create professional invoices in seconds — no signup required. Customize, and download a PDF invoice for your business needs.
        </p>
      </div>

      {/* Mobile Preview Toggle - Only show on mobile */}
      {isMobile && (
        <div style={{ display: 'flex', padding: '0 16px 16px', gap: '8px' }}>
          <button 
            onClick={() => setShowPreview(false)}
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: !showPreview ? colors.accent : colors.bgCard, 
              color: !showPreview ? '#0f172a' : colors.textMuted,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
            ✏️ Edit
          </button>
          <button 
            onClick={() => setShowPreview(true)}
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: showPreview ? colors.accent : colors.bgCard, 
              color: showPreview ? '#0f172a' : colors.textMuted,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
            👁 Preview
          </button>
        </div>
      )}

      {/* Main */}
      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '0 16px 24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Panel - Invoice Details */}
        {showEditPanel && (
          <div style={{ 
            background: colors.bgCard, 
            borderRadius: '12px', 
            border: `1px solid ${colors.border}`, 
            overflow: 'hidden', 
            width: '100%', 
            maxWidth: isMobile ? '100%' : '600px', 
            minWidth: isMobile ? '100%' : '320px', 
            flex: isMobile ? '1 1 100%' : '1 1 550px'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📋</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>Invoice Details</span>
            </div>
            
            <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, padding: '8px 12px', gap: '4px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  className="tab-btn"
                  onClick={() => setActiveTab(tab.id)} 
                  style={{ 
                    padding: isMobile ? '10px 12px' : '12px 14px', 
                    background: activeTab === tab.id ? colors.accent : 'transparent', 
                    border: 'none', 
                    fontSize: isMobile ? '12px' : '13px', 
                    fontWeight: '500', 
                    color: activeTab === tab.id ? '#0f172a' : colors.textMuted, 
                    cursor: 'pointer', 
                    borderRadius: '8px',
                    whiteSpace: 'nowrap', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px' }}>
              {activeTab === 'business' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Logo</label>
                    <label 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      style={{ 
                        border: `2px dashed ${isDragging ? colors.accent : colors.border}`, 
                        borderRadius: '10px', 
                        padding: '20px', 
                        textAlign: 'center', 
                        cursor: 'pointer', 
                        display: 'block', 
                        background: isDragging ? 'rgba(6, 182, 212, 0.1)' : colors.bgInput, 
                        transition: 'all 0.2s' 
                      }}>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" style={{ maxWidth: '140px', maxHeight: '70px' }} />
                      ) : (
                        <div style={{ color: isDragging ? colors.accent : colors.textMuted, fontSize: '14px' }}>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                          <div>Drag & drop your logo here</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>or tap to browse</div>
                        </div>
                      )}
                    </label>
                  </div>
                  <div><label style={labelStyle}>Business Name</label><input style={inputStyle} placeholder="Your Company Name" value={invoice.businessName} onChange={(e) => updateField('businessName', e.target.value)} /></div>
                  <div><label style={labelStyle}>Address</label><input style={inputStyle} placeholder="123 Business St, City, State" value={invoice.businessAddress} onChange={(e) => updateField('businessAddress', e.target.value)} /></div>
                  <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} placeholder="billing@company.com" value={invoice.businessEmail} onChange={(e) => updateField('businessEmail', e.target.value)} /></div>
                  <div><label style={labelStyle}>Phone</label><input type="tel" style={inputStyle} placeholder="(555) 123-4567" value={invoice.businessPhone} onChange={(e) => updateField('businessPhone', e.target.value)} /></div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div><label style={labelStyle}>Invoice #</label><input style={inputStyle} value={invoice.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} /></div>
                    <div><label style={labelStyle}>Currency</label><select style={inputStyle} value={invoice.currency} onChange={(e) => updateField('currency', e.target.value)}>{currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}</select></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div><label style={labelStyle}>Issue Date</label><input type="date" style={inputStyle} value={invoice.issueDate} onChange={(e) => updateField('issueDate', e.target.value)} /></div>
                    <div><label style={labelStyle}>Due Date</label><input type="date" style={inputStyle} value={invoice.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} /></div>
                  </div>
                  <div><label style={labelStyle}>Payment Terms</label><select style={inputStyle} value={invoice.paymentTerms} onChange={(e) => updateField('paymentTerms', e.target.value)}>{paymentTermsOptions.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                </div>
              )}

              {activeTab === 'items' && (
                <div>
                  {/* Invoice Mode Toggle */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Invoice Mode:</label>
                    <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                      <button 
                        className="mode-btn"
                        onClick={() => updateField('invoiceMode', 'products')}
                        style={{ 
                          flex: 1,
                          padding: '10px 16px', 
                          background: invoice.invoiceMode === 'products' ? colors.accent : colors.bgInput,
                          color: invoice.invoiceMode === 'products' ? '#0f172a' : colors.textMuted,
                          border: 'none',
                          fontWeight: '500',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}>
                        📦 Products
                      </button>
                      <button 
                        className="mode-btn"
                        onClick={() => updateField('invoiceMode', 'hours')}
                        style={{ 
                          flex: 1,
                          padding: '10px 16px', 
                          background: invoice.invoiceMode === 'hours' ? colors.accent : colors.bgInput,
                          color: invoice.invoiceMode === 'hours' ? '#0f172a' : colors.textMuted,
                          border: 'none',
                          fontWeight: '500',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}>
                        ⏱ Hours
                      </button>
                    </div>
                  </div>

                  {/* Products/Services Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
                      {invoice.invoiceMode === 'hours' ? 'Services' : 'Products'}
                    </span>
                    <button onClick={addItem} style={{ padding: '8px 14px', background: colors.accent, color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                      + Add
                    </button>
                  </div>

                  {/* Items List */}
                  {invoice.items.map((item, idx) => (
                    <div key={item.id} style={{ padding: '12px', background: colors.bgInput, borderRadius: '10px', marginBottom: '10px', border: `1px solid ${colors.border}` }}>
                      {invoice.invoiceMode === 'products' ? (
                        // Products Mode
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 80px 50px 70px 36px', gap: isMobile ? '12px' : '8px', alignItems: 'end' }}>
                          <div>
                            <label style={labelStyle}>Name</label>
                            <input style={{...inputStyle, background: colors.bgCard, padding: '10px 12px'}} placeholder="Product name" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>SKU</label>
                            <input style={{...inputStyle, background: colors.bgCard, padding: '10px 8px'}} placeholder="SKU" value={item.sku} onChange={(e) => updateItem(item.id, 'sku', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Qty</label>
                            <input type="number" min="1" style={{...inputStyle, background: colors.bgCard, padding: '10px 6px', textAlign: 'center'}} value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Price</label>
                            <input type="number" min="0" step="0.01" style={{...inputStyle, background: colors.bgCard, padding: '10px 8px'}} placeholder="0.00" value={item.price || ''} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} />
                          </div>
                          <div>
                            <button onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} style={{ width: '100%', padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: invoice.items.length === 1 ? 0.3 : 1, fontSize: '14px', marginTop: isMobile ? '0' : '22px' }}>🗑</button>
                          </div>
                        </div>
                      ) : (
                        // Hours Mode
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 60px 80px 36px', gap: isMobile ? '12px' : '8px', alignItems: 'end' }}>
                          <div>
                            <label style={labelStyle}>Service</label>
                            <input style={{...inputStyle, background: colors.bgCard, padding: '10px 12px'}} placeholder="Service name" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Hours</label>
                            <input type="number" min="0.5" step="0.5" style={{...inputStyle, background: colors.bgCard, padding: '10px 6px', textAlign: 'center'}} value={item.hours} onChange={(e) => updateItem(item.id, 'hours', parseFloat(e.target.value) || 1)} />
                          </div>
                          <div>
                            <label style={labelStyle}>Rate</label>
                            <input type="number" min="0" step="0.01" style={{...inputStyle, background: colors.bgCard, padding: '10px 8px'}} placeholder="0.00" value={item.rate || ''} onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                          </div>
                          <div>
                            <button onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} style={{ width: '100%', padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: invoice.items.length === 1 ? 0.3 : 1, fontSize: '14px', marginTop: isMobile ? '0' : '22px' }}>🗑</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Shipping & Discount */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                    <div>
                      <label style={labelStyle}>Shipping (Optional)</label>
                      <input type="number" min="0" step="0.01" style={inputStyle} placeholder="0.00" value={invoice.shippingCost || ''} onChange={(e) => updateField('shippingCost', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Discount (Optional)</label>
                      <input type="number" min="0" step="0.01" style={inputStyle} placeholder="0.00" value={invoice.discount || ''} onChange={(e) => updateField('discount', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  {/* Tax Rate & Type */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div>
                      <label style={labelStyle}>Tax Rate</label>
                      <input type="number" min="0" step="0.01" style={inputStyle} placeholder="0" value={invoice.taxRate || ''} onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Tax Type</label>
                      <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                        <button className="mode-btn" onClick={() => updateField('taxType', 'percent')} style={{ flex: 1, padding: '12px', background: invoice.taxType === 'percent' ? colors.accent : colors.bgInput, color: invoice.taxType === 'percent' ? '#0f172a' : colors.textMuted, border: 'none', fontWeight: '600', fontSize: '14px' }}>%</button>
                        <button className="mode-btn" onClick={() => updateField('taxType', 'fixed')} style={{ flex: 1, padding: '12px', background: invoice.taxType === 'fixed' ? colors.accent : colors.bgInput, color: invoice.taxType === 'fixed' ? '#0f172a' : colors.textMuted, border: 'none', fontWeight: '600', fontSize: '14px' }}>#</button>
                      </div>
                    </div>
                  </div>

                  {/* Tax Included Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', padding: '12px', background: colors.bgInput, borderRadius: '8px' }}>
                    <div className={`toggle-switch ${invoice.taxIncluded ? 'active' : ''}`} onClick={() => updateField('taxIncluded', !invoice.taxIncluded)} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>Tax included in prices</div>
                      <div style={{ fontSize: '12px', color: colors.textMuted }}>{invoice.taxIncluded ? 'Tax is already included' : 'Tax will be added'}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: colors.bgInput, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>Show Payment Details</div>
                      <div style={{ fontSize: '12px', color: colors.textMuted }}>Include on invoice</div>
                    </div>
                    <div className={`toggle-switch ${invoice.showPaymentDetails ? 'active' : ''}`} onClick={() => updateField('showPaymentDetails', !invoice.showPaymentDetails)} />
                  </div>

                  {invoice.showPaymentDetails && (
                    <>
                      <div><label style={labelStyle}>Payment Method</label><select style={inputStyle} value={invoice.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)}><option value="Bank">Bank Transfer</option><option value="Check">Check</option><option value="Cash">Cash</option><option value="PayPal">PayPal</option></select></div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                        <div><label style={labelStyle}>Bank Name</label><input style={inputStyle} placeholder="Bank name" value={invoice.bankName} onChange={(e) => updateField('bankName', e.target.value)} /></div>
                        <div><label style={labelStyle}>Branch</label><input style={inputStyle} placeholder="Branch" value={invoice.branchName} onChange={(e) => updateField('branchName', e.target.value)} /></div>
                      </div>
                      <div><label style={labelStyle}>Bank Address</label><input style={inputStyle} placeholder="Bank address" value={invoice.bankAddress} onChange={(e) => updateField('bankAddress', e.target.value)} /></div>
                      <div><label style={labelStyle}>Account Name</label><input style={inputStyle} placeholder="Account holder" value={invoice.accountName} onChange={(e) => updateField('accountName', e.target.value)} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                        <div><label style={labelStyle}>Account #</label><input style={inputStyle} placeholder="Account number" value={invoice.accountNumber} onChange={(e) => updateField('accountNumber', e.target.value)} /></div>
                        <div><label style={labelStyle}>Routing #</label><input style={inputStyle} placeholder="Routing number" value={invoice.routingNumber} onChange={(e) => updateField('routingNumber', e.target.value)} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                        <div><label style={labelStyle}>Sort Code</label><input style={inputStyle} placeholder="Sort code" value={invoice.sortCode} onChange={(e) => updateField('sortCode', e.target.value)} /></div>
                        <div><label style={labelStyle}>SWIFT</label><input style={inputStyle} placeholder="SWIFT" value={invoice.swift} onChange={(e) => updateField('swift', e.target.value)} /></div>
                      </div>
                      <div><label style={labelStyle}>IBAN</label><input style={inputStyle} placeholder="IBAN" value={invoice.iban} onChange={(e) => updateField('iban', e.target.value)} /></div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Panel - Invoice Preview */}
        {showPreviewPanel && (
          <div style={{ 
            background: colors.bgCard, 
            borderRadius: '12px', 
            border: `1px solid ${colors.border}`, 
            overflow: 'hidden', 
            flex: isMobile ? '1 1 100%' : '2 1 500px', 
            minWidth: isMobile ? '100%' : '320px',
            width: isMobile ? '100%' : 'auto'
          }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>📄</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>Invoice Preview</span>
              </div>
              <button onClick={downloadPDF} style={{ padding: '10px 18px', background: colors.accent, color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📥 Download PDF
              </button>
            </div>
            
            {/* White preview area */}
            <div style={{ padding: '16px', background: colors.bgInput }}>
              <div style={{ background: 'white', borderRadius: '8px', padding: isMobile ? '20px' : '30px', minHeight: isMobile ? '400px' : '500px', color: '#1f2937', overflowX: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ minWidth: '140px', flex: '1' }}>
                    {logoPreview && <img src={logoPreview} alt="Logo" style={{ maxWidth: '100px', maxHeight: '40px', marginBottom: '8px' }} />}
                    <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>{invoice.businessName || 'Your Company'}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>
                      {invoice.businessAddress && <div>{invoice.businessAddress}</div>}
                      {invoice.businessEmail && <div>{invoice.businessEmail}</div>}
                      {invoice.businessPhone && <div>{invoice.businessPhone}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '130px' }}>
                    <div style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>INVOICE</div>
                    <div style={{ fontSize: '11px', lineHeight: '1.7' }}>
                      <div><span style={{ color: '#0891b2', fontWeight: '500' }}>Invoice #:</span> {invoice.invoiceNumber}</div>
                      <div><span style={{ color: '#0891b2', fontWeight: '500' }}>Issue Date:</span> {formatDate(invoice.issueDate)}</div>
                      <div><span style={{ color: '#0891b2', fontWeight: '500' }}>Due Date:</span> {formatDate(invoice.dueDate) || 'On Receipt'}</div>
                    </div>
                  </div>
                </div>

                {/* Issued To */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>Issued To:</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>
                    <div>{invoice.customerName || 'Customer Name'}</div>
                    {invoice.customerAddress && <div>{invoice.customerAddress}</div>}
                    {invoice.customerZipCode && <div>{invoice.customerZipCode}</div>}
                  </div>
                </div>

                {/* Items Table */}
                <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '280px', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #e2e8f0' }}>
                          {invoice.invoiceMode === 'hours' ? 'Service' : 'Product'}
                        </th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #e2e8f0', width: '40px' }}>
                          {invoice.invoiceMode === 'hours' ? 'Hrs' : 'Qty'}
                        </th>
                        <th style={{ textAlign: 'right', padding: '8px 6px', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #e2e8f0', width: '55px' }}>
                          {invoice.invoiceMode === 'hours' ? 'Rate' : 'Price'}
                        </th>
                        <th style={{ textAlign: 'right', padding: '8px 6px', color: '#64748b', fontWeight: '600', borderBottom: '2px solid #e2e8f0', width: '60px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map(item => (
                        <tr key={item.id}>
                          <td style={{ padding: '8px 6px', borderBottom: '1px solid #f1f5f9', fontWeight: '500', color: '#374151' }}>
                            {item.description || (invoice.invoiceMode === 'hours' ? 'Service' : 'Product')}
                          </td>
                          <td style={{ padding: '8px 6px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', color: '#64748b' }}>
                            {invoice.invoiceMode === 'hours' ? item.hours : item.quantity}
                          </td>
                          <td style={{ padding: '8px 6px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#64748b' }}>
                            {formatCurrency(invoice.invoiceMode === 'hours' ? item.rate : item.price)}
                          </td>
                          <td style={{ padding: '8px 6px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#374151', fontWeight: '500' }}>
                            {formatCurrency(getItemTotal(item))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <div style={{ width: '160px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Subtotal:</span>
                      <span style={{ color: '#374151' }}>{formatCurrency(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Discount:</span>
                        <span style={{ color: '#dc2626' }}>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    {!invoice.taxIncluded && taxAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Tax:</span>
                        <span style={{ color: '#374151' }}>{formatCurrency(taxAmount)}</span>
                      </div>
                    )}
                    {shippingAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Shipping:</span>
                        <span style={{ color: '#374151' }}>{formatCurrency(shippingAmount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: '700', fontSize: '14px' }}>
                      <span style={{ color: '#1f2937' }}>Total:</span>
                      <span style={{ color: '#1f2937' }}>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                {invoice.showPaymentDetails && invoice.bankName && (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '11px' }}>
                    <div style={{ fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>Payment Details</div>
                    <div style={{ color: '#64748b', lineHeight: '1.5' }}>
                      <div>Method: {invoice.paymentMethod}</div>
                      {invoice.bankName && <div>Bank: {invoice.bankName}</div>}
                      {invoice.accountNumber && <div>Account #: {invoice.accountNumber}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '20px', color: colors.textMuted, fontSize: '12px' }}>Free to use • No signup required • Your data stays in your browser</div>
    </div>
  );
}
