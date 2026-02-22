import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function IndustryIT({ darkMode = true }) {
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
    { icon: '📋', title: 'Itemized project & support billing', desc: 'Break down invoices by project phase, support ticket, or deliverable. Bill for development sprints, bug fixes, deployments, and ongoing maintenance with full transparency.' },
    { icon: '⏱️', title: 'Hourly, milestone, and retainer-friendly', desc: 'Flexible billing modes for any engagement type — log hourly development time, bill at project milestones, or draw down from monthly retainers automatically.' },
    { icon: '👥', title: 'Client management', desc: 'Maintain a database of clients with project histories, contract details, SLA terms, and complete billing records across all engagements.' },
    { icon: '🔒', title: 'Secure invoice sharing', desc: 'Share invoices with password protection, expiration dates, and view limits. Clients get a professional, branded experience when reviewing invoices.' },
    { icon: '📊', title: 'Payment status tracking', desc: 'Monitor outstanding balances across all projects and clients. Track recurring revenue, identify late payments, and send automated reminders.' },
    { icon: '📄', title: 'Professional templates', desc: 'Clean, modern invoice templates that reflect the quality of your technical work. Customizable with your branding, logos, and project details.' },
  ];

  const useCases = [
    { title: 'Project-Based Billing', desc: 'Invoice clients at project milestones or on completion. Track deliverables, scope changes, and additional work with clear line items that clients can verify against the SOW.', icon: '🚀' },
    { title: 'SaaS & Subscription Billing', desc: 'Generate recurring invoices for SaaS products, hosting fees, and managed services. Track license counts, usage tiers, and annual vs monthly billing cycles.', icon: '🔄' },
    { title: 'Hourly Development Work', desc: 'Log development hours by project, sprint, or task. Generate detailed timesheets alongside invoices so clients see exactly what they are paying for.', icon: '💻' },
    { title: 'Support & Maintenance Contracts', desc: 'Bill for ongoing support hours, SLA-based services, and maintenance agreements. Track retainer balances and alert clients when hours are running low.', icon: '🛠️' },
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
        <span style={{ color: colors.text }}>IT & Software</span>
      </div>

      {/* ===== HERO ===== */}
      <div style={{
        background: darkMode ? 'linear-gradient(180deg, #0d1117 0%, #0d1520 100%)' : 'linear-gradient(180deg, #ffffff 0%, #eef4ff 100%)',
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
            Software & IT Invoicing
          </div>

          <h1 style={{
            fontSize: isMobile ? '32px' : '48px', fontWeight: '800',
            color: colors.text, margin: '0 0 16px', lineHeight: '1.15',
          }}>
            Invoice Platform Built for<br />Software & IT Teams
          </h1>

          <p style={{
            fontSize: isMobile ? '15px' : '16px', color: colors.textMuted,
            maxWidth: '620px', margin: '0 auto 28px', lineHeight: '1.6',
          }}>
            Bill accurately for project milestones, hourly work, retainers, and ongoing support.
            Keep invoices organized with detailed line items, secure sharing, and payment tracking — so you can focus on delivery.
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

          {/* Highlight Keywords */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '16px' : '32px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {[
              { bold: 'Fast', sub: 'Project Billing' },
              { bold: 'Clear', sub: 'Line Items' },
              { bold: 'Secure', sub: 'Sharing' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: colors.text }}>{item.bold} </span>
                <span style={{ fontSize: '14px', color: colors.textMuted }}>{item.sub}</span>
              </div>
            ))}
          </div>

          {/* Hero Image */}
          <div style={{
            maxWidth: '700px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden',
            border: `1px solid ${colors.border}`,
          }}>
            <img
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&h=600&fit=crop"
              alt="Software developers working in a tech office"
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
          What is Software & IT Invoice Software?
        </h2>
        <p style={{
          fontSize: '15px', color: colors.textMuted, maxWidth: '700px',
          margin: '0 auto 40px', lineHeight: '1.7',
        }}>
          Software and IT invoice software helps developers, consultants, and agencies bill accurately for project
          milestones, hourly work, retainers, and ongoing support. Day One keeps invoices organized with detailed line
          items, secure sharing, and payment tracking — so you can focus on delivery.
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
        background: darkMode ? '#0d1520' : '#eef4ff',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-block', padding: '6px 14px', borderRadius: '20px',
              background: `${colors.accent}20`, color: colors.accent,
              fontSize: '12px', fontWeight: '700', marginBottom: '12px',
            }}>
              Built for Tech Teams
            </div>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: colors.text, margin: 0 }}>
              How IT & Software Teams Use Day One
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
            Everything You Need to Bill with Confidence
          </h2>
          <p style={{ fontSize: '15px', color: colors.textMuted, maxWidth: '600px', margin: '0 auto' }}>
            Purpose-built invoicing features for software developers, IT consultants, and agencies.
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
            Ready to Simplify Your IT Billing?
          </h2>
          <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 28px', lineHeight: '1.6' }}>
            Join software teams and IT consultants who use Day One to bill clients clearly and get paid faster. Start your free trial today — no credit card required.
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
