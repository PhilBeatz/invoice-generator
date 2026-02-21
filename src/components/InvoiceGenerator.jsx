import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchInvoiceById, finalizeInvoice, upsertAutoDraft, fetchCustomers, createCustomer as createCustomerDb, updateCustomer as updateCustomerDb, deleteCustomer as deleteCustomerDb, fetchOrganization } from '../supabaseService';

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

// Invoice Templates
const templates = [
  { id: 'regular', name: 'Regular', description: 'Balanced default design' },
  { id: 'bold', name: 'Bold Professional', description: 'Strong dark header style' },
  { id: 'mono', name: 'Mono', description: 'Clean and minimal style' },
  { id: 'modern', name: 'Startup Modern', description: 'Modern and sleek style' },
];

// Invoice Languages
const languages = [
  { code: 'english', name: 'English', native: 'English' },
  { code: 'spanish', name: 'Spanish', native: 'Español' },
  { code: 'french', name: 'French', native: 'Français' },
  { code: 'german', name: 'German', native: 'Deutsch' },
  { code: 'italian', name: 'Italian', native: 'Italiano' },
  { code: 'portuguese', name: 'Portuguese', native: 'Português' },
  { code: 'chinese', name: 'Chinese', native: '中文' },
  { code: 'japanese', name: 'Japanese', native: '日本語' },
  { code: 'korean', name: 'Korean', native: '한국어' },
  { code: 'arabic', name: 'Arabic', native: 'العربية' },
];

// Language translations for invoice labels
const translations = {
  english: { invoice: 'INVOICE', invoiceNumber: 'Invoice #', issueDate: 'Issue Date', dueDate: 'Due Date', issuedTo: 'Issued To', product: 'Product', service: 'Service', qty: 'Qty', hrs: 'Hrs', rate: 'Rate', price: 'Unit Price', amount: 'Amount', subtotal: 'Subtotal', shipping: 'Shipping', discount: 'Discount', tax: 'Tax', total: 'Total', paymentDetails: 'Payment Details', paymentMethod: 'Payment Method' },
  spanish: { invoice: 'FACTURA', invoiceNumber: 'Factura #', issueDate: 'Fecha de Emisión', dueDate: 'Fecha de Vencimiento', issuedTo: 'Emitido A', product: 'Producto', service: 'Servicio', qty: 'Cant', hrs: 'Hrs', rate: 'Tarifa', price: 'Precio', amount: 'Importe', subtotal: 'Subtotal', shipping: 'Envío', discount: 'Descuento', tax: 'Impuesto', total: 'Total', paymentDetails: 'Detalles de Pago', paymentMethod: 'Método de Pago' },
  french: { invoice: 'FACTURE', invoiceNumber: 'Facture #', issueDate: "Date d'Émission", dueDate: "Date d'Échéance", issuedTo: 'Émis À', product: 'Produit', service: 'Service', qty: 'Qté', hrs: 'Hrs', rate: 'Taux', price: 'Prix', amount: 'Montant', subtotal: 'Sous-total', shipping: 'Livraison', discount: 'Remise', tax: 'Taxe', total: 'Total', paymentDetails: 'Détails de Paiement', paymentMethod: 'Mode de Paiement' },
  german: { invoice: 'RECHNUNG', invoiceNumber: 'Rechnung #', issueDate: 'Ausstellungsdatum', dueDate: 'Fälligkeitsdatum', issuedTo: 'Ausgestellt An', product: 'Produkt', service: 'Dienstleistung', qty: 'Menge', hrs: 'Std', rate: 'Satz', price: 'Preis', amount: 'Betrag', subtotal: 'Zwischensumme', shipping: 'Versand', discount: 'Rabatt', tax: 'Steuer', total: 'Gesamt', paymentDetails: 'Zahlungsdetails', paymentMethod: 'Zahlungsmethode' },
  italian: { invoice: 'FATTURA', invoiceNumber: 'Fattura #', issueDate: 'Data di Emissione', dueDate: 'Data di Scadenza', issuedTo: 'Emesso A', product: 'Prodotto', service: 'Servizio', qty: 'Qtà', hrs: 'Ore', rate: 'Tariffa', price: 'Prezzo', amount: 'Importo', subtotal: 'Subtotale', shipping: 'Spedizione', discount: 'Sconto', tax: 'Tasse', total: 'Totale', paymentDetails: 'Dettagli Pagamento', paymentMethod: 'Metodo di Pagamento' },
  portuguese: { invoice: 'FATURA', invoiceNumber: 'Fatura #', issueDate: 'Data de Emissão', dueDate: 'Data de Vencimento', issuedTo: 'Emitido Para', product: 'Produto', service: 'Serviço', qty: 'Qtd', hrs: 'Hrs', rate: 'Taxa', price: 'Preço', amount: 'Valor', subtotal: 'Subtotal', shipping: 'Frete', discount: 'Desconto', tax: 'Imposto', total: 'Total', paymentDetails: 'Detalhes do Pagamento', paymentMethod: 'Forma de Pagamento' },
  chinese: { invoice: '发票', invoiceNumber: '发票编号', issueDate: '开票日期', dueDate: '到期日', issuedTo: '开票给', product: '产品', service: '服务', qty: '数量', hrs: '小时', rate: '费率', price: '单价', amount: '金额', subtotal: '小计', shipping: '运费', discount: '折扣', tax: '税', total: '总计', paymentDetails: '付款详情', paymentMethod: '付款方式' },
  japanese: { invoice: '請求書', invoiceNumber: '請求書番号', issueDate: '発行日', dueDate: '支払期日', issuedTo: '請求先', product: '商品', service: 'サービス', qty: '数量', hrs: '時間', rate: '単価', price: '価格', amount: '金額', subtotal: '小計', shipping: '送料', discount: '割引', tax: '税', total: '合計', paymentDetails: '支払い詳細', paymentMethod: '支払い方法' },
  korean: { invoice: '청구서', invoiceNumber: '청구서 번호', issueDate: '발행일', dueDate: '만기일', issuedTo: '청구 대상', product: '제품', service: '서비스', qty: '수량', hrs: '시간', rate: '요율', price: '가격', amount: '금액', subtotal: '소계', shipping: '배송비', discount: '할인', tax: '세금', total: '총계', paymentDetails: '결제 정보', paymentMethod: '결제 방법' },
  arabic: { invoice: 'فاتورة', invoiceNumber: 'رقم الفاتورة', issueDate: 'تاريخ الإصدار', dueDate: 'تاريخ الاستحقاق', issuedTo: 'صادرة إلى', product: 'منتج', service: 'خدمة', qty: 'الكمية', hrs: 'ساعات', rate: 'معدل', price: 'السعر', amount: 'المبلغ', subtotal: 'المجموع الفرعي', shipping: 'الشحن', discount: 'خصم', tax: 'ضريبة', total: 'الإجمالي', paymentDetails: 'تفاصيل الدفع', paymentMethod: 'طريقة الدفع' },
};

// Date Formats
const dateFormats = [
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2025' },
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2025' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2025-12-31' },
  { id: 'Month DD, YYYY', label: 'Month DD, YYYY', example: 'December 31, 2025' },
  { id: 'DD Month YYYY', label: 'DD Month YYYY', example: '31 December 2025' },
  { id: 'Mon DD, YYYY', label: 'Mon DD, YYYY', example: 'Dec 31, 2025' },
  { id: 'DD Mon YYYY', label: 'DD Mon YYYY', example: '31 Dec 2025' },
];

