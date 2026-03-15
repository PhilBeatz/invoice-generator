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
        { bold: 'File Vault:', text: 'Securely store and manage important business documents alongside your invoices' },
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
      { type: 'paragraph', text: 'The invoice system is the core of Day One Tools. Here\'s everything you need to know about creating, managing, and sending invoices.' },
      { type: 'heading', text: 'Creating an Invoice' },
      { type: 'paragraph', text: 'From the dashboard, click "Create" in the sidebar to open the invoice generator. You can also access the free public invoice generator at /invoicegenerator without an account.' },
      { type: 'subheading', text: 'Invoice Modes' },
      { type: 'list', items: [
        { bold: 'Products Mode:', text: 'Add line items with name, quantity, unit price, and optional tax. Ideal for product-based businesses.' },
        { bold: 'Hourly Mode:', text: 'Track hours worked with hourly rates. Perfect for freelancers and service providers.' },
      ]},
      { type: 'heading', text: 'Invoice Templates' },
      { type: 'paragraph', text: 'Day One Tools offers multiple professionally designed templates. Select your preferred template from the template picker in the invoice generator. Each template supports full customization including colors, fonts, and layout.' },
      { type: 'heading', text: 'Taxes, Discounts & Shipping' },
      { type: 'list', items: [
        { bold: 'Tax:', text: 'Add tax as a percentage. Toggle "Tax included in prices" if your prices already include tax.' },
        { bold: 'Discount:', text: 'Apply a flat amount or percentage discount to the invoice subtotal.' },
        { bold: 'Shipping:', text: 'Add shipping charges as a separate line on the invoice.' },
      ]},
      { type: 'heading', text: 'Sharing Invoices' },
      { type: 'paragraph', text: 'Share invoices with customers via secure, password-protected links. You can set expiration dates and view limits for added security. Customers can view and download the invoice without needing an account.' },
      { type: 'heading', text: 'Managing Invoices' },
      { type: 'paragraph', text: 'View all your invoices from Dashboard > Invoices. Filter by status (draft, sent, paid, overdue), search by customer or invoice number, and sort by date or amount. Click any invoice to view details, edit, duplicate, or download as PDF.' },
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
    id: 'vault',
    label: 'File Vault',
    category: 'General',
    content: [
      { type: 'subtitle', text: 'File Vault' },
      { type: 'paragraph', text: 'Securely store and manage your important business documents.' },
      { type: 'heading', text: 'Using the Vault' },
      { type: 'paragraph', text: 'Navigate to Dashboard > Vault to access your secure file storage. Upload contracts, receipts, agreements, and other business documents. Files are encrypted and accessible only to your account.' },
      { type: 'heading', text: 'Supported Files' },
      { type: 'paragraph', text: 'The vault supports common document formats including PDF, images (PNG, JPG), Word documents, Excel spreadsheets, and more.' },
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

  // Extract headings for the "On this page" sidebar
  const tocItems = current.content
    .filter(c => c.type === 'subtitle' || c.type === 'heading' || c.type === 'subheading')
    .map(c => ({ text: c.text, level: c.type === 'subtitle' ? 0 : c.type === 'heading' ? 1 : 2 }));

  const handleNav = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const renderContent = (items) => items.map((item, i) => {
    switch (item.type) {
      case 'subtitle':
        return <h1 key={i} style={{ fontSize: '28px', fontWeight: '700', color: colors.text, margin: '0 0 8px 0', lineHeight: '1.3' }}>{item.text}</h1>;
      case 'heading':
        return <h2 key={i} id={`heading-${i}`} style={{ fontSize: '20px', fontWeight: '600', color: colors.text, margin: '32px 0 12px 0', lineHeight: '1.4' }}>{item.text}</h2>;
      case 'subheading':
        return <h3 key={i} id={`heading-${i}`} style={{ fontSize: '17px', fontWeight: '600', color: colors.text, margin: '24px 0 10px 0', lineHeight: '1.4' }}>{item.text}</h3>;
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
            <div key={i} style={{
              fontSize: '13px',
              color: item.level === 0 ? colors.text : colors.textMuted,
              fontWeight: item.level === 0 ? '600' : '400',
              padding: '4px 0',
              paddingLeft: item.level === 2 ? '12px' : '0',
              lineHeight: '1.5',
              cursor: 'default',
            }}>
              {item.text}
            </div>
          ))}
        </aside>
      )}
    </div>
  );
}
