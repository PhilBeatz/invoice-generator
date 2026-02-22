import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Industries({ darkMode = true }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const colors = darkMode ? {
    bg: '#0d1117', bgCard: '#161b22', text: '#e6edf3',
    textMuted: '#8b949e', border: '#30363d', accent: '#10b981',
  } : {
    bg: '#ffffff', bgCard: '#f8fafc', text: '#1f2937',
    textMuted: '#6b7280', border: '#e5e7eb', accent: '#10b981',
  };

  const industries = [
    { title: 'Construction & Trades', desc: 'Job costing, progress billing, and material tracking for contractors, builders, and trade professionals.', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop', link: '/industries/construction' },
    { title: 'Legal Services', desc: 'Billable hours, retainer management, and trust accounting for attorneys and law firms.', img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop', link: '/industries/legal' },
    { title: 'Freelancers & Creatives', desc: 'Project-based billing, licensing fees, and usage rights for independent professionals.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop', link: null },
    { title: 'IT & Software', desc: 'Recurring billing, SaaS subscriptions, and project invoicing for developers and agencies.', img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop', link: '/industries/it' },
    { title: 'Business Consulting', desc: 'Consulting fees, milestone billing, and expense tracking for advisory firms.', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop', link: null },
    { title: 'Creative Services', desc: 'Project-based billing, licensing fees, and usage rights for design and media agencies.', img: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=400&fit=crop', link: null },
  ];

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Hero */}
      <div style={{
        padding: isMobile ? '60px 16px 40px' : '80px 40px 60px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
            background: `${colors.accent}20`, color: colors.accent,
            fontSize: '12px', fontWeight: '700', marginBottom: '20px',
            letterSpacing: '0.5px',
          }}>
            🏢 Built For Your Industry
          </div>
          <h1 style={{
            fontSize: isMobile ? '32px' : '48px', fontWeight: '800',
            color: colors.text, margin: '0 0 16px', lineHeight: '1.15',
          }}>
            Invoice Software Tailored to Your Business
          </h1>
          <p style={{
            fontSize: isMobile ? '15px' : '16px', color: colors.textMuted,
            maxWidth: '560px', margin: '0 auto', lineHeight: '1.6',
          }}>
            Every industry has unique invoicing needs. Day One provides specialized features
            and templates designed for how you work.
          </p>
        </div>
      </div>

      {/* Industry Grid */}
      <div style={{
        padding: isMobile ? '0 16px 60px' : '0 40px 80px',
        maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {industries.map((industry, i) => {
            const CardWrapper = industry.link ? Link : 'div';
            const wrapperProps = industry.link ? { to: industry.link, style: { textDecoration: 'none', color: 'inherit' } } : {};
            return (
              <CardWrapper key={i} {...wrapperProps}>
                <div style={{
                  background: colors.bgCard,
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  overflow: 'hidden',
                  cursor: industry.link ? 'pointer' : 'default',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { if (industry.link) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    height: '180px',
                    backgroundImage: `url(${industry.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '16px',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%)',
                    }} />
                    <h3 style={{
                      fontSize: '18px', fontWeight: '700', color: '#ffffff',
                      margin: 0, position: 'relative', zIndex: 1,
                    }}>
                      {industry.title}
                    </h3>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <p style={{
                      fontSize: '14px', color: colors.textMuted,
                      margin: '0 0 14px', lineHeight: '1.6',
                    }}>
                      {industry.desc}
                    </p>
                    {industry.link ? (
                      <span style={{
                        fontSize: '13px', fontWeight: '600', color: colors.accent,
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                      }}>
                        Learn more →
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '13px', fontWeight: '600', color: colors.accent,
                        opacity: 0.6,
                      }}>
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        padding: isMobile ? '40px 16px 60px' : '40px 40px 80px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 0 20px' }}>
          Don't see your industry? Day One works for any business that sends invoices.
        </p>
        <Link to="/signup" style={{
          padding: '14px 28px', background: colors.accent, color: '#fff',
          borderRadius: '8px', textDecoration: 'none', fontSize: '15px',
          fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px',
        }}>
          Start Free Trial →
        </Link>
      </div>
    </div>
  );
}