// Template style configurations
const getTemplateStyles = (templateId) => {
  switch (templateId) {
    case 'bold':
      return {
        headerBg: '#1a1a2e',
        headerText: '#ffffff',
        accentColor: '#10b981',
        invoiceBadgeBg: '#10b981',
        invoiceBadgeText: '#ffffff',
        tableHeaderBg: '#f1f5f9',
        borderColor: '#e2e8f0',
        totalBg: '#1a1a2e',
        totalText: '#ffffff',
      };
    case 'mono':
      return {
        headerBg: '#ffffff',
        headerText: '#1f2937',
        accentColor: '#6b7280',
        invoiceBadgeBg: '#f3f4f6',
        invoiceBadgeText: '#374151',
        tableHeaderBg: '#f9fafb',
        borderColor: '#e5e7eb',
        totalBg: '#f9fafb',
        totalText: '#1f2937',
      };
    case 'modern':
      return {
        headerBg: '#ffffff',
        headerText: '#1f2937',
        accentColor: '#3b82f6',
        invoiceBadgeBg: '#3b82f6',
        invoiceBadgeText: '#ffffff',
        tableHeaderBg: '#eff6ff',
        borderColor: '#dbeafe',
        totalBg: '#3b82f6',
        totalText: '#ffffff',
      };
    default: // regular
      return {
        headerBg: '#ffffff',
        headerText: '#1e40af',
        accentColor: '#3b82f6',
        invoiceBadgeBg: '#3b82f6',
        invoiceBadgeText: '#ffffff',
        tableHeaderBg: '#f8fafc',
        borderColor: '#e2e8f0',
        totalBg: '#f8fafc',
        totalText: '#1f2937',
      };
  }
};

// Generate random invoice number
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const random = Math.floor(Math.random() * 900000) + 100000;
  const suffix = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${random}-${suffix}`;
};

// Format date based on selected format
const formatDateWithFormat = (dateStr, format) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const yyyy = year;
  
  switch (format) {
    case 'MM/DD/YYYY': return `${mm}/${dd}/${yyyy}`;
    case 'DD/MM/YYYY': return `${dd}/${mm}/${yyyy}`;
    case 'YYYY-MM-DD': return `${yyyy}-${mm}-${dd}`;
    case 'Month DD, YYYY': return `${months[month - 1]} ${day}, ${yyyy}`;
    case 'DD Month YYYY': return `${day} ${months[month - 1]} ${yyyy}`;
    case 'Mon DD, YYYY': return `${monthsShort[month - 1]} ${day}, ${yyyy}`;
    case 'DD Mon YYYY': return `${day} ${monthsShort[month - 1]} ${yyyy}`;
    default: return `${months[month - 1]} ${day}, ${yyyy}`;
  }
};

export default function InvoiceGenerator({ darkMode = true, inDashboard = false, user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoice, setInvoice] = useState(defaultInvoice);
  const [logoPreview, setLogoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('business');
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // New: Template, Language, Date Format settings (for dashboard users)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('regular');
  const [invoiceLanguage, setInvoiceLanguage] = useState('english');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [showTemplateSubmenu, setShowTemplateSubmenu] = useState(false);
  const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false);
  const [showDateSubmenu, setShowDateSubmenu] = useState(false);
  const [templatePreviewModal, setTemplatePreviewModal] = useState(null);
  
  // Customer Manager state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '', identifier: '', address: '', zipCode: '', phone: '', email: ''
  });

  // Load customers from Supabase (or localStorage for non-dashboard)
  useEffect(() => {
    if (inDashboard && user) {
      fetchCustomers().then(data => setCustomers(data)).catch(e => console.error('Error loading customers:', e));
    } else {
      const savedCustomers = localStorage.getItem('dayonetools_customers');
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      }
    }
  }, [inDashboard, user]);

  // Auto-fill company info from Supabase org data (dashboard only, new invoices only)
  useEffect(() => {
    if (!inDashboard || !user) return;
    const editId = searchParams.get('edit');
    if (editId) return; // Don't overwrite when editing existing invoice

    fetchOrganization().then(org => {
      if (org && (org.name || org.email || org.phone || org.address)) {
        setInvoice(prev => ({
          ...prev,
          businessName: prev.businessName || org.name || '',
          businessEmail: prev.businessEmail || org.email || '',
          businessPhone: prev.businessPhone || org.phone || '',
          businessAddress: prev.businessAddress || org.address || '',
        }));
        if (!logoPreview && org.logo) {
          setLogoPreview(org.logo);
        }
      }
    }).catch(e => console.error('Error loading org data:', e));
  }, [inDashboard, user]);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  // Product modal states
  const [showTemporaryProductModal, setShowTemporaryProductModal] = useState(false);
  const [showProductSelectorModal, setShowProductSelectorModal] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [selectedCatalogProducts, setSelectedCatalogProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState({ name: '', model: '', price: '', quantity: 1 });

  // Load catalog products from Supabase (or localStorage for non-dashboard)
  useEffect(() => {
    if (inDashboard) {
      import('../supabaseService').then(mod => {
        mod.fetchProducts().then(data => setCatalogProducts(data)).catch(e => console.error('Error loading products:', e));
      });
    } else {
      const saved = localStorage.getItem('dayonetools_products');
      if (saved) {
        setCatalogProducts(JSON.parse(saved));
      }
    }
  }, [showProductSelectorModal, inDashboard]);

  // Load invoice for editing (from URL param ?edit=invoiceId)
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;
    fetchInvoiceById(editId).then(parsed => {
      // Check if we have unsaved edits in sessionStorage
      const savedEdit = sessionStorage.getItem('dayonetools_edit_formstate');
      if (savedEdit) {
        try {
          const savedParsed = JSON.parse(savedEdit);
          // Only use saved state if it's for the same invoice
          if (savedParsed.invoiceNumber === parsed.invoiceNumber) {
            setInvoice(prev => ({
              ...prev,
              ...savedParsed,
              items: savedParsed.items || [{ id: 1, description: '', sku: '', quantity: 1, price: 0, hours: 1, rate: 0 }],
            }));
            if (savedParsed.logoPreview) setLogoPreview(savedParsed.logoPreview);
            else if (parsed.logoPreview) setLogoPreview(parsed.logoPreview);
            setIsEditMode(true);
            setEditingInvoiceId(parsed.id);
            return;
          }
        } catch (e) { /* fall through to normal load */ }
      }
      sessionStorage.removeItem('dayonetools_edit_formstate');
      setInvoice(prev => ({
        ...prev,
        ...parsed,
        items: parsed.items || [{ id: 1, description: '', sku: '', quantity: 1, price: 0, hours: 1, rate: 0 }],
      }));
      if (parsed.logoPreview) setLogoPreview(parsed.logoPreview);
      setIsEditMode(true);
      setEditingInvoiceId(parsed.id);
    }).catch(e => console.error('Failed to load invoice for editing:', e));
  }, [searchParams]);

  // Persist invoice form data to survive tab switches, minimizes, and HMR in dev
  // Save form state on every change
  useEffect(() => {
    if (isEditMode) {
      sessionStorage.setItem('dayonetools_edit_formstate', JSON.stringify(invoice));
    } else {
      localStorage.setItem('dayonetools_invoice_formstate', JSON.stringify(invoice));
    }
  }, [invoice, isEditMode]);

  // Save logo separately (too large for frequent JSON serialization with invoice)
  useEffect(() => {
    if (logoPreview && !isEditMode) {
      localStorage.setItem('dayonetools_logo_formstate', logoPreview);
    }
  }, [logoPreview, isEditMode]);

  // Restore form state on mount (runs once)
  useEffect(() => {
    // Don't restore if we're in edit mode (edit data is loaded separately)
    if (isEditMode) return;
    
    const savedForm = localStorage.getItem('dayonetools_invoice_formstate');
    const savedLogo = localStorage.getItem('dayonetools_logo_formstate');
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        // Only restore if there's actual data (not just defaults)
        const hasData = parsed.businessName || parsed.customerName || 
          parsed.items?.some(item => item.description || item.price > 0 || item.rate > 0);
        if (hasData) {
          setInvoice(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to restore form state:', e);
      }
    }
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }
  }, []);

  // Clear form state when invoice is successfully saved/created
  const clearFormState = () => {
    localStorage.removeItem('dayonetools_invoice_formstate');
    localStorage.removeItem('dayonetools_logo_formstate');
    sessionStorage.removeItem('dayonetools_edit_formstate');
  };

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

  // Save customers to localStorage when changed (non-dashboard only)
  useEffect(() => {
    if (!inDashboard) {
      localStorage.setItem('dayonetools_customers', JSON.stringify(customers));
    }
  }, [customers, inDashboard]);

  // Auto-save disabled - form state persistence via localStorage/sessionStorage handles this
  // The auto-draft was creating duplicate invoices, so we rely on client-side persistence instead

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSettingsMenu && !e.target.closest('.settings-menu-container')) {
        setShowSettingsMenu(false);
        setShowTemplateSubmenu(false);
        setShowLanguageSubmenu(false);
        setShowDateSubmenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSettingsMenu]);

  // Get current language translations
  const t = translations[invoiceLanguage] || translations.english;

  const currencySymbol = currencies.find(c => c.code === invoice.currency)?.symbol || '$';
  const templateStyles = getTemplateStyles(selectedTemplate);
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
  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    
    if (inDashboard && user) {
      try {
        if (editingCustomer) {
          const updated = await updateCustomerDb(editingCustomer.id, newCustomer, user.id);
          setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? updated : c));
          setEditingCustomer(null);
        } else {
          const created = await createCustomerDb(newCustomer, user.id);
          setCustomers(prev => [created, ...prev]);
        }
      } catch (e) {
        console.error('Error saving customer:', e);
      }
    } else {
      const customer = { id: Date.now(), ...newCustomer };
      if (editingCustomer) {
        setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...customer, id: editingCustomer.id } : c));
        setEditingCustomer(null);
      } else {
        setCustomers(prev => [...prev, customer]);
      }
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

  const handleDeleteCustomer = async (id) => {
    if (inDashboard) {
      try {
        await deleteCustomerDb(id);
      } catch (e) {
        console.error('Error deleting customer:', e);
      }
    }
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

  // Validation function used by both downloadPDF and saveInvoiceAndNavigate
  const validateInvoice = () => {
    const errors = [];
    
    // Company/Business validation
    if (!invoice.businessName?.trim()) {
      errors.push('Business/Company name is required');
    }
    
    // Customer validation
    if (!invoice.customerName?.trim()) {
      errors.push('Customer name is required');
    }
    
    // Product/Service validation - at least one item with description and amount
    const validItems = invoice.items.filter(item => {
      const hasDescription = item.description?.trim();
      const hasAmount = invoice.invoiceMode === 'products' 
        ? (item.quantity > 0 && item.price > 0)
        : (item.hours > 0 && item.rate > 0);
      return hasDescription && hasAmount;
    });
    
    if (validItems.length === 0) {
      errors.push('At least one product/service with description and price is required');
    }
    
    return errors;
  };

  const downloadPDF = () => {
    // Save current state to localStorage before showing PDF (for mobile back button)
    if (isMobile) {
      localStorage.setItem('dayonetools_invoice_draft', JSON.stringify(invoice));
      localStorage.setItem('dayonetools_logo_draft', logoPreview || '');
    }

    // Use template styles and translations for dashboard users
    const ts = inDashboard ? templateStyles : getTemplateStyles('regular');
    const lang = inDashboard ? t : translations.english;
    const formatDateFn = inDashboard ? (d) => formatDateWithFormat(d, dateFormat) : formatDate;

    // Generate template-specific styles
    const getTemplateCSS = () => {
      if (!inDashboard || selectedTemplate === 'regular') {
        return `
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;flex-wrap:wrap;gap:15px}
.business-name{font-size:22px;font-weight:700;color:#1e40af;margin-bottom:6px;white-space:nowrap}
.invoice-badge{display:inline-block;padding:8px 20px;background:${ts.invoiceBadgeBg};color:${ts.invoiceBadgeText};border-radius:4px;font-size:18px;font-weight:700;margin-bottom:12px}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none;background:${ts.totalBg};color:${ts.totalText};padding:10px;border-radius:4px}
`;
      }
      if (selectedTemplate === 'bold') {
        return `
