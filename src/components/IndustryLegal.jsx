import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function IndustryLegal({ darkMode = true }) {
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
    { icon: '⚖️', title: 'Professional legal invoice templates', desc: 'Clean, court-ready templates designed for legal billing with detailed service line items, case references, and trust account annotations.' },
    { icon: '📋', title: 'Detailed service line items', desc: 'Break down every invoice by consultation hours, document preparation, court appearances, depositions, and other legal services with precise time entries.' },
    { icon: '💰', title: 'Expense and disbursement tracking', desc: 'Track and bill client expenses including filing fees, courier costs, expert witness fees, and travel — all itemized on professional invoices.' },
    { icon: '👥', title: 'Client management', desc: 'Maintain a comprehensive database of clients with case numbers, matter descriptions, contact details, and complete billing history.' },
    { icon: '💲', title: 'Multi-currency support', desc: 'Handle international clients and cross-border legal matters with built-in multi-currency invoicing and automatic formatting.' },
    { icon: '✅', title: 'Payment status tracking', desc: 'Monitor outstanding balances across all matters. Track retainer drawdowns, identify overdue accounts, and send automated payment reminders.' },
  ];

  const useCases = [
    { title: 'Billable Hours Tracking', desc: 'Log time entries by matter and attorney. Generate detailed invoices that break down every hour spent on consultations, research, drafting, and court appearances.', icon: '⏱️' },
    { title: 'Retainer Management', desc: 'Track retainer balances, drawdowns, and replenishment requests. Automatically generate invoices when retainer funds are depleted.', icon: '📑' },
    { title: 'Trust Account Billing', desc: 'Maintain compliance with trust accounting rules. Generate invoices that clearly distinguish between earned fees and trust account disbursements.', icon: '🏦' },
    { title: 'Matter-Based Invoicing', desc: 'Organize all billing by case or matter number. Track expenses, time, and disbursements per matter for complete financial visibility.', icon: '📂' },
  ];

  return (
    <div style={{ background: darkMode ? '#0d1117' : '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ===== BREADCRUMB ===== */}
      <div style={{
        padding: '12px 40px',
        maxWidth: '1100px', margin: '0 auto',
        fontSize: '13px', color: colors.textMuted,
      }}>
        <Link to="/" style={{ color: colors.textMuted, textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span>Industries</span>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: colors.text }}>Legal & Law Firms</span>
      </div>

      {/* ===== HERO ===== */}
      <div style={{
        background: darkMode ? 'linear-gradient(180deg, #0d1117 0%, #11151a 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f0f4ff 100%)',
        padding: isMobile ? '40px 16px 40px' : '60px 40px 60px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
            background: `${colors.accent}20`, color: colors.accent,
            fontSize: '12px', fontWeight: '700', marginBottom: '20px',
            letterSpacing: '0.5px',
          }}>
            Legal & Law Firms Invoicing
          </div>

          <h1 style={{
            fontSize: isMobile ? '32px' : '48px', fontWeight: '800',
            color: colors.text, margin: '0 0 16px', lineHeight: '1.15',
          }}>
            Legal Invoicing Platform<br />for Attorneys & Law Firms
          </h1>

          <p style={{
            fontSize: isMobile ? '15px' : '16px', color: colors.textMuted,
            maxWidth: '600px', margin: '0 auto 28px', lineHeight: '1.6',
          }}>
            Create professional legal invoices with detailed line items for services and expenses. Manage
            client information, track payment status, and maintain a professional image with Day One.
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
              { num: '30+', label: 'Law Firms Trust Us' },
              { num: '$70,000+', label: 'Legal Fees Invoiced' },
              { num: '70%', label: 'Time Saved on Billing' },
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
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=600&fit=crop"
              alt="Legal professionals in office"
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
          What is Legal Invoicing Platform?
        </h2>
        <p style={{
          fontSize: '15px', color: colors.textMuted, maxWidth: '700px',
          margin: '0 auto 40px', lineHeight: '1.7',
        }}>
          Legal invoicing platform helps attorneys, law firms, and legal professionals create professional invoices for legal
          services. With Day One, you can create detailed invoices for consultations, legal research, document preparation,
          and court appearances while maintaining client information and tracking payment status.
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
        background: darkMode ? '#111318' : '#f0f4ff',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-block', padding: '6px 14px', borderRadius: '20px',
              background: `${colors.accent}20`, color: colors.accent,
              fontSize: '12px', fontWeight: '700', marginBottom: '12px',
            }}>
              Built for Legal Professionals
            </div>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: colors.text, margin: 0 }}>
              How Law Firms Use Day One
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
          <div style={{
            display: 'inline-block', padding: '6px 14px', borderRadius: '20px',
            background: `${colors.accent}20`, color: colors.accent,
            fontSize: '11px', fontWeight: '700', marginBottom: '12px',
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Key Features
          </div>
          <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: colors.text, margin: '0 0 12px' }}>
            Everything You Need to Succeed
          </h2>
          <p style={{ fontSize: '15px', color: colors.textMuted, maxWidth: '600px', margin: '0 auto' }}>
            Purpose-built features for attorneys and legal professionals.
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
            Ready to Streamline Your Legal Billing?
          </h2>
          <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 28px', lineHeight: '1.6' }}>
            Join law firms who use Day One to bill clients professionally and get paid faster. Start your free trial today — no credit card required.
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
