import React, { useState, useEffect } from 'react';

const defaultInvoice = {
  businessName: '', businessEmail: '', businessAddress: '', businessPhone: '', businessLogo: null,
  customerName: '', customerEmail: '', customerPhone: '', customerAddress: '', customerZipCode: '', customerIdentifier: '',
  invoiceNumber: 'INV-001', issueDate: new Date().toISOString().split('T')[0], dueDate: '', 
  paymentTermsText: '',
  customFields: [],
  endMessage: '',
  items: [{ id: 1, description: '', sku: '', quantity: 1, price: 0, hours: 1, rate: 0 }],
  currency: 'USD',
  invoiceMode: 'products',
  shippingCost: 0,
  discount: 0,
  taxRate: 0,
  taxType: 'percent',
  taxIncluded: false,
  // Payment methods array
  paymentMethods: [],
};

const currencies = [
  { code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' },
  { code: 'CAD', symbol: 'C$' }, { code: 'AUD', symbol: 'A$' }, { code: 'JPY', symbol: '¥' }, { code: 'INR', symbol: '₹' },
];

// Generate random invoice number
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const random = Math.floor(Math.random() * 900000) + 100000;
  const suffix = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${random}-${suffix}`;
};

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState(defaultInvoice);
  const [logoPreview, setLogoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('business');
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Customer Manager state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '', identifier: '', address: '', zipCode: '', phone: '', email: ''
  });

  // Load customers from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('dayonetools_customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  // Load draft invoice from localStorage (for mobile back button)
  useEffect(() => {
    const savedDraft = localStorage.getItem('dayonetools_invoice_draft');
    const savedLogo = localStorage.getItem('dayonetools_logo_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setInvoice(prev => ({ ...prev, ...parsed }));
        // Clear the draft after loading
        localStorage.removeItem('dayonetools_invoice_draft');
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
    if (savedLogo) {
      setLogoPreview(savedLogo);
      localStorage.removeItem('dayonetools_logo_draft');
    }
  }, []);

  // Save customers to localStorage when changed
  useEffect(() => {
    localStorage.setItem('dayonetools_customers', JSON.stringify(customers));
  }, [customers]);

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
  
  // Payment Methods functions
  const addPaymentMethod = (type) => {
    const newMethod = {
      id: Date.now(),
      type: type,
      // Bank fields
      bankName: '', branch: '', bankAddress: '', accountName: '', accountNumber: '', routingNumber: '', sortCode: '', swift: '', iban: '',
      // PayPal fields
      paypalEmail: '',
      // Crypto fields
      cryptoType: 'Bitcoin', walletAddress: '',
      // Custom fields
      customName: '', customDetails: '',
    };
    setInvoice(prev => ({ ...prev, paymentMethods: [...prev.paymentMethods, newMethod] }));
  };

  const updatePaymentMethod = (id, field, value) => {
    setInvoice(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(pm => pm.id === id ? { ...pm, [field]: value } : pm)
    }));
  };

  const removePaymentMethod = (id) => {
    setInvoice(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id)
    }));
  };

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

  // Customer Manager functions
  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) return;
    
    const customer = {
      id: Date.now(),
      ...newCustomer
    };
    
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...customer, id: editingCustomer.id } : c));
      setEditingCustomer(null);
    } else {
      setCustomers(prev => [...prev, customer]);
    }
    
    setNewCustomer({ name: '', identifier: '', address: '', zipCode: '', phone: '', email: '' });
    setShowAddCustomer(false);
  };

  const handleSelectCustomer = (customer) => {
    setInvoice(prev => ({
      ...prev,
      customerName: customer.name,
      customerIdentifier: customer.identifier,
      customerAddress: customer.address,
      customerZipCode: customer.zipCode,
      customerPhone: customer.phone,
      customerEmail: customer.email,
    }));
    setShowCustomerModal(false);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      identifier: customer.identifier,
      address: customer.address,
      zipCode: customer.zipCode,
      phone: customer.phone,
      email: customer.email,
    });
    setShowAddCustomer(true);
  };

  const handleDeleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.identifier.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const getItemTotal = (item) => invoice.invoiceMode === 'hours' ? item.hours * item.rate : item.quantity * item.price;
  const subtotal = invoice.items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const discountAmount = invoice.discount || 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = invoice.taxType === 'percent' ? (afterDiscount * (invoice.taxRate || 0) / 100) : (invoice.taxRate || 0);
  const shippingAmount = invoice.shippingCost || 0;
  const total = invoice.taxIncluded ? afterDiscount + shippingAmount : afterDiscount + taxAmount + shippingAmount;

  const formatCurrency = (amount) => `${currencySymbol}${amount.toFixed(2)}`;
  const formatDate = (dateStr) => { 
    if (!dateStr) return ''; 
    // Parse the date string as local time (not UTC) to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); 
  };

  // Generate payment details HTML for PDF
  const generatePaymentDetailsHTML = () => {
    if (invoice.paymentMethods.length === 0) return '';
    
    let html = '<div class="payment-details"><h3>Payment Details</h3>';
    
    invoice.paymentMethods.forEach(pm => {
      if (pm.type === 'bank') {
        html += `
          <div class="payment-section">
            <div class="payment-method">Method: Bank</div>
            <div class="payment-grid-two-col">
              <div class="payment-row"><span class="payment-label">Bank:</span><span class="payment-value">${pm.bankName || ''}</span></div>
              <div class="payment-row"><span class="payment-label">Branch:</span><span class="payment-value">${pm.branch || ''}</span></div>
              <div class="payment-row"><span class="payment-label">Address:</span><span class="payment-value">${pm.bankAddress || ''}</span></div>
              <div class="payment-row"><span class="payment-label">Account Name:</span><span class="payment-value">${pm.accountName || ''}</span></div>
              <div class="payment-row"><span class="payment-label">Account #:</span><span class="payment-value">${pm.accountNumber || ''}</span></div>
              <div class="payment-row"><span class="payment-label">Routing #:</span><span class="payment-value">${pm.routingNumber || ''}</span></div>
              <div class="payment-row"><span class="payment-label">Sort Code:</span><span class="payment-value">${pm.sortCode || ''}</span></div>
              <div class="payment-row"><span class="payment-label">SWIFT:</span><span class="payment-value">${pm.swift || ''}</span></div>
              <div class="payment-row"><span class="payment-label">IBAN:</span><span class="payment-value">${pm.iban || ''}</span></div>
            </div>
          </div>
        `;
      } else if (pm.type === 'paypal') {
        html += `
          <div class="payment-section">
            <div class="payment-method">Method: PayPal</div>
            <div class="payment-grid">
              ${pm.paypalEmail ? `<div class="payment-row"><span class="payment-label">PayPal Email:</span><span class="payment-value">${pm.paypalEmail}</span></div>` : ''}
            </div>
          </div>
        `;
      } else if (pm.type === 'crypto') {
        html += `
          <div class="payment-section">
            <div class="payment-method">Method: Cryptocurrency (${pm.cryptoType})</div>
            <div class="payment-grid">
              ${pm.walletAddress ? `<div class="payment-row"><span class="payment-label">Wallet Address:</span><span class="payment-value" style="word-break:break-all">${pm.walletAddress}</span></div>` : ''}
            </div>
          </div>
        `;
      } else if (pm.type === 'custom') {
        html += `
          <div class="payment-section">
            <div class="payment-method">Method: ${pm.customName || 'Custom'}</div>
            <div class="payment-grid">
              ${pm.customDetails ? `<div class="payment-row"><span class="payment-value">${pm.customDetails}</span></div>` : ''}
            </div>
          </div>
        `;
      }
    });
    
    html += '</div>';
    return html;
  };

  const downloadPDF = () => {
    // Save current state to localStorage before showing PDF (for mobile back button)
    if (isMobile) {
      localStorage.setItem('dayonetools_invoice_draft', JSON.stringify(invoice));
      localStorage.setItem('dayonetools_logo_draft', logoPreview || '');
    }

    const htmlContent = `<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;padding:40px;color:#1f2937;font-size:15px;line-height:1.6;background:white}
@media print{
  body{padding:20px}
  @page{margin:15mm}
  .no-print{display:none!important}
  html,body{height:auto;overflow:visible}
}
@media screen and (max-width:600px){body{padding:20px;padding-bottom:80px}}

.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:50px;flex-wrap:wrap;gap:20px}
.business-info{max-width:400px}
.business-name{font-size:28px;font-weight:700;color:#1e40af;margin-bottom:8px}
.business-details{color:#6b7280;font-size:14px;line-height:1.8}
.logo-img{max-width:180px;max-height:70px;margin-bottom:12px}

.invoice-title{text-align:right}
.invoice-title h1{font-size:32px;font-weight:700;color:#1f2937;letter-spacing:-0.5px;margin-bottom:12px}

.invoice-meta{text-align:right;font-size:14px;line-height:2}
.invoice-meta-row{margin-bottom:2px}
.invoice-meta-label{color:#3b82f6;font-weight:500}
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

.totals{display:flex;justify-content:flex-end;margin-bottom:30px}
.totals-box{width:300px;text-align:right}
.totals-row{display:flex;justify-content:space-between;padding:8px 0;font-size:14px;border-bottom:1px solid #f1f5f9}
.totals-row span:first-child{color:#6b7280}
.totals-row span:last-child{color:#374151}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none}
.totals-row.total span:first-child{color:#1f2937}
.totals-row.total span:last-child{color:#1f2937}

.payment-details{margin-top:30px}
.payment-details h3{font-size:16px;font-weight:700;color:#1f2937;margin-bottom:16px}
.payment-section{margin-bottom:20px;padding-bottom:15px;border-bottom:1px solid #e2e8f0}
.payment-section:last-child{border-bottom:none}
.payment-method{font-size:15px;font-weight:600;color:#1f2937;margin-bottom:12px}
.payment-grid{font-size:13px;color:#6b7280;line-height:2}
.payment-grid-two-col{display:grid;grid-template-columns:1fr 1fr;gap:4px 30px;font-size:13px;color:#6b7280;line-height:2}
.payment-row{display:flex;gap:10px}
.payment-label{min-width:110px;font-weight:500;color:#4b5563}
.payment-value{color:#6b7280}

.action-bar{position:fixed;bottom:0;left:0;right:0;padding:16px;background:#1f2937;display:flex;gap:12px;justify-content:center;box-shadow:0 -4px 20px rgba(0,0,0,0.3)}
.action-btn{padding:14px 28px;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px}
.print-btn{background:#3b82f6;color:white}
.back-btn{background:#4b5563;color:white}
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
${invoice.dueDate ? `<div class="invoice-meta-row"><span class="invoice-meta-label">Due Date:</span> <span class="invoice-meta-value">${formatDate(invoice.dueDate)}</span></div>` : ''}
${invoice.paymentTermsText ? `<div class="invoice-meta-row"><span class="invoice-meta-label">Terms:</span> <span class="invoice-meta-value">${invoice.paymentTermsText}</span></div>` : ''}
${invoice.customFields.map(f => f.label && f.value ? `<div class="invoice-meta-row"><span class="invoice-meta-label">${f.label}:</span> <span class="invoice-meta-value">${f.value}</span></div>` : '').join('')}
</div>
</div>
</div>

<div class="issued-to">
<h3>Issued To:</h3>
<div class="issued-to-row"><strong>Name:</strong> ${invoice.customerName || ''}</div>
${invoice.customerIdentifier ? `<div class="issued-to-row"><strong>ID:</strong> ${invoice.customerIdentifier}</div>` : ''}
<div class="issued-to-row"><strong>Address:</strong> ${invoice.customerAddress || ''}</div>
<div class="issued-to-row"><strong>Zip Code:</strong> ${invoice.customerZipCode || ''}</div>
${invoice.customerPhone ? `<div class="issued-to-row"><strong>Phone:</strong> ${invoice.customerPhone}</div>` : ''}
${invoice.customerEmail ? `<div class="issued-to-row"><strong>Email:</strong> ${invoice.customerEmail}</div>` : ''}
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

${generatePaymentDetailsHTML()}

${invoice.endMessage ? `<div style="margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:14px;color:#6b7280;line-height:1.6">${invoice.endMessage}</div>` : ''}

<div class="action-bar no-print">
<button class="action-btn back-btn" onclick="window.location.reload()">← Back</button>
<button class="action-btn print-btn" onclick="window.print()">📥 Save PDF</button>
</div>

</body></html>`;

    // For mobile: navigate in same window
    if (isMobile) {
      document.body.innerHTML = '';
      document.open();
      document.write(htmlContent);
      document.close();
    } else {
      // For desktop: open in new tab
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => printWindow.print(), 500);
        };
      } else {
        // Fallback if popup blocked
        document.body.innerHTML = '';
        document.open();
        document.write(htmlContent);
        document.close();
      }
    }
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
    accent: '#3b82f6',
    accentHover: '#60a5fa',
    text: '#f3f4f6',
    textMuted: '#9ca3af',
    border: '#4b5563',
    green: '#10b981',
    red: '#dc2626',
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

  const showEditPanel = !isMobile || !showPreview;
  const showPreviewPanel = !isMobile || showPreview;

  return (
    <div style={{ background: colors.bg, fontFamily: "'Inter', sans-serif", paddingBottom: '40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input, select, textarea { box-sizing: border-box; font-size: 16px !important; }
        input::placeholder, textarea::placeholder { color: #6b7280; }
        input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; outline: none; }
        select option { background: #374151; color: #f3f4f6; }
        .toggle-switch { position: relative; width: 48px; height: 26px; background: #4b5563; border-radius: 13px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
        .toggle-switch.active { background: #3b82f6; }
        .toggle-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; background: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .toggle-switch.active::after { transform: translateX(22px); }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: rgba(6, 182, 212, 0.1); }
        .mode-btn { transition: all 0.2s; cursor: pointer; }
        .mode-btn:hover { opacity: 0.9; }
        .customer-item:hover { background: #374151 !important; }
        .payment-type-btn { transition: all 0.2s; }
        .payment-type-btn:hover { background: #4b5563 !important; }
      `}</style>

      {/* Customer Manager Modal */}
      {showCustomerModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: colors.bg, borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: `1px solid ${colors.border}` }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>👥</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>Customer Manager</span>
              </div>
              <button 
                onClick={() => { setShowAddCustomer(true); setEditingCustomer(null); setNewCustomer({ name: '', identifier: '', address: '', zipCode: '', phone: '', email: '' }); }}
                style={{ padding: '8px 14px', background: colors.accent, color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                👤 Add Customer
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>🔍</span>
                <input 
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Customer List or Add Form */}
            <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
              {showAddCustomer ? (
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Customer | Company Name *</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>👤</span>
                        <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Customer | Company Name" value={newCustomer.name} onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Identifier Number</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>#</span>
                        <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Identifier Number" value={newCustomer.identifier} onChange={(e) => setNewCustomer(prev => ({ ...prev, identifier: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Address</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>🏠</span>
                          <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Address" value={newCustomer.address} onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Zip Code</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>#</span>
                          <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Zip Code" value={newCustomer.zipCode} onChange={(e) => setNewCustomer(prev => ({ ...prev, zipCode: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Phone</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>📞</span>
                          <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Email</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>✉️</span>
                          <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Email" value={newCustomer.email} onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={() => { setShowAddCustomer(false); setEditingCustomer(null); }} style={{ flex: 1, padding: '12px', background: colors.bgInput, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={handleAddCustomer} style={{ flex: 1, padding: '12px', background: colors.green, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                      {editingCustomer ? 'Update Customer' : 'Save Customer'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {filteredCustomers.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textMuted }}>
                      No customers saved yet
                    </div>
                  ) : (
                    <div>
                      {filteredCustomers.map(customer => (
                        <div 
                          key={customer.id} 
                          className="customer-item"
                          style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}`, cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div onClick={() => handleSelectCustomer(customer)} style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', color: colors.text, marginBottom: '4px' }}>{customer.name}</div>
                              <div style={{ fontSize: '13px', color: colors.textMuted }}>
                                {customer.email && <span>{customer.email}</span>}
                                {customer.email && customer.phone && <span> • </span>}
                                {customer.phone && <span>{customer.phone}</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleEditCustomer(customer)} style={{ padding: '8px 12px', background: colors.bgInput, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                              <button onClick={() => handleDeleteCustomer(customer.id)} style={{ padding: '8px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>🗑</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${colors.border}` }}>
              <button onClick={() => { setShowCustomerModal(false); setShowAddCustomer(false); }} style={{ width: '100%', padding: '14px', background: colors.green, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div style={{ background: colors.bg, padding: isMobile ? '30px 16px 20px' : '40px 20px 30px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: isMobile ? '28px' : '48px', 
          fontWeight: '800', 
          color: colors.text, 
          marginBottom: '12px',
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

      {/* Mobile Preview Toggle */}
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
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: colors.text }}>Customer</span>
                  </div>
                  
                  {/* Select Customer Button */}
                  <button 
                    onClick={() => setShowCustomerModal(true)}
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      background: colors.bgInput, 
                      color: colors.textMuted, 
                      border: `1px solid ${colors.border}`, 
                      borderRadius: '8px', 
                      fontWeight: '500', 
                      fontSize: '14px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                    👥 Select Customer
                  </button>

                  <div>
                    <label style={labelStyle}>Customer | Company Name</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>👤</span>
                      <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Customer | Company Name" value={invoice.customerName} onChange={(e) => updateField('customerName', e.target.value)} />
                    </div>
                  </div>
                  
                  <div>
                    <label style={labelStyle}>Identifier Number</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>#</span>
                      <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Identifier Number" value={invoice.customerIdentifier} onChange={(e) => updateField('customerIdentifier', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Address</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>🏠</span>
                        <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Address" value={invoice.customerAddress} onChange={(e) => updateField('customerAddress', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Zip Code</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>#</span>
                        <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Zip Code" value={invoice.customerZipCode} onChange={(e) => updateField('customerZipCode', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>📞</span>
                        <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Phone" value={invoice.customerPhone} onChange={(e) => updateField('customerPhone', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>✉️</span>
                        <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="Email" value={invoice.customerEmail} onChange={(e) => updateField('customerEmail', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'invoice' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {/* Invoice Number with Generate Button */}
                  <div>
                    <label style={labelStyle}>Invoice Number</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>📄</span>
                        <input style={{ ...inputStyle, paddingLeft: '40px' }} value={invoice.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} />
                      </div>
                      <button 
                        onClick={() => updateField('invoiceNumber', generateInvoiceNumber())}
                        style={{ padding: '12px 16px', background: colors.green, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        + Generate
                      </button>
                    </div>
                  </div>

                  {/* Terms of Payment */}
                  <div>
                    <label style={labelStyle}>Terms of Payment</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>📋</span>
                      <input style={{ ...inputStyle, paddingLeft: '40px' }} placeholder="e.g. 30% advance, 70% before shipment" value={invoice.paymentTermsText} onChange={(e) => updateField('paymentTermsText', e.target.value)} />
                    </div>
                  </div>

                  {/* Custom Fields */}
                  <div>
                    <label style={labelStyle}>Custom Fields</label>
                    <button 
                      onClick={() => {
                        const newField = { id: Date.now(), label: '', value: '' };
                        updateField('customFields', [...invoice.customFields, newField]);
                      }}
                      style={{ padding: '10px 16px', background: colors.bgInput, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      + Add Custom Field
                    </button>
                    
                    {/* Custom Fields List */}
                    {invoice.customFields.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
                        {invoice.customFields.map((field) => (
                          <div key={field.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                              style={{ ...inputStyle, flex: 1 }} 
                              placeholder="Field Label" 
                              value={field.label} 
                              onChange={(e) => {
                                const updated = invoice.customFields.map(f => f.id === field.id ? { ...f, label: e.target.value } : f);
                                updateField('customFields', updated);
                              }} 
                            />
                            <input 
                              style={{ ...inputStyle, flex: 1 }} 
                              placeholder="Field Value" 
                              value={field.value} 
                              onChange={(e) => {
                                const updated = invoice.customFields.map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                                updateField('customFields', updated);
                              }} 
                            />
                            <button 
                              onClick={() => updateField('customFields', invoice.customFields.filter(f => f.id !== field.id))}
                              style={{ padding: '10px 14px', background: colors.red, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px' }}>
                              🗑
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Issue Date / Due Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Issue Date</label>
                      <input type="date" style={inputStyle} value={invoice.issueDate} onChange={(e) => updateField('issueDate', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Due Date (Optional)</label>
                      <input type="date" style={inputStyle} value={invoice.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} />
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>{currencySymbol}</span>
                      <select style={{ ...inputStyle, paddingLeft: '40px' }} value={invoice.currency} onChange={(e) => updateField('currency', e.target.value)}>
                        {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.code === 'USD' ? 'US Dollar' : c.code === 'EUR' ? 'Euro' : c.code === 'GBP' ? 'British Pound' : c.code === 'CAD' ? 'Canadian Dollar' : c.code === 'AUD' ? 'Australian Dollar' : c.code === 'JPY' ? 'Japanese Yen' : 'Indian Rupee'}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* End Message */}
                  <div>
                    <label style={labelStyle}>End Message (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '14px', color: colors.textMuted }}>📝</span>
                      <textarea 
                        style={{ ...inputStyle, paddingLeft: '40px', minHeight: '80px', resize: 'vertical' }} 
                        placeholder="Optional" 
                        value={invoice.endMessage} 
                        onChange={(e) => updateField('endMessage', e.target.value)} 
                      />
                    </div>
                  </div>
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
                            <button onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} style={{ width: '100%', padding: '10px', background: colors.red, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: invoice.items.length === 1 ? 0.3 : 1, fontSize: '18px', marginTop: isMobile ? '0' : '22px' }}>🗑</button>
                          </div>
                        </div>
                      ) : (
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
                            <button onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} style={{ width: '100%', padding: '10px', background: colors.red, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: invoice.items.length === 1 ? 0.3 : 1, fontSize: '18px', marginTop: isMobile ? '0' : '22px' }}>🗑</button>
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
                <div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: colors.text }}>Payment Methods</span>
                  </div>

                  {/* Add Payment Method Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', marginBottom: '20px' }}>
                    <button 
                      className="payment-type-btn"
                      onClick={() => addPaymentMethod('bank')}
                      style={{ padding: '10px 16px', background: colors.bgInput, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🏦 Add Bank
                    </button>
                    <button 
                      className="payment-type-btn"
                      onClick={() => addPaymentMethod('paypal')}
                      style={{ padding: '10px 16px', background: colors.bgInput, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🅿️ Add PayPal
                    </button>
                    <button 
                      className="payment-type-btn"
                      onClick={() => addPaymentMethod('crypto')}
                      style={{ padding: '10px 16px', background: colors.bgInput, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ₿ Add Crypto
                    </button>
                    <button 
                      className="payment-type-btn"
                      onClick={() => addPaymentMethod('custom')}
                      style={{ padding: '10px 16px', background: colors.bgInput, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: '6px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✏️ Add Custom Payment
                    </button>
                  </div>

                  {/* Payment Methods List */}
                  {invoice.paymentMethods.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: colors.textMuted, background: colors.bgInput, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                      No payment methods added yet. Click a button above to add one.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {invoice.paymentMethods.map(pm => (
                        <div key={pm.id} style={{ padding: '16px', background: colors.bgInput, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                          {/* Bank */}
                          {pm.type === 'bank' && (
                            <>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '14px' }}>Bank</div>
                              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                                <div><input style={inputStyle} placeholder="Bank Name" value={pm.bankName} onChange={(e) => updatePaymentMethod(pm.id, 'bankName', e.target.value)} /></div>
                                <div><input style={inputStyle} placeholder="Branch" value={pm.branch} onChange={(e) => updatePaymentMethod(pm.id, 'branch', e.target.value)} /></div>
                                <div><input style={inputStyle} placeholder="Address" value={pm.bankAddress} onChange={(e) => updatePaymentMethod(pm.id, 'bankAddress', e.target.value)} /></div>
                                <div><input style={inputStyle} placeholder="Account Name" value={pm.accountName} onChange={(e) => updatePaymentMethod(pm.id, 'accountName', e.target.value)} /></div>
                                <div><input style={inputStyle} placeholder="Account Number" value={pm.accountNumber} onChange={(e) => updatePaymentMethod(pm.id, 'accountNumber', e.target.value)} /></div>
                                <div><input style={inputStyle} placeholder="Routing Number" value={pm.routingNumber} onChange={(e) => updatePaymentMethod(pm.id, 'routingNumber', e.target.value)} /></div>
                                <div><input style={inputStyle} placeholder="Sort Code" value={pm.sortCode} onChange={(e) => updatePaymentMethod(pm.id, 'sortCode', e.target.value)} /></div>
                                <div><input style={inputStyle} placeholder="SWIFT Code" value={pm.swift} onChange={(e) => updatePaymentMethod(pm.id, 'swift', e.target.value)} /></div>
                              </div>
                              <div style={{ marginTop: '12px' }}>
                                <input style={inputStyle} placeholder="IBAN" value={pm.iban} onChange={(e) => updatePaymentMethod(pm.id, 'iban', e.target.value)} />
                              </div>
                            </>
                          )}

                          {/* PayPal */}
                          {pm.type === 'paypal' && (
                            <>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '14px' }}>PayPal</div>
                              <input style={inputStyle} placeholder="PayPal Email" value={pm.paypalEmail} onChange={(e) => updatePaymentMethod(pm.id, 'paypalEmail', e.target.value)} />
                            </>
                          )}

                          {/* Crypto */}
                          {pm.type === 'crypto' && (
                            <>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '14px' }}>Cryptocurrency</div>
                              <div style={{ display: 'grid', gap: '12px' }}>
                                <select style={inputStyle} value={pm.cryptoType} onChange={(e) => updatePaymentMethod(pm.id, 'cryptoType', e.target.value)}>
                                  <option value="Bitcoin">Bitcoin (BTC)</option>
                                  <option value="Ethereum">Ethereum (ETH)</option>
                                  <option value="USDT">USDT (Tether)</option>
                                  <option value="USDC">USDC</option>
                                  <option value="Litecoin">Litecoin (LTC)</option>
                                  <option value="Other">Other</option>
                                </select>
                                <input style={inputStyle} placeholder="Wallet Address" value={pm.walletAddress} onChange={(e) => updatePaymentMethod(pm.id, 'walletAddress', e.target.value)} />
                              </div>
                            </>
                          )}

                          {/* Custom */}
                          {pm.type === 'custom' && (
                            <>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '14px' }}>Custom Payment</div>
                              <div style={{ display: 'grid', gap: '12px' }}>
                                <input style={inputStyle} placeholder="Payment Method Name" value={pm.customName} onChange={(e) => updatePaymentMethod(pm.id, 'customName', e.target.value)} />
                                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Payment Details" value={pm.customDetails} onChange={(e) => updatePaymentMethod(pm.id, 'customDetails', e.target.value)} />
                              </div>
                            </>
                          )}

                          {/* Remove Button */}
                          <button 
                            onClick={() => removePaymentMethod(pm.id)}
                            style={{ marginTop: '14px', padding: '10px 16px', background: colors.red, color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
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
                      <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Invoice #:</span> {invoice.invoiceNumber}</div>
                      <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Issue Date:</span> {formatDate(invoice.issueDate)}</div>
                      {invoice.dueDate && <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Due Date:</span> {formatDate(invoice.dueDate)}</div>}
                      {invoice.paymentTermsText && <div><span style={{ color: '#3b82f6', fontWeight: '500' }}>Terms:</span> {invoice.paymentTermsText}</div>}
                      {invoice.customFields.map(f => f.label && f.value ? <div key={f.id}><span style={{ color: '#3b82f6', fontWeight: '500' }}>{f.label}:</span> {f.value}</div> : null)}
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
                    {invoice.customerEmail && <div>{invoice.customerEmail}</div>}
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

                {/* Payment Details Preview */}
                {invoice.paymentMethods.length > 0 && (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>Payment Details</div>
                    {invoice.paymentMethods.map(pm => (
                      <div key={pm.id} style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        {pm.type === 'bank' && (
                          <>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Method: Bank</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: '10px', color: '#64748b', lineHeight: '1.8' }}>
                              <div><span style={{ fontWeight: '500' }}>Bank:</span> {pm.bankName || ''}</div>
                              <div><span style={{ fontWeight: '500' }}>Branch:</span> {pm.branch || ''}</div>
                              <div><span style={{ fontWeight: '500' }}>Address:</span> {pm.bankAddress || ''}</div>
                              <div><span style={{ fontWeight: '500' }}>Account Name:</span> {pm.accountName || ''}</div>
                              <div><span style={{ fontWeight: '500' }}>Account #:</span> {pm.accountNumber || ''}</div>
                              <div><span style={{ fontWeight: '500' }}>Routing #:</span> {pm.routingNumber || ''}</div>
                              <div><span style={{ fontWeight: '500' }}>Sort Code:</span> {pm.sortCode || ''}</div>
                              <div><span style={{ fontWeight: '500' }}>SWIFT:</span> {pm.swift || ''}</div>
                              <div><span style={{ fontWeight: '500' }}>IBAN:</span> {pm.iban || ''}</div>
                            </div>
                          </>
                        )}
                        {pm.type === 'paypal' && (
                          <>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Method: PayPal</div>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>{pm.paypalEmail}</div>
                          </>
                        )}
                        {pm.type === 'crypto' && (
                          <>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Method: {pm.cryptoType}</div>
                            <div style={{ fontSize: '10px', color: '#64748b', wordBreak: 'break-all' }}>{pm.walletAddress}</div>
                          </>
                        )}
                        {pm.type === 'custom' && (
                          <>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Method: {pm.customName || 'Custom'}</div>
                            <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'pre-wrap' }}>{pm.customDetails}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* End Message Preview */}
                {invoice.endMessage && (
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '10px', color: '#64748b', lineHeight: '1.6' }}>
                    {invoice.endMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Disclaimer */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ background: colors.bgCard, borderRadius: '10px', padding: '16px 20px', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: colors.text, marginBottom: '8px' }}>Privacy Disclaimer:</div>
          <p style={{ fontSize: '12px', color: colors.textMuted, lineHeight: '1.7', margin: 0 }}>
            Day One offers a free invoice generator tool that allows users to create and download invoices without creating an account. When you use this tool, we do not collect any personal information, customer, product or invoice data, or file uploads. The invoices you generate are processed locally in your browser, ensuring that your data remains private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
