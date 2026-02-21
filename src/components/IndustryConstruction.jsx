import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function IndustryConstruction({ darkMode = true }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const colors = darkMode ? {
    bg: '#0d1117', bgCard: '#161b22', bgInput: '#21262d', text: '#e6edf3',
    textMuted: '#8b949e', border: '#30363d', accent: '#10b981', blue: '#3b82f6',
  } : {
    bg: '#ffffff', bgCard: '#f8fafc', bgInput: '#f1f5f9', text: '#1f2937',
    textMuted: '#6b7280', border: '#e5e7eb', accent: '#10b981', blue: '#3b82f6',
  };

  const features = [
    { icon: '📄', title: 'Professional invoice templates', desc: 'Clean, detailed templates designed for construction billing with line items for materials, labor, equipment, and subcontractor costs.' },
    { icon: '🔧', title: 'Detailed line items for materials and labor', desc: 'Break down every invoice with separate sections for materials, labor hours, equipment rental, and overhead costs.' },
    { icon: '📦', title: 'Product catalog with categories and SKUs', desc: 'Organize your materials and services with a full product catalog. Categorize by trade, material type, or project phase.' },
    { icon: '💲', title: 'Multi-currency support', desc: 'Work with international suppliers and clients with built-in multi-currency invoicing and automatic formatting.' },
    { icon: '👥', title: 'Customer and contact management', desc: 'Maintain a database of general contractors, property managers, and clients with complete contact details and project history.' },
    { icon: '⏰', title: 'Payment tracking and reminders', desc: 'Track payment status across all your projects. Get notified when invoices are overdue and send automated reminders.' },
  ];

  const useCases = [
    { title: 'Progress Billing', desc: 'Bill clients at each project milestone. Track percentage of completion and generate progress invoices that reference the original contract amount.', icon: '📊' },
    { title: 'Change Order Tracking', desc: 'Document and invoice change orders separately from the original scope. Keep clear records of additional work and associated costs.', icon: '📝' },
    { title: 'Subcontractor Management', desc: 'Track payments to subs, generate lien waivers, and maintain documentation for every subcontractor on your projects.', icon: '🏗️' },
    { title: 'Material Cost Tracking', desc: 'Log material purchases by project and automatically include them in client invoices with markup calculations built in.', icon: '🧱' },
  ];

  return (
    <div style={{ background: darkMode ? '#0d1117' : '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ===== HERO ===== */}
      <div style={{
        background: darkMode ? 'linear-gradient(180deg, #0d1117 0%, #111a12 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
        padding: isMobile ? '60px 16px 40px' : '80px 40px 60px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
            background: `${colors.accent}20`, color: colors.accent,
            fontSize: '12px', fontWeight: '700', marginBottom: '20px',
            letterSpacing: '0.5px',
          }}>
            Construction & Trades Invoicing
          </div>

          <h1 style={{
            fontSize: isMobile ? '32px' : '48px', fontWeight: '800',
            color: colors.text, margin: '0 0 16px', lineHeight: '1.15',
          }}>
            Invoice Platform Built for<br />Construction Professionals
          </h1>

          <p style={{
            fontSize: isMobile ? '15px' : '16px', color: colors.textMuted,
            maxWidth: '600px', margin: '0 auto 28px', lineHeight: '1.6',
          }}>
            Create professional invoices with detailed line items for materials and labor. Use custom
            product catalogs, multi-currency support, and get paid faster with automated reminders.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              padding: '14px 28px', background: colors.accent, color: '#fff',
              borderRadius: '8px', textDecoration: 'none', fontSize: '15px',
              fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              Start Free Trial →
            </Link>
            <Link to="/dashboard/pricing" style={{
              padding: '14px 28px', background: 'transparent',
              border: `1.5px solid ${colors.border}`, color: colors.text,
              borderRadius: '8px', textDecoration: 'none', fontSize: '15px', fontWeight: '600',
            }}>
              View Pricing
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '20px' : '40px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {[
              { num: '150+', label: 'Contractors Trust Us' },
              { num: '$250M+', label: 'Invoiced Amount' },
              { num: '25%', label: 'Faster Payments' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>{stat.num}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Hero Image */}
          <div style={{
            maxWidth: '700px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden',
            border: `1px solid ${colors.border}`,
          }}>
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop"
              alt="Construction professionals reviewing plans"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>
      </div>

      {/* ===== WHAT IS SECTION ===== */}
      <div style={{
        padding: isMobile ? '60px 16px' : '80px 40px',
        maxWidth: '900px', margin: '0 auto', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: colors.text, margin: '0 0 16px' }}>
          What is Construction Invoice Software?
        </h2>
        <p style={{
          fontSize: '15px', color: colors.textMuted, maxWidth: '700px',
          margin: '0 auto 40px', lineHeight: '1.7',
        }}>
          Construction invoice software helps contractors, builders, and trade professionals create detailed professional
          invoices. With Day One, you can organize products by category, create line items for materials and labor, track
          customer information, and manage multiple projects with ease — all while maintaining professional documentation.
        </p>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '12px',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px', background: colors.bgCard,
              border: `1px solid ${colors.border}`, borderRadius: '10px',
              textAlign: 'left',
            }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{f.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>{f.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== USE CASES ===== */}
      <div style={{
        padding: isMobile ? '60px 16px' : '80px 40px',
        background: darkMode ? '#111a12' : '#f0fdf4',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-block', padding: '6px 14px', borderRadius: '20px',
              background: `${colors.accent}20`, color: colors.accent,
              fontSize: '12px', fontWeight: '700', marginBottom: '12px',
            }}>
              Built for the Job Site
            </div>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: colors.text, margin: 0 }}>
              How Contractors Use Day One
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '16px',
          }}>
            {useCases.map((uc, i) => (
              <div key={i} style={{
                padding: '24px', background: colors.bgCard,
                border: `1px solid ${colors.border}`, borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{uc.icon}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, margin: 0 }}>{uc.title}</h3>
                </div>
                <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', margin: 0 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== DETAILED FEATURES ===== */}
      <div style={{
        padding: isMobile ? '60px 16px' : '80px 40px',
        maxWidth: '900px', margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: colors.text, margin: '0 0 12px' }}>
            Everything You Need to Invoice Like a Pro
          </h2>
          <p style={{ fontSize: '15px', color: colors.textMuted, maxWidth: '600px', margin: '0 auto' }}>
            Purpose-built features for construction and trade businesses.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: 'flex', gap: '20px', padding: '24px',
              background: colors.bgCard, border: `1px solid ${colors.border}`,
              borderRadius: '12px', alignItems: 'flex-start',
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '10px',
                background: `${colors.accent}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text, margin: '0 0 6px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== BOTTOM CTA ===== */}
      <div style={{
        padding: isMobile ? '60px 16px' : '80px 40px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: colors.text, margin: '0 0 12px' }}>
            Ready to Streamline Your Construction Invoicing?
          </h2>
          <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 28px', lineHeight: '1.6' }}>
            Join hundreds of contractors who use Day One to get paid faster. Start your free trial today — no credit card required.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              padding: '14px 32px', background: colors.accent, color: '#fff',
              borderRadius: '8px', textDecoration: 'none', fontSize: '15px',
              fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              Start Free Trial →
            </Link>
            <Link to="/contact" style={{
              padding: '14px 32px', background: 'transparent',
              border: `1.5px solid ${colors.border}`, color: colors.text,
              borderRadius: '8px', textDecoration: 'none', fontSize: '15px', fontWeight: '600',
            }}>
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
