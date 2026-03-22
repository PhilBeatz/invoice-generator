import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header({ darkMode = true, user, supabase }) {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productDropdown, setProductDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setMenuOpen(false);
    navigate('/');
  };

  const colors = darkMode ? {
    bg: '#111111',
    border: '#2d2d2d',
    text: '#ffffff',
    textMuted: '#9ca3af',
    accent: '#3b82f6',
  } : {
    bg: '#ffffff',
    border: '#e5e7eb',
    text: '#1f2937',
    textMuted: '#6b7280',
    accent: '#3b82f6',
  };

  const navLinkStyle = {
    color: colors.textMuted,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    transition: 'color 0.2s',
  };

  return (
    <div style={{
      background: colors.bg,
      borderBottom: `1px solid ${colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
    }}>
      <header style={{
        padding: isMobile ? '0 16px' : '0 40px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setMenuOpen(false)}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: colors.text, fontFamily: "'Inter', sans-serif" }}>Day One</span>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProductDropdown(!productDropdown)}
                  style={{
                    ...navLinkStyle,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                  }}
                >
                  Product
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: productDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {productDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: '8px',
                    background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px',
                    padding: '8px 0', minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 200,
                  }}>
                    <Link to="/invoicegenerator" onClick={() => setProductDropdown(false)} style={{ display: 'block', padding: '10px 16px', color: colors.text, textDecoration: 'none', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>Invoice Generator</Link>
                    <Link to="/dashboard" onClick={() => setProductDropdown(false)} style={{ display: 'block', padding: '10px 16px', color: colors.text, textDecoration: 'none', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>Dashboard</Link>
                  </div>
                )}
              </div>
              <Link to="/docs" style={navLinkStyle}>Docs</Link>
              <Link to="/contact" style={navLinkStyle}>Contact</Link>
              <Link to="/pricing" style={navLinkStyle}>Pricing</Link>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user ? (
                <>
                  <Link to="/dashboard" style={{ ...navLinkStyle, fontSize: '13px' }}>Dashboard</Link>
                  <button onClick={handleLogout} style={{ ...navLinkStyle, fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" style={{ ...navLinkStyle, fontSize: '13px' }}>Sign In</Link>
                  <Link to="/signup" style={{
                    padding: '8px 18px', background: colors.accent, color: '#ffffff',
                    borderRadius: '6px', border: 'none', textDecoration: 'none',
                    fontSize: '13px', fontWeight: '600', fontFamily: "'Inter', sans-serif",
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                  }}>Start Free Trial <span style={{ fontSize: '14px' }}>→</span></Link>
                </>
              )}
            </div>
          </>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              width: '40px', height: '40px', gap: '0px',
            }}
          >
            <span style={{
              display: 'block', width: '22px', height: '2px', background: colors.text, borderRadius: '2px',
              transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(45deg) translateY(3.5px)' : 'rotate(0deg) translateY(-3.5px)',
            }} />
            <span style={{
              display: 'block', width: '22px', height: '2px', background: colors.text, borderRadius: '2px',
              transition: 'all 0.2s ease', opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block', width: '22px', height: '2px', background: colors.text, borderRadius: '2px',
              transition: 'all 0.3s ease',
              transform: menuOpen ? 'rotate(-45deg) translateY(-3.5px)' : 'rotate(0deg) translateY(3.5px)',
            }} />
          </button>
        )}
      </header>

      {/* Mobile menu overlay */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
          background: colors.bg, zIndex: 99,
          display: 'flex', flexDirection: 'column',
          padding: '8px 0',
          overflowY: 'auto',
          animation: 'slideDown 0.2s ease',
        }}>
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Nav links */}
          <div style={{ borderBottom: `1px solid ${colors.border}`, padding: '8px 0' }}>
            <Link to="/invoicegenerator" onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '14px 24px', color: colors.text, textDecoration: 'none',
              fontSize: '15px', fontWeight: '500', fontFamily: "'Inter', sans-serif",
            }}>Invoice Generator</Link>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '14px 24px', color: colors.text, textDecoration: 'none',
              fontSize: '15px', fontWeight: '500', fontFamily: "'Inter', sans-serif",
            }}>Dashboard</Link>
            <Link to="/docs" onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '14px 24px', color: colors.text, textDecoration: 'none',
              fontSize: '15px', fontWeight: '500', fontFamily: "'Inter', sans-serif",
            }}>Docs</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '14px 24px', color: colors.text, textDecoration: 'none',
              fontSize: '15px', fontWeight: '500', fontFamily: "'Inter', sans-serif",
            }}>Contact</Link>
            <Link to="/pricing" onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '14px 24px', color: colors.text, textDecoration: 'none',
              fontSize: '15px', fontWeight: '500', fontFamily: "'Inter', sans-serif",
            }}>Pricing</Link>
          </div>

          {/* Auth */}
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px 20px',
                  background: colors.accent, color: '#ffffff', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '15px', fontWeight: '600', fontFamily: "'Inter', sans-serif",
                }}>Go to Dashboard</Link>
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px 20px',
                  background: 'transparent', color: colors.textMuted, borderRadius: '8px',
                  border: `1px solid ${colors.border}`, fontSize: '15px', fontWeight: '500',
                  fontFamily: "'Inter', sans-serif", cursor: 'pointer',
                }}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/signup" onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px 20px',
                  background: colors.accent, color: '#ffffff', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '15px', fontWeight: '600', fontFamily: "'Inter', sans-serif", gap: '6px',
                }}>Start Free Trial <span>→</span></Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '13px 20px',
                  background: 'transparent', color: colors.text, borderRadius: '8px',
                  border: `1px solid ${colors.border}`, textDecoration: 'none',
                  fontSize: '15px', fontWeight: '500', fontFamily: "'Inter', sans-serif",
                }}>Sign In</Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
