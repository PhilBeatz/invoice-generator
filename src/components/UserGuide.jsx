import React, { useState, useEffect, useRef } from 'react';

const sections = [
  {
    id: 'introduction',
    label: 'Introduction',
    category: null,
    content: [
      { type: 'subtitle', text: 'Welcome to Day One Tools' },
      { type: 'paragraph', text: 'Day One Tools is a comprehensive invoice generation and management platform designed to help businesses of all sizes create professional invoices, manage customers, track products, and monitor payments efficiently. Whether you\'re a freelancer, small business, or growing enterprise, Day One Tools provides the tools you need to streamline your invoicing workflow.' },
      { type: 'divider' },
      { type: 'heading', text: 'What You Can Do with Day One Tools' },
      { type: 'subheading', text: 'Core Features' },
      { type: 'list', items: [
        { bold: 'Professional Invoice Templates:', text: 'Choose from beautifully designed invoice templates (Regular, Bold Professional, and more) that can be customized with your company branding' },
        { bold: 'Smart Invoice Generation:', text: 'Create invoices quickly with support for product-based and hourly billing modes, automatic calculations for taxes, discounts, and shipping' },
        { bold: 'Customer Management:', text: 'Build and maintain a comprehensive customer database with contact information, addresses, and timezone support' },
        { bold: 'Product Catalog:', text: 'Organize your products and services with categories, SKUs, pricing, and photos for quick invoice creation' },
        { bold: 'Multi-currency Support:', text: 'Generate invoices in any currency with automatic exchange rate tracking and conversion' },
        { bold: 'Secure Invoice Sharing:', text: 'Share invoices with customers via password-protected links with expiration dates and view limits' },
      ]},
      { type: 'subheading', text: 'Advanced Features' },
      { type: 'list', items: [
        { bold: 'Proposal Management:', text: 'Create, send, and track business proposals with built-in analytics to monitor engagement' },
        { bold: 'Analytics Dashboard:', text: 'Track revenue, invoice metrics, and business performance with visual charts and insights' },
        { bold: 'Organization Management:', text: 'Set up your company profile, manage employees, and configure team settings' },
        { bold: 'Payment Method Configuration:', text: 'Set up and display your accepted payment methods directly on invoices' },
      ]},
      { type: 'subheading', text: 'Getting Started' },
      { type: 'paragraph', text: 'To get started with Day One Tools, sign up for a free trial account. You\'ll get immediate access to all core features. From there, you can create your first invoice in under a minute using the intuitive invoice generator.' },
    ],
  },
  {
    id: 'getting-started',
    label: 'Getting Started',
    category: 'Getting Started',
    content: [
      { type: 'subtitle', text: 'Setting Up Your Account' },
      { type: 'paragraph', text: 'Getting started with Day One Tools is quick and easy. Follow these steps to set up your account and create your first invoice.' },
      { type: 'heading', text: 'Step 1: Create Your Account' },
      { type: 'paragraph', text: 'Visit the Sign Up page and create your account with your email address. You\'ll receive a 7-day free trial with access to all features, including up to 25 invoices per month, 25 customers, and 5 email sends per month.' },
      { type: 'heading', text: 'Step 2: Set Up Your Organization' },
      { type: 'paragraph', text: 'Navigate to Dashboard > Organization to configure your company details. Add your company name, logo, address, and contact information. This information will automatically appear on all your invoices.' },
      { type: 'heading', text: 'Step 3: Add Your Customers' },
      { type: 'paragraph', text: 'Go to Dashboard > Customers to start building your customer database. Add customer names, email addresses, phone numbers, and billing addresses. These details will auto-populate when creating invoices.' },
      { type: 'heading', text: 'Step 4: Create Your Product Catalog' },
      { type: 'paragraph', text: 'Visit Dashboard > Products to add your products and services. Include names, descriptions, SKUs, pricing, and categories. When creating invoices, you can quickly add items from your catalog.' },
      { type: 'heading', text: 'Step 5: Create Your First Invoice' },
      { type: 'paragraph', text: 'Click "Create" in the sidebar or use the free Invoice Generator. Select a template, add your customer, add line items, configure taxes and discounts, then preview and send your invoice.' },
    ],
  },
  {
    id: 'invoices',
    label: 'Invoices',
    category: 'Invoice',
    content: [
      { type: 'subtitle', text: 'Creating & Managing Invoices' },
      { type: 'paragraph', text: 'The invoice system is the core of Day One Tools. Here\'s everything you need to know about creating, managing, and sending professional invoices.' },

      { type: 'heading', text: 'Creating an Invoice' },
      { type: 'paragraph', text: 'From the dashboard, click "Create" in the sidebar to open the invoice generator. You can also access the free public invoice generator at /invoicegenerator without an account.' },

      { type: 'subheading', text: 'Invoice Modes' },
      { type: 'paragraph', text: 'Toggle between two billing modes depending on how you charge:' },
      { type: 'list', items: [
        { bold: 'Products Mode:', text: 'Add line items with description, SKU, quantity, and unit price. Ideal for product-based businesses that sell physical or digital goods.' },
        { bold: 'Hourly Mode:', text: 'Track hours worked with hourly rates. Perfect for freelancers, consultants, and service providers who bill by time.' },
      ]},

      { type: 'subheading', text: 'Business & Customer Details' },
      { type: 'paragraph', text: 'Fill in your business information (company name, email, address, phone) and your customer\'s details. If you have saved customers, select them from the dropdown to auto-populate their information. You can also upload your company logo, which will appear on the invoice.' },
      { type: 'list', items: [
        { bold: 'Customer Fields:', text: 'Name, email, phone, address, zip code, and tax ID / customer identifier.' },
        { bold: 'Saved Customers:', text: 'Load previously saved customers from your database for quick reuse across invoices.' },
      ]},

      { type: 'subheading', text: 'Line Items' },
      { type: 'paragraph', text: 'Add as many line items as needed. Each item includes a description, quantity (or hours), and unit price (or rate). Totals are calculated automatically. You can add items from your product catalog using the "Add from catalog" button, or create temporary products on the fly.' },

      { type: 'subheading', text: 'Invoice Number & Dates' },
      { type: 'list', items: [
        { bold: 'Invoice Number:', text: 'Auto-generated for you, but can be manually overridden if you have your own numbering system.' },
        { bold: 'Issue Date:', text: 'Defaults to today. Use the date picker to set a different date.' },
        { bold: 'Due Date:', text: 'Optional. Set a due date to track payment deadlines. Invoices past their due date are automatically flagged as overdue.' },
      ]},

      { type: 'heading', text: 'Invoice Templates' },
      { type: 'paragraph', text: 'Choose from four professionally designed templates. Select your preferred style from the template picker in the invoice generator:' },
      { type: 'list', items: [
        { bold: 'Regular:', text: 'A balanced, classic design with a blue accent. Great for most businesses.' },
        { bold: 'Bold Professional:', text: 'Features a dark header with a green accent for a strong, corporate look.' },
        { bold: 'Mono:', text: 'Clean and minimal with a gray color scheme. Ideal for a understated, professional feel.' },
        { bold: 'Startup Modern:', text: 'A sleek, modern design with a blue gradient. Perfect for tech companies and startups.' },
      ]},
      { type: 'paragraph', text: 'Each template adjusts the header, table styling, badge colors, and overall layout. Preview any template before selecting it using the template preview panel.' },

      { type: 'heading', text: 'PDF Download & Printing' },
      { type: 'paragraph', text: 'Once your invoice is ready, use the "Download PDF" button to generate a high-quality PDF file of your invoice. The PDF includes all your business branding, line items, totals, and payment method details. You can also use the "Print" button to send the invoice directly to your printer via the browser\'s print dialog. Both options use the template you\'ve selected.' },

      { type: 'heading', text: 'Live Preview' },
      { type: 'paragraph', text: 'The invoice generator includes a real-time live preview panel on the right side of the screen. As you fill in details, the preview updates instantly so you can see exactly how your final invoice will look. You can toggle the live preview on or off, or switch to a full-screen preview mode to inspect the invoice more closely before downloading or sending.' },

      { type: 'heading', text: 'Multi-Currency Support' },
      { type: 'paragraph', text: 'Generate invoices in any of the supported currencies. Select your currency from the dropdown and all amounts, totals, and calculations will display with the correct symbol:' },
      { type: 'list', items: [
        { bold: 'Supported Currencies:', text: 'USD ($), EUR (\u20AC), GBP (\u00A3), CAD (C$), AUD (A$), JPY (\u00A5), and INR (\u20B9).' },
      ]},

      { type: 'heading', text: 'Multi-Language Support' },
      { type: 'paragraph', text: 'Invoices can be generated in 10 languages: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, and Arabic. When you select a language, all invoice labels (e.g., "Invoice", "Due Date", "Total") are automatically translated. This is useful when invoicing international clients in their preferred language.' },

      { type: 'heading', text: 'Date Format Options' },
      { type: 'paragraph', text: 'Choose how dates appear on your invoice. Available formats include:' },
      { type: 'list', items: [
        { bold: 'US Format:', text: 'MM/DD/YYYY (e.g., 03/15/2026)' },
        { bold: 'EU Format:', text: 'DD/MM/YYYY (e.g., 15/03/2026)' },
        { bold: 'ISO Format:', text: 'YYYY-MM-DD (e.g., 2026-03-15)' },
        { bold: 'Written Formats:', text: 'Month DD, YYYY or DD Month YYYY, plus abbreviated versions.' },
      ]},

      { type: 'heading', text: 'Taxes, Discounts & Shipping' },
      { type: 'list', items: [
        { bold: 'Tax:', text: 'Add tax as a percentage or a fixed amount. Toggle between "Percentage" and "Number" modes. You can also enable "Tax included in prices" if your line item prices already include tax \u2014 the tax will be calculated in reverse.' },
        { bold: 'Discount:', text: 'Apply a flat discount amount to the invoice subtotal. The discount is deducted before tax is calculated.' },
        { bold: 'Shipping:', text: 'Add a shipping charge as a separate line. It is added to the total after tax.' },
      ]},
      { type: 'paragraph', text: 'The invoice automatically calculates the subtotal, discount, tax amount, and final total in real time as you update these fields.' },

      { type: 'heading', text: 'Payment Methods on Invoices' },
      { type: 'paragraph', text: 'Display your accepted payment methods directly on the invoice so customers know exactly how to pay. Supported payment types include:' },
      { type: 'list', items: [
        { bold: 'Bank Transfer:', text: 'Add your bank name, branch, account name, account number, routing number, sort code, SWIFT code, and IBAN.' },
        { bold: 'PayPal:', text: 'Display your PayPal email address for easy online payments.' },
        { bold: 'Cryptocurrency:', text: 'Accept Bitcoin, Ethereum, USDT, USDC, Litecoin, or other crypto with wallet addresses. QR codes are generated on shared invoices.' },
        { bold: 'Custom Payment:', text: 'Add any custom payment method with a name and instructions (e.g., Venmo, Zelle, cash on delivery).' },
      ]},

      { type: 'heading', text: 'Custom Fields' },
      { type: 'paragraph', text: 'Need to include extra information? Add unlimited custom key-value fields to your invoice. Common uses include purchase order numbers, project references, contract IDs, or any other details your client requires. Custom fields appear on the invoice alongside the standard details.' },

      { type: 'heading', text: 'Payment Terms & Notes' },
      { type: 'list', items: [
        { bold: 'Payment Terms:', text: 'Add a payment terms note (e.g., "Net 30", "50% upfront, 50% on delivery") that appears on the invoice.' },
        { bold: 'End Message:', text: 'Include a closing message or terms at the bottom of the invoice, such as a thank-you note, return policy, or legal disclaimer.' },
      ]},

      { type: 'heading', text: 'Sharing & Sending Invoices' },
      { type: 'paragraph', text: 'After saving an invoice, share it with customers via secure links or email:' },
      { type: 'list', items: [
        { bold: 'Share Link:', text: 'Generate a shareable link to the invoice. Optionally set a password, expiration date, and view limit for added security. Copy the link and send it via any channel.' },
        { bold: 'Email Invoice:', text: 'Send the invoice directly to your customer\'s email with a custom message. Email history is tracked so you can see when invoices were sent.' },
        { bold: 'Manage Shares:', text: 'View all active share links and revoke access at any time from the invoice detail page.' },
      ]},
      { type: 'paragraph', text: 'Customers can view and download the shared invoice without needing an account. Cryptocurrency payment methods display QR codes on shared views for easy scanning.' },

      { type: 'heading', text: 'Invoice Status Tracking' },
      { type: 'paragraph', text: 'Track the lifecycle of every invoice with status labels:' },
      { type: 'list', items: [
        { bold: 'Draft:', text: 'Invoice is being prepared and hasn\'t been sent yet.' },
        { bold: 'Sent:', text: 'Invoice has been delivered to the customer.' },
        { bold: 'Pending:', text: 'Awaiting payment from the customer.' },
        { bold: 'Paid:', text: 'Payment has been received.' },
        { bold: 'Overdue:', text: 'The due date has passed without payment. Automatically detected.' },
        { bold: 'Cancelled:', text: 'Invoice has been voided. Cancelled invoices cannot be edited.' },
      ]},

      { type: 'heading', text: 'Managing Your Invoices' },
      { type: 'paragraph', text: 'View all your invoices from Dashboard > Invoices. The invoice list provides powerful tools to stay organized:' },
      { type: 'list', items: [
        { bold: 'Search:', text: 'Find invoices by invoice number, customer name, or email address.' },
        { bold: 'Filter by Status:', text: 'Filter the list to show only Draft, Sent, Paid, Overdue, or Cancelled invoices.' },
        { bold: 'Date Range Filter:', text: 'Use preset ranges (last 7 days, 30 days, etc.) or set a custom date range.' },
        { bold: 'Sorting:', text: 'Sort by invoice number, customer name, amount, status, or date in ascending/descending order.' },
        { bold: 'Bulk Actions:', text: 'Select multiple invoices to delete them or change their status in bulk.' },
        { bold: 'Pagination:', text: 'Navigate large invoice lists with customizable items per page.' },
      ]},
      { type: 'paragraph', text: 'Click any invoice to view its full details, edit it, duplicate it, download as PDF, share it, or send it via email.' },

      { type: 'heading', text: 'Auto-Save & Draft Recovery' },
      { type: 'paragraph', text: 'Your invoice form data is automatically saved to local storage as you work. If you accidentally close the browser or navigate away, your progress will be preserved and restored when you return to the invoice generator.' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    category: 'Invoice',
    content: [
      { type: 'subtitle', text: 'Customer Management' },
      { type: 'paragraph', text: 'Build and maintain a comprehensive customer database to streamline your invoicing process.' },
      { type: 'heading', text: 'Adding Customers' },
      { type: 'paragraph', text: 'Navigate to Dashboard > Customers and click "Add Customer". Fill in the customer\'s name, email, phone number, and billing address. All fields are optional except the name.' },
      { type: 'heading', text: 'Customer Details' },
      { type: 'list', items: [
        { bold: 'Contact Info:', text: 'Name, email, phone number for communication and invoice delivery' },
        { bold: 'Billing Address:', text: 'Street address, city, state, ZIP, and country for accurate invoicing' },
        { bold: 'Timezone:', text: 'Set the customer\'s timezone for accurate date displays on shared invoices' },
      ]},
      { type: 'heading', text: 'Using Customers in Invoices' },
      { type: 'paragraph', text: 'When creating an invoice, select a customer from the dropdown. Their details will auto-populate on the invoice, saving you time and reducing errors.' },
      { type: 'heading', text: 'Customer Limits' },
      { type: 'paragraph', text: 'The number of customers you can add depends on your plan: Trial (25), Solo (100), Pro (2,000).' },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    category: 'Invoice',
    content: [
      { type: 'subtitle', text: 'Product & Service Catalog' },
      { type: 'paragraph', text: 'Maintain a catalog of your products and services for quick invoice creation.' },
      { type: 'heading', text: 'Adding Products' },
      { type: 'paragraph', text: 'Go to Dashboard > Products and click "Add Product". Enter the product name, description, SKU, price, and assign it to a category.' },
      { type: 'heading', text: 'Categories' },
      { type: 'paragraph', text: 'Organize your products with categories. Visit Dashboard > Categories to create and manage product categories. Categories help you quickly find products when building invoices.' },
      { type: 'heading', text: 'Using Products in Invoices' },
      { type: 'paragraph', text: 'In the invoice generator, click "Add from catalog" to browse your products. Select items to add them as line items with pre-filled names, descriptions, and pricing.' },
    ],
  },
  {
    id: 'proposals',
    label: 'Proposals',
    category: 'Invoice',
    content: [
      { type: 'subtitle', text: 'Proposal Management' },
      { type: 'paragraph', text: 'Create and manage business proposals to win new clients and projects.' },
      { type: 'heading', text: 'Creating Proposals' },
      { type: 'paragraph', text: 'Navigate to Dashboard > Proposal Log to create new proposals. Add a title, description, client details, line items, and terms. Proposals can be customized with your branding.' },
      { type: 'heading', text: 'Tracking Proposals' },
      { type: 'paragraph', text: 'Monitor proposal status from the Proposal Log. Track which proposals have been viewed, accepted, or declined.' },
      { type: 'heading', text: 'Proposal Analytics' },
      { type: 'paragraph', text: 'Visit Dashboard > Proposal Analytics for insights into your proposal performance, including acceptance rates and revenue projections.' },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    category: 'Invoice',
    content: [
      { type: 'subtitle', text: 'Payment Methods' },
      { type: 'paragraph', text: 'Configure and display your accepted payment methods on invoices.' },
      { type: 'heading', text: 'Setting Up Payment Methods' },
      { type: 'paragraph', text: 'Go to Dashboard > Payment Methods to configure the payment options you accept. Add details like bank account information, PayPal addresses, or other payment instructions.' },
      { type: 'heading', text: 'Displaying on Invoices' },
      { type: 'paragraph', text: 'Payment methods you configure will appear on your invoices, making it easy for customers to know how to pay you.' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    category: 'Organization',
    content: [
      { type: 'subtitle', text: 'Analytics & Reporting' },
      { type: 'paragraph', text: 'Track your business performance with built-in analytics and reporting tools.' },
      { type: 'heading', text: 'Dashboard Overview' },
      { type: 'paragraph', text: 'Your main dashboard shows key metrics at a glance: total revenue, outstanding invoices, recent activity, and quick actions.' },
      { type: 'heading', text: 'Detailed Analytics' },
      { type: 'paragraph', text: 'Visit Dashboard > Analytics for in-depth insights including:' },
      { type: 'list', items: [
        { bold: 'Revenue Tracking:', text: 'Monitor total revenue, paid vs. unpaid invoices, and revenue trends over time' },
        { bold: 'Invoice Metrics:', text: 'Track invoice counts, average invoice value, and payment timelines' },
        { bold: 'Customer Insights:', text: 'See your top customers by revenue and invoice frequency' },
      ]},
    ],
  },
  {
    id: 'organization',
    label: 'Organization',
    category: 'Organization',
    content: [
      { type: 'subtitle', text: 'Organization Settings' },
      { type: 'paragraph', text: 'Configure your company profile and team settings.' },
      { type: 'heading', text: 'Company Profile' },
      { type: 'paragraph', text: 'Navigate to Dashboard > My Organization to set up your company details. Add your company name, logo, address, phone, email, and website. This information appears on all your invoices and proposals.' },
      { type: 'heading', text: 'Employees' },
      { type: 'paragraph', text: 'Manage your team from Dashboard > Employees. Add team members with their name, email, position, department, and hire date. Track employee status and department assignments.' },
    ],
  },
  {
    id: 'subscription',
    label: 'Subscription',
    category: 'Organization',
    content: [
      { type: 'subtitle', text: 'Plans & Subscription' },
      { type: 'paragraph', text: 'Day One Tools offers flexible plans to fit your business needs.' },
      { type: 'heading', text: 'Available Plans' },
      { type: 'list', items: [
        { bold: 'Free Trial (7 days):', text: '25 invoices/month, 25 customers, 5 email sends/month. Full access to all features.' },
        { bold: 'Solo:', text: '100 invoices/month, 100 customers, 50 email sends/month. Ideal for freelancers and solo entrepreneurs.' },
        { bold: 'Pro:', text: '1,000 invoices/month, 2,000 customers, unlimited payment methods. Perfect for growing businesses.' },
      ]},
      { type: 'heading', text: 'Managing Your Subscription' },
      { type: 'paragraph', text: 'Visit Dashboard > Subscription to view your current plan, usage, and billing details. Upgrade or change your plan at any time.' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    category: 'General',
    content: [
      { type: 'subtitle', text: 'Account Settings' },
      { type: 'paragraph', text: 'Manage your account preferences and configuration.' },
      { type: 'heading', text: 'Account Settings' },
      { type: 'paragraph', text: 'Visit Dashboard > Settings to manage your account. Update your email, password, and personal information.' },
      { type: 'heading', text: 'Theme' },
      { type: 'paragraph', text: 'Day One Tools supports both dark and light modes. Toggle the theme using the switch in the footer of any page.' },
      { type: 'heading', text: 'Invoice Configuration' },
      { type: 'paragraph', text: 'Go to Dashboard > Configuration to set default invoice preferences like default currency, tax rates, payment terms, and notes that appear on every invoice.' },
    ],
  },
  {
    id: 'support',
    label: 'Need Help?',
    category: 'General',
    content: [
      { type: 'subtitle', text: 'Need Help?' },
      { type: 'paragraph', text: 'We\'re here to help you get the most out of Day One Tools.' },
      { type: 'heading', text: 'Contact Support' },
      { type: 'paragraph', text: 'Visit the Contact page to reach our support team. We typically respond within 24 hours.' },
      { type: 'heading', text: 'Quick Links' },
      { type: 'list', items: [
        { bold: 'Invoice Generator:', text: 'Create invoices instantly without an account at /invoicegenerator' },
        { bold: 'Dashboard:', text: 'Access all your tools and data at /dashboard' },
        { bold: 'Pricing:', text: 'View plans and pricing at /dashboard/pricing' },
        { bold: 'Contact:', text: 'Get in touch at /contact' },
      ]},
    ],
  },
];

// Group sections by category for sidebar
const sidebarGroups = [
  { label: null, items: sections.filter(s => s.category === null) },
  { label: 'Getting Started', items: sections.filter(s => s.category === 'Getting Started') },
  { label: 'Invoice', items: sections.filter(s => s.category === 'Invoice') },
  { label: 'Organization', items: sections.filter(s => s.category === 'Organization') },
  { label: 'General', items: sections.filter(s => s.category === 'General') },
];

export default function UserGuide({ darkMode = true }) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const colors = darkMode ? {
    bg: '#0d1117',
    bgCard: '#161b22',
    bgSidebar: '#0d1117',
    bgInput: '#21262d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    textDim: '#484f58',
    border: '#21262d',
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.1)',
    divider: '#21262d',
  } : {
    bg: '#ffffff',
    bgCard: '#ffffff',
    bgSidebar: '#f8fafc',
    bgInput: '#f1f5f9',
    text: '#1f2937',
    textMuted: '#6b7280',
    textDim: '#9ca3af',
    border: '#e5e7eb',
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.08)',
    divider: '#e5e7eb',
  };

  const current = sections.find(s => s.id === activeSection) || sections[0];

  // Generate a stable slug from heading text
  const toSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Extract headings for the "On this page" sidebar
  const tocItems = current.content
    .filter(c => c.type === 'subtitle' || c.type === 'heading' || c.type === 'subheading')
    .map(c => ({ text: c.text, level: c.type === 'subtitle' ? 0 : c.type === 'heading' ? 1 : 2, id: toSlug(c.text) }));

  const handleNav = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const renderContent = (items) => items.map((item, i) => {
    switch (item.type) {
      case 'subtitle':
        return <h1 key={i} id={toSlug(item.text)} style={{ fontSize: '28px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0', lineHeight: '1.3', scrollMarginTop: '80px' }}>{item.text}</h1>;
      case 'heading':
        return <h2 key={i} id={toSlug(item.text)} style={{ fontSize: '20px', fontWeight: '600', color: colors.text, margin: '32px 0 12px 0', lineHeight: '1.4', scrollMarginTop: '80px' }}>{item.text}</h2>;
      case 'subheading':
        return <h3 key={i} id={toSlug(item.text)} style={{ fontSize: '17px', fontWeight: '600', color: colors.text, margin: '24px 0 10px 0', lineHeight: '1.4', scrollMarginTop: '80px' }}>{item.text}</h3>;
      case 'paragraph':
        return <p key={i} style={{ fontSize: '15px', color: colors.textMuted, lineHeight: '1.75', margin: '0 0 16px 0' }}>{item.text}</p>;
      case 'divider':
        return <hr key={i} style={{ border: 'none', borderTop: `1px solid ${colors.divider}`, margin: '24px 0' }} />;
      case 'list':
        return (
          <ul key={i} style={{ margin: '0 0 16px 0', padding: '0 0 0 20px', listStyle: 'disc' }}>
            {item.items.map((li, j) => (
              <li key={j} style={{ fontSize: '15px', color: colors.textMuted, lineHeight: '1.75', marginBottom: '10px' }}>
                <strong style={{ color: colors.text }}>{li.bold}</strong> {li.text}
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  });

  // Sidebar content (reused for mobile overlay and desktop)
  const sidebarContent = (
    <nav>
      {sidebarGroups.map((group, gi) => (
        <div key={gi} style={{ marginBottom: '8px' }}>
          {group.label && (
            <div style={{
              fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
              color: colors.textDim, padding: '16px 16px 6px 16px',
            }}>{group.label}</div>
          )}
          {group.items.map(s => {
            const isActive = s.id === activeSection;
            return (
              <button
                key={s.id}
                onClick={() => handleNav(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                  padding: '8px 16px', fontSize: '14px', fontFamily: "'Inter', sans-serif",
                  borderRadius: '0',
                  background: isActive ? colors.accentBg : 'transparent',
                  color: isActive ? colors.accent : colors.textMuted,
                  fontWeight: isActive ? '600' : '400',
                  borderLeft: isActive ? `2px solid ${colors.accent}` : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div style={{
      display: 'flex', minHeight: 'calc(100vh - 60px)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: colors.bg,
    }}>
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 200,
            width: '48px', height: '48px', borderRadius: '50%',
            background: colors.accent, color: '#fff', border: 'none',
            cursor: 'pointer', fontSize: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {sidebarOpen ? '\u2715' : '\u2630'}
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, zIndex: 150,
          background: colors.bgSidebar, overflowY: 'auto', padding: '8px 0',
        }}>
          {sidebarContent}
        </div>
      )}

      {/* Desktop left sidebar */}
      {!isMobile && (
        <aside style={{
          width: '240px', minWidth: '240px',
          borderRight: `1px solid ${colors.border}`,
          background: colors.bgSidebar,
          overflowY: 'auto',
          position: 'sticky', top: '60px', height: 'calc(100vh - 60px)',
          padding: '8px 0',
        }}>
          {sidebarContent}
        </aside>
      )}

      {/* Main content */}
      <main ref={contentRef} style={{
        flex: 1,
        maxWidth: '720px',
        padding: isMobile ? '24px 20px 80px 20px' : '40px 48px',
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: '13px', color: colors.textDim, marginBottom: '4px', fontWeight: '500' }}>
          {current.category || 'Documentation'}
        </div>
        <h1 style={{
          fontSize: '32px', fontWeight: '700', color: colors.text,
          margin: '0 0 6px 0', lineHeight: '1.2',
        }}>{current.label}</h1>
        {current.id === 'introduction' && (
          <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 24px 0', lineHeight: '1.6' }}>
            Day One Tools - New Generation Invoice generation and management platform for modern businesses.
          </p>
        )}
        <hr style={{ border: 'none', borderTop: `1px solid ${colors.divider}`, margin: '16px 0 32px 0' }} />

        {renderContent(current.content)}
      </main>

      {/* Right "On this page" sidebar */}
      {!isMobile && (
        <aside style={{
          width: '200px', minWidth: '200px',
          position: 'sticky', top: '60px', height: 'calc(100vh - 60px)',
          overflowY: 'auto',
          padding: '40px 16px',
        }}>
          <div style={{
            fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
            color: colors.textDim, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ fontSize: '14px' }}>{'\u2261'}</span> On this page
          </div>
          {tocItems.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                fontSize: '13px',
                color: item.level === 0 ? colors.text : colors.textMuted,
                fontWeight: item.level === 0 ? '600' : '400',
                padding: '4px 0',
                paddingLeft: item.level === 2 ? '12px' : '0',
                lineHeight: '1.5',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = item.level === 0 ? colors.text : colors.textMuted}
            >
              {item.text}
            </div>
          ))}
        </aside>
      )}
    </div>
  );
}