.header{background:#1a1a2e;color:white;padding:24px;margin:-30px -40px 30px;border-radius:0}
.business-name{font-size:22px;font-weight:700;color:white;margin-bottom:6px;white-space:nowrap}
.business-details{color:rgba(255,255,255,0.7)}
.logo-img{filter:brightness(0) invert(1)}
.invoice-badge{display:inline-block;padding:8px 20px;background:#10b981;color:white;border-radius:4px;font-size:18px;font-weight:700;margin-bottom:12px}
.invoice-meta-label{color:rgba(255,255,255,0.6)}
.invoice-meta-value{color:white}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none;background:#1a1a2e;color:white;padding:10px;border-radius:4px}
`;
      }
      if (selectedTemplate === 'mono') {
        return `
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;flex-wrap:wrap;gap:15px}
.business-name{font-size:22px;font-weight:700;color:#1f2937;margin-bottom:6px;white-space:nowrap}
.invoice-badge{display:inline-block;padding:8px 20px;background:#f3f4f6;color:#374151;border-radius:4px;font-size:18px;font-weight:700;margin-bottom:12px}
.invoice-meta-label{color:#6b7280}
.items-table th{background:#f9fafb}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none;background:#f9fafb;color:#1f2937;padding:10px;border-radius:4px}
`;
      }
      // modern
      return `
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;flex-wrap:wrap;gap:15px}
.business-name{font-size:22px;font-weight:700;color:#1f2937;margin-bottom:6px;white-space:nowrap}
.invoice-badge{display:inline-block;padding:8px 20px;background:#3b82f6;color:white;border-radius:4px;font-size:18px;font-weight:700;margin-bottom:12px}
.items-table th{background:#eff6ff;border-color:#dbeafe}
.totals-row.total{font-weight:700;font-size:18px;margin-top:6px;border-bottom:none;background:#3b82f6;color:white;padding:10px;border-radius:4px}
`;
    };

    const htmlContent = `<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title>
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
${getTemplateCSS()}
</style></head><body>

<div class="header">
<div class="business-info">
${logoPreview ? `<img src="${logoPreview}" class="logo-img" />` : ''}
<div class="business-name">${invoice.businessName || 'Your Business Name'}</div>
<div class="business-details">${invoice.businessAddress ? invoice.businessAddress + '<br>' : ''}${invoice.businessEmail ? invoice.businessEmail + '<br>' : ''}${invoice.businessPhone || ''}</div>
</div>
<div class="invoice-title">
<div class="invoice-badge">${lang.invoice}</div>
<div class="invoice-meta">
<div class="invoice-meta-row"><span class="invoice-meta-label">${lang.invoiceNumber}</span> <span class="invoice-meta-value">${invoice.invoiceNumber}</span></div>
<div class="invoice-meta-row"><span class="invoice-meta-label">${lang.issueDate}:</span> <span class="invoice-meta-value">${formatDateFn(invoice.issueDate)}</span></div>
${invoice.dueDate ? `<div class="invoice-meta-row"><span class="invoice-meta-label">${lang.dueDate}:</span> <span class="invoice-meta-value">${formatDateFn(invoice.dueDate)}</span></div>` : ''}
${invoice.paymentTermsText ? `<div class="invoice-meta-row"><span class="invoice-meta-label">Terms:</span> <span class="invoice-meta-value">${invoice.paymentTermsText}</span></div>` : ''}
${invoice.customFields.map(f => f.label && f.value ? `<div class="invoice-meta-row"><span class="invoice-meta-label">${f.label}:</span> <span class="invoice-meta-value">${f.value}</span></div>` : '').join('')}
</div>
</div>
</div>

<div class="issued-to">
<h3>${lang.issuedTo}:</h3>
<div class="issued-to-row"><strong>Name:</strong> ${invoice.customerName || ''}</div>
${invoice.customerIdentifier ? `<div class="issued-to-row"><strong>ID:</strong> ${invoice.customerIdentifier}</div>` : ''}
<div class="issued-to-row"><strong>Address:</strong> ${invoice.customerAddress || ''}${invoice.customerZipCode ? `, ${invoice.customerZipCode}` : ''}</div>
${invoice.customerPhone ? `<div class="issued-to-row"><strong>Phone:</strong> ${invoice.customerPhone}</div>` : ''}
${invoice.customerEmail ? `<div class="issued-to-row"><strong>Email:</strong> ${invoice.customerEmail}</div>` : ''}
</div>

<table class="items-table">
<thead><tr>
<th style="width:${invoice.invoiceMode === 'hours' ? '40%' : '35%'}">${invoice.invoiceMode === 'hours' ? lang.service : lang.product}</th>
${invoice.invoiceMode === 'products' ? '<th style="width:15%">SKU</th>' : ''}
<th style="width:12%">${invoice.invoiceMode === 'hours' ? lang.hrs : lang.qty}</th>
<th style="width:18%">${invoice.invoiceMode === 'hours' ? lang.rate : lang.price}</th>
<th style="width:18%">${lang.amount}</th>
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
<div class="totals-row"><span>${lang.subtotal}:</span><span>${formatCurrency(subtotal)}</span></div>
${discountAmount > 0 ? `<div class="totals-row"><span>${lang.discount}:</span><span>-${formatCurrency(discountAmount)}</span></div>` : ''}
${!invoice.taxIncluded && taxAmount > 0 ? `<div class="totals-row"><span>${lang.tax} ${invoice.taxType === 'percent' ? `(${invoice.taxRate}%)` : ''}:</span><span>${formatCurrency(taxAmount)}</span></div>` : ''}
${invoice.taxIncluded && invoice.taxRate > 0 ? `<div class="totals-row"><span>${lang.tax} (included):</span><span>${invoice.taxType === 'percent' ? `${invoice.taxRate}%` : formatCurrency(invoice.taxRate)}</span></div>` : ''}
${shippingAmount > 0 ? `<div class="totals-row"><span>${lang.shipping}:</span><span>${formatCurrency(shippingAmount)}</span></div>` : ''}
<div class="totals-row total"><span>${lang.total}:</span><span>${formatCurrency(total)}</span></div>
</div>
</div>

${generatePaymentDetailsHTML()}

${invoice.endMessage ? `<div style="margin-top:20px;padding-top:15px;border-top:1px solid #e2e8f0;font-size:13px;color:#6b7280;line-height:1.5">${invoice.endMessage}</div>` : ''}

</body></html>`;

    // Create a hidden iframe for printing
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

    // Wait for content to load then print
    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        // Remove iframe after print dialog closes
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 500);
    };
  };

  const tabs = [
    { id: 'business', label: 'Company', icon: '🏢' },
    { id: 'customer', label: 'Customer', icon: '👤' },
    { id: 'invoice', label: 'Invoice', icon: '📄' },
    { id: 'items', label: 'Products', icon: '📦' },
    { id: 'payment', label: 'Payment', icon: '💳' },
  ];

  const colors = darkMode ? {
    bg: '#0f1419',
    bgLight: '#16213e',
    bgCard: '#1a1f2e',
    bgInput: '#252d3d',
    accent: '#3b82f6',
    accentHover: '#60a5fa',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
    border: '#2d3748',
    green: '#10b981',
    red: '#dc2626',
  } : {
    bg: '#f1f5f9',
    bgLight: '#e2e8f0',
    bgCard: '#ffffff',
    bgInput: '#f8fafc',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#d1d5db',
    green: '#10b981',
    red: '#dc2626',
  };

  const inputStyle = { 
    width: '100%', 
    padding: '11px 14px', 
    border: `1px solid ${colors.border}`, 
    borderRadius: '6px', 
    fontSize: '14px', 
    fontFamily: 'Inter, sans-serif', 
    background: colors.bgInput, 
    color: colors.text,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  
  const labelStyle = { 
    display: 'block', 
    fontSize: '12px', 
    fontWeight: '500', 
    color: colors.textMuted, 
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  // Save invoice to Supabase and navigate to detail page (for dashboard)
  const saveInvoiceAndNavigate = async () => {
    // Validate before saving
    const errors = validateInvoice();
    if (errors.length > 0) {
      alert('Please complete the following:\n\n• ' + errors.join('\n• '));
      return;
    }

    if (!user) {
      alert('You must be logged in to save invoices.');
      return;
    }

    // Calculate totals
    const subtotal = invoice.items.reduce((sum, item) => {
      const amount = invoice.invoiceMode === 'products' 
        ? (item.quantity || 0) * (item.price || 0)
        : (item.hours || 0) * (item.rate || 0);
      return sum + amount;
    }, 0);
    
    const shipping = parseFloat(invoice.shippingCost) || 0;
    const discount = parseFloat(invoice.discount) || 0;
    
    let taxAmount = 0;
    if (invoice.taxType === 'percent') {
      taxAmount = (subtotal - discount + shipping) * ((parseFloat(invoice.taxRate) || 0) / 100);
    } else {
      taxAmount = parseFloat(invoice.taxRate) || 0;
    }
    
    const total = subtotal + shipping - discount + taxAmount;

    const invoiceData = {
      ...invoice,
      logoPreview,
      subtotal,
      shippingAmount: shipping,
      discount,
      taxAmount,
      total,
      status: 'draft',
      items: invoice.items.map(item => ({
        ...item,
        amount: invoice.invoiceMode === 'products' 
          ? (item.quantity || 0) * (item.price || 0)
          : (item.hours || 0) * (item.rate || 0),
      })),
    };

    try {
      const saved = await finalizeInvoice(invoiceData, user.id, isEditMode ? editingInvoiceId : null);

      // Update customer invoice count in localStorage (customers still in localStorage for now)
      if (!isEditMode && invoice.customerName) {
        const savedCustomers = localStorage.getItem('dayonetools_customers');
        if (savedCustomers) {
          const customers = JSON.parse(savedCustomers);
          const customerIndex = customers.findIndex(c => c.name === invoice.customerName);
          if (customerIndex !== -1) {
            customers[customerIndex].invoiceCount = (customers[customerIndex].invoiceCount || 0) + 1;
            localStorage.setItem('dayonetools_customers', JSON.stringify(customers));
          }
        }
      }

      clearFormState();
      navigate(`/dashboard/invoices/${saved.id}`);
    } catch (e) {
      console.error('Error saving invoice:', e);
      alert('Failed to save invoice. Please try again.');
    }
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

      {/* Hero Header - hidden when in dashboard */}
      {!inDashboard && (
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
      )}

      {/* Dashboard Header - shown when in dashboard */}
      {inDashboard && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '18px 24px',
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>
              {isEditMode ? `Edit Invoice #${invoice.invoiceNumber}` : 'Invoice Creator'}
            </h1>
            <span style={{ fontSize: '16px', opacity: 0.7 }}>📄</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Create/Save Invoice Button */}
            <button
              onClick={saveInvoiceAndNavigate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: colors.accent,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'background 0.2s',
              }}
            >
              {isEditMode ? 'Update Invoice' : 'Create Invoice'} <span style={{ fontSize: '14px' }}>↗</span>
            </button>
            
            {/* 3-Dot Menu Button */}
            <div className="settings-menu-container" style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowSettingsMenu(!showSettingsMenu); }}
                style={{
                  padding: '10px 12px',
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: colors.text,
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                ⋮
              </button>
              
              {/* Settings Dropdown Menu */}
              {showSettingsMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  minWidth: '220px',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}>
                  {/* Live Preview Toggle */}
                  <div 
                    onClick={() => setLivePreviewEnabled(!livePreviewEnabled)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>{livePreviewEnabled ? '✓' : ''}</span>
                      <span style={{ fontSize: '14px', color: colors.text }}>👁️ Live Preview</span>
                    </div>
                  </div>
                  
                  {/* Template Submenu */}
                  <div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setShowTemplateSubmenu(!showTemplateSubmenu); setShowLanguageSubmenu(false); setShowDateSubmenu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${colors.border}`,
                        background: showTemplateSubmenu ? `${colors.accent}10` : 'transparent',
                      }}
                    >
                      <span style={{ fontSize: '14px', color: colors.text }}>📄 Template</span>
                      <span style={{ color: colors.textMuted, transform: showTemplateSubmenu ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                    </div>
                    
                    {showTemplateSubmenu && (
                      <div style={{
                        background: colors.bgInput,
                        borderBottom: `1px solid ${colors.border}`,
                      }}>
                        {templates.map((tpl) => (
                          <div 
                            key={tpl.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedTemplate(tpl.id); setShowTemplateSubmenu(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 16px 10px 32px',
                              cursor: 'pointer',
                              background: selectedTemplate === tpl.id ? `${colors.accent}20` : 'transparent',
                            }}
                          >
                            <span style={{ width: '16px', color: colors.accent }}>{selectedTemplate === tpl.id ? '•' : ''}</span>
                            <div>
                              <div style={{ fontSize: '13px', color: colors.text, fontWeight: selectedTemplate === tpl.id ? '600' : '400' }}>{tpl.name}</div>
                              <div style={{ fontSize: '11px', color: colors.textMuted }}>{tpl.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Language Submenu */}
                  <div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setShowLanguageSubmenu(!showLanguageSubmenu); setShowTemplateSubmenu(false); setShowDateSubmenu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${colors.border}`,
                        background: showLanguageSubmenu ? `${colors.accent}10` : 'transparent',
                      }}
                    >
                      <span style={{ fontSize: '14px', color: colors.text }}>🌐 Invoice Language</span>
                      <span style={{ color: colors.textMuted, transform: showLanguageSubmenu ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                    </div>
                    
                    {showLanguageSubmenu && (
                      <div style={{
                        background: colors.bgInput,
                        borderBottom: `1px solid ${colors.border}`,
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}>
                        {languages.map((lang) => (
                          <div 
                            key={lang.code}
                            onClick={(e) => { e.stopPropagation(); setInvoiceLanguage(lang.code); setShowLanguageSubmenu(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 16px 10px 32px',
                              cursor: 'pointer',
                              background: invoiceLanguage === lang.code ? `${colors.accent}20` : 'transparent',
                            }}
                          >
                            <span style={{ width: '16px', color: colors.accent }}>{invoiceLanguage === lang.code ? '•' : ''}</span>
                            <div>
                              <div style={{ fontSize: '13px', color: colors.text }}>{lang.name}</div>
                              <div style={{ fontSize: '11px', color: colors.textMuted }}>{lang.native}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Date Format Submenu */}
                  <div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setShowDateSubmenu(!showDateSubmenu); setShowTemplateSubmenu(false); setShowLanguageSubmenu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        background: showDateSubmenu ? `${colors.accent}10` : 'transparent',
                      }}
                    >
                      <span style={{ fontSize: '14px', color: colors.text }}>📅 Date Format</span>
                      <span style={{ color: colors.textMuted, transform: showDateSubmenu ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                    </div>
                    
                    {showDateSubmenu && (
                      <div style={{
                        background: colors.bgInput,
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}>
                        {dateFormats.map((df) => (
                          <div 
                            key={df.id}
                            onClick={(e) => { e.stopPropagation(); setDateFormat(df.id); setShowDateSubmenu(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 16px 10px 32px',
                              cursor: 'pointer',
                              background: dateFormat === df.id ? `${colors.accent}20` : 'transparent',
                            }}
                          >
                            <span style={{ width: '16px', color: colors.accent }}>{dateFormat === df.id ? '•' : ''}</span>
                            <div>
                              <div style={{ fontSize: '13px', color: colors.text }}>{df.label}</div>
                              <div style={{ fontSize: '11px', color: colors.textMuted }}>{df.example}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px 24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Panel - Invoice Details */}
        {showEditPanel && (
          <div style={{ 
            background: colors.bgCard, 
            borderRadius: '8px', 
            border: `1px solid ${colors.border}`, 
            overflow: 'visible', 
            width: '100%', 
            maxWidth: isMobile ? '100%' : '640px', 
            minWidth: isMobile ? '100%' : '400px', 
            flex: isMobile ? '1 1 100%' : '1 1 600px'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>📋</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: colors.text }}>Invoice Details</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, padding: '12px 16px', gap: '6px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', background: colors.bgInput }}>
              {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  className="tab-btn"
                  onClick={() => setActiveTab(tab.id)} 
                  style={{ 
                    padding: '9px 16px', 
                    background: activeTab === tab.id ? colors.accent : 'transparent', 
                    border: 'none',
                    fontSize: '13px', 
                    fontWeight: '500', 
                    color: activeTab === tab.id ? '#ffffff' : colors.textMuted, 
                    cursor: 'pointer', 
                    borderRadius: '6px',
                    whiteSpace: 'nowrap', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}>
                  <span style={{ fontSize: '13px' }}>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '24px' }}>
              {activeTab === 'business' && (
                <div style={{ display: 'grid', gap: '24px' }}>
                  {/* Section Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>Company Information</h3>
                      <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Your organization details for invoices</p>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label style={labelStyle}>Company Name</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '14px' }}>🏢</span>
                      <input style={{ ...inputStyle, paddingLeft: '42px' }} placeholder="Your Company Name" value={invoice.businessName} onChange={(e) => updateField('businessName', e.target.value)} />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label style={labelStyle}>Address</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '14px' }}>🏠</span>
                      <input style={{ ...inputStyle, paddingLeft: '42px' }} placeholder="123 Business St, City, State" value={invoice.businessAddress} onChange={(e) => updateField('businessAddress', e.target.value)} />
                    </div>
                  </div>

                  {/* Email & Phone - Two Column */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '14px' }}>✉️</span>
                        <input type="email" style={{ ...inputStyle, paddingLeft: '42px' }} placeholder="billing@company.com" value={invoice.businessEmail} onChange={(e) => updateField('businessEmail', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '14px' }}>📞</span>
                        <input type="tel" style={{ ...inputStyle, paddingLeft: '42px' }} placeholder="(555) 123-4567" value={invoice.businessPhone} onChange={(e) => updateField('businessPhone', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: `1px solid ${colors.border}`, margin: '8px 0' }}></div>

                  {/* Branding Section */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: '0 0 16px 0' }}>Branding & Authorization</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                      {/* Company Logo */}
                      <div>
                        <label style={labelStyle}>Company Logo</label>
                        <label 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          style={{ 
                            border: `1px dashed ${isDragging ? colors.accent : colors.border}`, 
                            borderRadius: '8px', 
                            padding: '24px', 
                            textAlign: 'center', 
                            cursor: 'pointer', 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '140px',
                            background: isDragging ? 'rgba(59, 130, 246, 0.1)' : colors.bgInput, 
                            transition: 'all 0.15s' 
                          }}>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                          {logoPreview ? (
                            <>
                              <img src={logoPreview} alt="Logo" style={{ maxWidth: '120px', maxHeight: '60px', marginBottom: '12px' }} />
                              <button 
                                onClick={(e) => { e.preventDefault(); setLogoPreview(''); }}
                                style={{ 
                                  padding: '6px 12px', 
                                  background: 'transparent', 
                                  border: `1px solid ${colors.border}`, 
                                  borderRadius: '4px', 
                                  color: colors.text, 
                                  fontSize: '12px', 
                                  cursor: 'pointer' 
                                }}
                              >
                                Remove Logo
                              </button>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.4 }}>🖼️</div>
                              <div style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '12px' }}>No logo uploaded yet.</div>
                              <div style={{ 
                                padding: '8px 16px', 
                                background: 'transparent', 
                                border: `1px solid ${colors.border}`, 
                                borderRadius: '6px', 
                                color: colors.text, 
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                ⬆️ Upload New Logo
                              </div>
                            </>
                          )}
                        </label>
                      </div>

                      {/* Signature/Stamp Placeholder */}
                      <div>
                        <label style={labelStyle}>Default Signature/Stamp</label>
                        <div style={{ 
                          border: `1px dashed ${colors.border}`, 
                          borderRadius: '8px', 
                          padding: '24px', 
                          textAlign: 'center', 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '140px',
                          background: colors.bgInput, 
                        }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.4 }}>✍️</div>
                          <div style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '12px' }}>No signature uploaded</div>
                          <div style={{ 
                            padding: '8px 16px', 
                            background: 'transparent', 
                            border: `1px solid ${colors.border}`, 
                            borderRadius: '6px', 
                            color: colors.text, 
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            opacity: 0.6,
                          }}>
                            ⬆️ Upload Signature
                          </div>
                          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '8px' }}>Coming soon</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'customer' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: colors.text }}>Select Customer</span>
                    <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Manage customer in your invoice</p>
                  </div>
                  
                  {/* Select Customer Button */}
                  <button 
                    onClick={() => setShowCustomerModal(true)}
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      background: colors.bgInput, 
                      color: colors.textMuted, 
                      border: `1px dashed ${colors.border}`, 
                      borderRadius: '6px', 
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

                  {/* No customer selected empty state */}
                  {!invoice.customerName && (
                    <div style={{ 
                      border: `1px dashed ${colors.border}`, 
                      borderRadius: '6px', 
                      padding: '28px', 
                      textAlign: 'center',
                      background: colors.bgInput,
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }}>👤</div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: colors.text, marginBottom: '4px' }}>No customer selected</div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '12px' }}>Choose a customer from your list to add their details to this invoice.</div>
                      <button 
                        onClick={() => setShowCustomerModal(true)}
                        style={{ 
                          padding: '8px 14px', 
                          background: colors.green, 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '6px', 
                          fontWeight: '500', 
                          fontSize: '12px', 
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                        + Select Customer
                      </button>
                    </div>
                  )}

                  {invoice.customerName && (
                    <>
                      <div>
                        <label style={labelStyle}>Customer | Company Name</label>
                        <input style={inputStyle} placeholder="Customer | Company Name" value={invoice.customerName} onChange={(e) => updateField('customerName', e.target.value)} />
                      </div>
                      
                      <div>
                        <label style={labelStyle}>Identifier Number</label>
                        <input style={inputStyle} placeholder="Identifier Number" value={invoice.customerIdentifier} onChange={(e) => updateField('customerIdentifier', e.target.value)} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={labelStyle}>Address</label>
                          <input style={inputStyle} placeholder="Address" value={invoice.customerAddress} onChange={(e) => updateField('customerAddress', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Zip Code</label>
                          <input style={inputStyle} placeholder="Zip Code" value={invoice.customerZipCode} onChange={(e) => updateField('customerZipCode', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={labelStyle}>Phone</label>
                          <input style={inputStyle} placeholder="Phone" value={invoice.customerPhone} onChange={(e) => updateField('customerPhone', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Email</label>
                          <input style={inputStyle} placeholder="Email" value={invoice.customerEmail} onChange={(e) => updateField('customerEmail', e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'invoice' && (
                <div style={{ display: 'grid', gap: '12px' }}>
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
                  {/* Selected Products Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: 0 }}>Selected Products</h3>
                      <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Manage products in your invoice</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setShowTemporaryProductModal(true)}
                        style={{ 
                          padding: '8px 14px', 
                          background: colors.bgInput, 
                          color: colors.text, 
                          border: `1px solid ${colors.border}`, 
                          borderRadius: '6px', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                        + Add Temporary
                      </button>
                      <button 
                        onClick={() => setShowProductSelectorModal(true)}
                        style={{ 
                          padding: '8px 14px', 
                          background: colors.green, 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '6px', 
                          fontWeight: '500', 
                          fontSize: '13px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                        + Add Product
                      </button>
                    </div>
                  </div>

                  {/* Products List or Empty State */}
                  {invoice.items.length === 0 || (invoice.items.length === 1 && !invoice.items[0].description) ? (
                    <div style={{ 
                      border: `1px dashed ${colors.border}`, 
                      borderRadius: '8px', 
                      padding: '40px 20px', 
                      textAlign: 'center',
                      background: colors.bgInput,
                      marginBottom: '20px',
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: colors.text, marginBottom: '8px' }}>No products selected</div>
                      <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px' }}>
                        Add products from your catalog or create temporary products<br/>to get started with your invoice
                      </div>
                      <button 
                        onClick={() => setShowProductSelectorModal(true)}
                        style={{ 
                          padding: '10px 20px', 
                          background: colors.green, 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '6px', 
                          fontWeight: '500', 
                          fontSize: '14px', 
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                        + Add Product
                      </button>
                    </div>
                  ) : (
                    /* Products Table */
                    <div style={{ 
                      border: `1px solid ${colors.border}`, 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      marginBottom: '20px',
                    }}>
                      {/* Table Header */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 80px 100px 40px',
                        gap: '12px',
                        padding: '12px 16px',
                        background: colors.bgInput,
                        borderBottom: `1px solid ${colors.border}`,
                        fontSize: '11px',
                        fontWeight: '600',
                        color: colors.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        <div>Product</div>
                        <div style={{ textAlign: 'center' }}>Qty</div>
                        <div style={{ textAlign: 'right' }}>Unit Price</div>
                        <div style={{ textAlign: 'right' }}>Amount</div>
                        <div></div>
                      </div>

                      {/* Product Rows */}
                      {invoice.items.filter(item => item.description).map((item, idx) => (
                        <div key={item.id} style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 80px 100px 40px',
                          gap: '12px',
                          padding: '12px 16px',
                          borderBottom: `1px solid ${colors.border}`,
                          alignItems: 'center',
                        }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>{item.description}</div>
                            {item.sku && <div style={{ fontSize: '12px', color: colors.textMuted }}>SKU: {item.sku}</div>}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <input 
                              type="number" 
                              min="1" 
                              value={item.quantity} 
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              style={{ 
                                width: '60px', 
                                padding: '6px 8px', 
                                background: colors.bgInput, 
                                border: `1px solid ${colors.border}`, 
                                borderRadius: '4px', 
                                color: colors.text, 
                                fontSize: '13px', 
                                textAlign: 'center' 
                              }}
                            />
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <input 
                              type="number" 
                              min="0" 
                              step="0.01"
                              value={item.price || ''} 
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              style={{ 
                                width: '75px', 
                                padding: '6px 8px', 
                                background: colors.bgInput, 
                                border: `1px solid ${colors.border}`, 
                                borderRadius: '4px', 
                                color: colors.text, 
                                fontSize: '13px', 
                                textAlign: 'right' 
                              }}
                            />
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: '600', color: colors.text }}>
                            ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                          </div>
                          <div>
                            <button 
                              onClick={() => removeItem(item.id)}
                              style={{ 
                                padding: '6px 8px', 
                                background: 'transparent', 
                                border: 'none', 
                                color: colors.red, 
                                cursor: 'pointer',
                                fontSize: '14px',
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Products Button Row */}
                      <div style={{ padding: '12px 16px' }}>
                        <button 
                          onClick={() => setShowProductSelectorModal(true)}
                          style={{ 
                            width: '100%',
                            padding: '12px', 
                            background: colors.green, 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px', 
                            fontWeight: '500', 
                            fontSize: '14px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}>
                          + Add Products
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Shipping & Discount */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Shipping Cost (Optional):</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>📦</span>
                        <input type="number" min="0" step="0.01" style={{ ...inputStyle, paddingLeft: '42px' }} placeholder="Shipping Cost" value={invoice.shippingCost || ''} onChange={(e) => updateField('shippingCost', parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Discount (Optional):</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>🏷️</span>
                        <input type="number" min="0" step="0.01" style={{ ...inputStyle, paddingLeft: '42px' }} placeholder="Discount amount" value={invoice.discount || ''} onChange={(e) => updateField('discount', parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                  </div>

                  {/* Tax Rate & Type */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Tax Rate</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>🏷️</span>
                        <input type="number" min="0" step="0.01" style={{ ...inputStyle, paddingLeft: '42px' }} placeholder="18%" value={invoice.taxRate || ''} onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Tax Type</label>
                      <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                        <button className="mode-btn" onClick={() => updateField('taxType', 'percent')} style={{ flex: 1, padding: '11px', background: invoice.taxType === 'percent' ? colors.green : colors.bgInput, color: invoice.taxType === 'percent' ? '#fff' : colors.textMuted, border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>%</button>
                        <button className="mode-btn" onClick={() => updateField('taxType', 'fixed')} style={{ flex: 1, padding: '11px', background: invoice.taxType === 'fixed' ? colors.green : colors.bgInput, color: invoice.taxType === 'fixed' ? '#fff' : colors.textMuted, border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Number</button>
                      </div>
                    </div>
                  </div>

                  {/* Tax Included Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div 
                      className={`toggle-switch ${invoice.taxIncluded ? 'active' : ''}`} 
                      onClick={() => updateField('taxIncluded', !invoice.taxIncluded)}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        background: invoice.taxIncluded ? colors.green : colors.bgInput,
                        border: `1px solid ${colors.border}`,
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '2px',
                        left: invoice.taxIncluded ? '22px' : '2px',
                        transition: 'left 0.2s',
                      }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>Tax included in prices</div>
                      <div style={{ fontSize: '12px', color: colors.textMuted }}>Tax will be added to the subtotal.</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: `1px solid ${colors.border}`, margin: '20px 0' }}></div>

                  {/* Assigned Employee (Placeholder) */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Assigned Employee</label>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      background: colors.bgInput,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '6px',
                      color: colors.textMuted,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}>
                      <span>👤</span>
                      Click to assign an employee
                    </div>
                  </div>

                  {/* Invoice Mode Toggle */}
                  <div>
                    <label style={labelStyle}>Invoice Mode:</label>
                    <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${colors.border}`, width: 'fit-content' }}>
                      <button 
                        className="mode-btn"
                        onClick={() => updateField('invoiceMode', 'products')}
                        style={{ 
                          padding: '10px 20px', 
                          background: invoice.invoiceMode === 'products' ? colors.green : colors.bgInput,
                          color: invoice.invoiceMode === 'products' ? '#fff' : colors.textMuted,
                          border: 'none',
                          fontWeight: '500',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}>
                        📦 Products
                      </button>
                      <button 
                        className="mode-btn"
                        onClick={() => updateField('invoiceMode', 'hours')}
                        style={{ 
                          padding: '10px 20px', 
                          background: invoice.invoiceMode === 'hours' ? colors.green : colors.bgInput,
                          color: invoice.invoiceMode === 'hours' ? '#fff' : colors.textMuted,
                          border: 'none',
                          fontWeight: '500',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}>
                        ⏱️ Hours
                      </button>
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
            borderRadius: '8px', 
            border: `1px solid ${colors.border}`, 
            overflow: 'hidden', 
            flex: isMobile ? '1 1 100%' : '1.2 1 550px', 
            minWidth: isMobile ? '100%' : '400px',
            width: isMobile ? '100%' : 'auto'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>📄</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: colors.text }}>Invoice Preview</span>
              </div>
              <button onClick={downloadPDF} style={{ padding: '10px 18px', background: colors.accent, color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📥 Download PDF
              </button>
            </div>
            
            {/* White preview area */}
            <div style={{ padding: '20px', background: colors.bgInput }}>
              <div style={{ background: 'white', borderRadius: '6px', padding: isMobile ? '24px' : '32px', minHeight: isMobile ? '400px' : '520px', color: '#1f2937', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {/* Header - Bold template has dark header */}
                {selectedTemplate === 'bold' && (
                  <div style={{ background: templateStyles.headerBg, margin: isMobile ? '-24px -24px 24px' : '-32px -32px 28px', padding: isMobile ? '24px' : '28px', borderRadius: '6px 6px 0 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ minWidth: '140px', flex: '1' }}>
                        {logoPreview && <img src={logoPreview} alt="Logo" style={{ maxWidth: '100px', maxHeight: '40px', marginBottom: '8px', filter: 'brightness(0) invert(1)' }} />}
                        <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: templateStyles.headerText, marginBottom: '4px' }}>{invoice.businessName || 'Your Company'}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                          {invoice.businessAddress && <div>{invoice.businessAddress}</div>}
                          {invoice.businessEmail && <div>{invoice.businessEmail}</div>}
                          {invoice.businessPhone && <div>{invoice.businessPhone}</div>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '130px' }}>
                        <div style={{ display: 'inline-block', padding: '6px 16px', background: templateStyles.invoiceBadgeBg, color: templateStyles.invoiceBadgeText, borderRadius: '4px', fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>{t.invoice}</div>
                        <div style={{ fontSize: '11px', lineHeight: '1.7', color: 'rgba(255,255,255,0.8)' }}>
                          <div>{t.invoiceNumber} {invoice.invoiceNumber}</div>
                          <div>{t.issueDate}: {inDashboard ? formatDateWithFormat(invoice.issueDate, dateFormat) : formatDate(invoice.issueDate)}</div>
                          {invoice.dueDate && <div>{t.dueDate}: {inDashboard ? formatDateWithFormat(invoice.dueDate, dateFormat) : formatDate(invoice.dueDate)}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header - Other templates (regular, mono, modern) */}
                {selectedTemplate !== 'bold' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ minWidth: '140px', flex: '1' }}>
                    {logoPreview && <img src={logoPreview} alt="Logo" style={{ maxWidth: '100px', maxHeight: '40px', marginBottom: '8px' }} />}
                    <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: templateStyles.headerText, marginBottom: '4px' }}>{invoice.businessName || 'Your Company'}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>
                      {invoice.businessAddress && <div>{invoice.businessAddress}</div>}
                      {invoice.businessEmail && <div>{invoice.businessEmail}</div>}
                      {invoice.businessPhone && <div>{invoice.businessPhone}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '130px' }}>
                    <div style={{ display: 'inline-block', padding: '6px 16px', background: templateStyles.invoiceBadgeBg, color: templateStyles.invoiceBadgeText, borderRadius: '4px', fontSize: isMobile ? '14px' : '16px', fontWeight: '700', marginBottom: '10px' }}>{t.invoice}</div>
                    <div style={{ fontSize: '11px', lineHeight: '1.7' }}>
                      <div><span style={{ color: templateStyles.accentColor, fontWeight: '500' }}>{t.invoiceNumber}</span> {invoice.invoiceNumber}</div>
                      <div><span style={{ color: templateStyles.accentColor, fontWeight: '500' }}>{t.issueDate}:</span> {inDashboard ? formatDateWithFormat(invoice.issueDate, dateFormat) : formatDate(invoice.issueDate)}</div>
                      {invoice.dueDate && <div><span style={{ color: templateStyles.accentColor, fontWeight: '500' }}>{t.dueDate}:</span> {inDashboard ? formatDateWithFormat(invoice.dueDate, dateFormat) : formatDate(invoice.dueDate)}</div>}
                      {invoice.paymentTermsText && <div><span style={{ color: templateStyles.accentColor, fontWeight: '500' }}>Terms:</span> {invoice.paymentTermsText}</div>}
                      {invoice.customFields.map(f => f.label && f.value ? <div key={f.id}><span style={{ color: templateStyles.accentColor, fontWeight: '500' }}>{f.label}:</span> {f.value}</div> : null)}
                    </div>
                  </div>
                </div>
                )}

                {/* Issued To */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>{t.issuedTo}:</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>
                    <div>{invoice.customerName || 'Customer Name'}</div>
                    {invoice.customerAddress && <div>{invoice.customerAddress}{invoice.customerZipCode ? `, ${invoice.customerZipCode}` : ''}</div>}
                    {invoice.customerEmail && <div>{invoice.customerEmail}</div>}
                  </div>
                </div>

                {/* Items Table */}
                <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '280px', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: templateStyles.tableHeaderBg }}>
                        <th style={{ textAlign: 'left', padding: '8px 6px', color: '#64748b', fontWeight: '600', borderBottom: `2px solid ${templateStyles.borderColor}` }}>
                          {invoice.invoiceMode === 'hours' ? t.service : t.product}
                        </th>
                        <th style={{ textAlign: 'center', padding: '8px 6px', color: '#64748b', fontWeight: '600', borderBottom: `2px solid ${templateStyles.borderColor}`, width: '40px' }}>
                          {invoice.invoiceMode === 'hours' ? t.hrs : t.qty}
                        </th>
                        <th style={{ textAlign: 'right', padding: '8px 6px', color: '#64748b', fontWeight: '600', borderBottom: `2px solid ${templateStyles.borderColor}`, width: '55px' }}>
                          {invoice.invoiceMode === 'hours' ? t.rate : t.price}
                        </th>
                        <th style={{ textAlign: 'right', padding: '8px 6px', color: '#64748b', fontWeight: '600', borderBottom: `2px solid ${templateStyles.borderColor}`, width: '60px' }}>{t.amount}</th>
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
                      <span style={{ color: '#64748b' }}>{t.subtotal}:</span>
                      <span style={{ color: '#374151' }}>{formatCurrency(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>{t.discount}:</span>
                        <span style={{ color: '#dc2626' }}>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    {!invoice.taxIncluded && taxAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>{t.tax}:</span>
                        <span style={{ color: '#374151' }}>{formatCurrency(taxAmount)}</span>
                      </div>
                    )}
                    {shippingAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>{t.shipping}:</span>
                        <span style={{ color: '#374151' }}>{formatCurrency(shippingAmount)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', fontWeight: '700', fontSize: '14px', background: templateStyles.totalBg, color: templateStyles.totalText, borderRadius: '4px', marginTop: '4px' }}>
                      <span>{t.total}:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details Preview */}
                {invoice.paymentMethods.length > 0 && (
                  <div style={{ borderTop: `1px solid ${templateStyles.borderColor}`, paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>{t.paymentDetails}</div>
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

      {/* Add Temporary Product Modal */}
      {showTemporaryProductModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div style={{
            background: colors.bgCard,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            width: '100%',
            maxWidth: '500px',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.green, margin: 0 }}>Add Temporary Product</h2>
                <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Add a product that will only exist in this invoice without saving it to your product catalog.</p>
              </div>
              <button
                onClick={() => { setShowTemporaryProductModal(false); setTempProduct({ name: '', model: '', price: '', quantity: 1 }); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.textMuted,
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: colors.textMuted, marginBottom: '6px' }}>
                    <span style={{ marginRight: '6px' }}>🏷️</span>Product Name
                  </label>
                  <input
                    style={{ ...inputStyle, background: colors.bgInput }}
                    placeholder="Enter product name"
                    value={tempProduct.name}
                    onChange={(e) => setTempProduct({ ...tempProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: colors.textMuted, marginBottom: '6px' }}>
                    <span style={{ marginRight: '6px' }}>#</span>Model (Optional)
                  </label>
                  <input
                    style={{ ...inputStyle, background: colors.bgInput }}
                    placeholder="Enter product model"
                    value={tempProduct.model}
                    onChange={(e) => setTempProduct({ ...tempProduct, model: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: colors.textMuted, marginBottom: '6px' }}>
                    <span style={{ marginRight: '6px' }}>$</span>Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    style={{ ...inputStyle, background: colors.bgInput }}
                    placeholder="0.00"
                    value={tempProduct.price}
                    onChange={(e) => setTempProduct({ ...tempProduct, price: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: colors.textMuted, marginBottom: '6px' }}>
                    <span style={{ marginRight: '6px' }}>📦</span>Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    style={{ ...inputStyle, background: colors.bgInput }}
                    placeholder="1"
                    value={tempProduct.quantity}
                    onChange={(e) => setTempProduct({ ...tempProduct, quantity: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowTemporaryProductModal(false); setTempProduct({ name: '', model: '', price: '', quantity: 1 }); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: colors.bgInput,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!tempProduct.name || !tempProduct.price) {
                    alert('Please enter product name and price');
                    return;
                  }
                  const newItem = {
                    id: Date.now(),
                    description: tempProduct.name,
                    sku: tempProduct.model,
                    quantity: parseInt(tempProduct.quantity) || 1,
                    price: parseFloat(tempProduct.price) || 0,
                    hours: 1,
                    rate: 0,
                    isTemporary: true,
                  };
                  // Replace empty first item or add to list
                  if (invoice.items.length === 1 && !invoice.items[0].description) {
                    setInvoice(prev => ({ ...prev, items: [newItem] }));
                  } else {
                    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
                  }
                  setShowTemporaryProductModal(false);
                  setTempProduct({ name: '', model: '', price: '', quantity: 1 });
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: colors.green,
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Products from Catalog Modal */}
      {showProductSelectorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div style={{
            background: colors.bgCard,
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            width: '100%',
            maxWidth: '700px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>Select Products</h2>
                <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>Choose products from your catalog to add to the invoice.</p>
              </div>
              <button
                onClick={() => { setShowProductSelectorModal(false); setSelectedCatalogProducts([]); setProductSearch(''); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.textMuted,
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Search & Filter */}
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>🔍</span>
                <input
                  style={{ ...inputStyle, paddingLeft: '42px', background: colors.bgInput }}
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                style={{
                  padding: '11px 40px 11px 14px',
                  background: colors.bgInput,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  color: colors.text,
                  fontSize: '14px',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px',
                }}
              >
                <option value="all">🏷️ All Categories</option>
                {[...new Set(catalogProducts.map(p => p.category).filter(Boolean))].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Products List */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
              {catalogProducts.filter(p => p.status === 'active' || !p.status).filter(p => {
                const matchesSearch = !productSearch || 
                  p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                  p.model?.toLowerCase().includes(productSearch.toLowerCase());
                const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
                return matchesSearch && matchesCategory;
              }).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>📦</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: colors.text, marginBottom: '8px' }}>No products found</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted }}>Create some products first</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {catalogProducts.filter(p => p.status === 'active' || !p.status).filter(p => {
                    const matchesSearch = !productSearch || 
                      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.model?.toLowerCase().includes(productSearch.toLowerCase());
                    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
                    return matchesSearch && matchesCategory;
                  }).map(product => (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (selectedCatalogProducts.includes(product.id)) {
                          setSelectedCatalogProducts(selectedCatalogProducts.filter(id => id !== product.id));
                        } else {
                          setSelectedCatalogProducts([...selectedCatalogProducts, product.id]);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: selectedCatalogProducts.includes(product.id) ? `${colors.green}20` : colors.bgInput,
                        border: `1px solid ${selectedCatalogProducts.includes(product.id) ? colors.green : colors.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCatalogProducts.includes(product.id)}
                        onChange={() => {}}
                        style={{ width: '18px', height: '18px', accentColor: colors.green }}
                      />
                      {product.photo ? (
                        <img src={product.photo} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: colors.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', opacity: 0.5 }}>📦</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>{product.name}</div>
                        {product.model && <div style={{ fontSize: '12px', color: colors.textMuted }}>{product.model}</div>}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: colors.green }}>
                        ${parseFloat(product.price || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowProductSelectorModal(false); setSelectedCatalogProducts([]); setProductSearch(''); }}
                style={{
                  padding: '12px 20px',
                  background: colors.bgInput,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowProductSelectorModal(false); setShowTemporaryProductModal(true); }}
                style={{
                  padding: '12px 20px',
                  background: colors.bgInput,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                + Add Temporary
              </button>
              <button
                onClick={() => {
                  // Navigate to products page to create a new product
                  setShowProductSelectorModal(false);
                  if (inDashboard) {
                    navigate('/dashboard/products');
                  }
                }}
                style={{
                  padding: '12px 20px',
                  background: colors.green,
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                + Create Product
              </button>
              <button
                onClick={() => {
                  // Add selected products to invoice
                  const productsToAdd = catalogProducts.filter(p => selectedCatalogProducts.includes(p.id));
                  const newItems = productsToAdd.map(p => ({
                    id: Date.now() + Math.random(),
                    description: p.name,
                    sku: p.model || '',
                    quantity: 1,
                    price: parseFloat(p.price) || 0,
                    hours: 1,
                    rate: 0,
                    productId: p.id,
                  }));
                  
                  if (newItems.length > 0) {
                    // Replace empty first item or add to list
                    if (invoice.items.length === 1 && !invoice.items[0].description) {
                      setInvoice(prev => ({ ...prev, items: newItems }));
                    } else {
                      setInvoice(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
                    }
                  }
                  
                  setShowProductSelectorModal(false);
                  setSelectedCatalogProducts([]);
                  setProductSearch('');
                }}
                style={{
                  padding: '12px 20px',
                  background: selectedCatalogProducts.length > 0 ? colors.green : colors.bgInput,
                  border: 'none',
                  borderRadius: '6px',
                  color: selectedCatalogProducts.length > 0 ? '#fff' : colors.textMuted,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                + Add Selected ({selectedCatalogProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
