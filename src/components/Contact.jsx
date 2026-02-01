import React, { useState, useEffect } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(''); // 'sending', 'success', 'error'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const colors = {
    bg: '#0a0a0a',
    bgCard: '#141414',
    bgInput: '#1f1f1f',
    text: '#ffffff',
    textMuted: '#9ca3af',
    accent: '#10b981',
    border: '#2d2d2d',
    red: '#ef4444',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    // Formspree form ID
    const FORMSPREE_ID = 'mrelkaer';

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          category: formData.category,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', category: 'General Inquiry', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    color: colors.text,
    fontSize: '15px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: '8px',
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        input:focus, select:focus, textarea:focus { border-color: #10b981 !important; }
        input::placeholder, textarea::placeholder { color: #6b7280; }
        select option { background: #1f1f1f; color: #f3f4f6; }
      `}</style>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: isMobile ? '50px 20px 40px' : '70px 20px 50px' }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: colors.textMuted, 
          letterSpacing: '3px', 
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          Support & Contact
        </div>
        <h1 style={{ 
          fontSize: isMobile ? '32px' : '48px', 
          fontWeight: '700', 
          color: colors.text, 
          marginBottom: '20px',
          letterSpacing: '-1px'
        }}>
          We're here to help
        </h1>
        <p style={{ 
          color: colors.textMuted, 
          fontSize: isMobile ? '15px' : '18px', 
          maxWidth: '600px', 
          margin: '0 auto',
          lineHeight: '1.7'
        }}>
          Whether you need technical support, want to report a bug, suggest a feature, or discuss collaboration—we're ready to assist you.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: isMobile ? '0 16px 60px' : '0 20px 80px'
      }}>
        <div style={{ 
          background: colors.bgCard, 
          borderRadius: '16px', 
          border: `1px solid ${colors.border}`,
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr',
            minHeight: '500px'
          }}>
            {/* Left Side - Info */}
            <div style={{ padding: isMobile ? '30px 24px' : '40px 36px', borderRight: isMobile ? 'none' : `1px solid ${colors.border}`, borderBottom: isMobile ? `1px solid ${colors.border}` : 'none' }}>
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '20px',
                marginBottom: '24px'
              }}>
                <span style={{ width: '8px', height: '8px', background: colors.accent, borderRadius: '50%' }}></span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Response within 24 hours
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.text, marginBottom: '16px' }}>
                How can we assist you?
              </h2>
              <p style={{ fontSize: '15px', color: colors.textMuted, lineHeight: '1.7', marginBottom: '32px' }}>
                Get help with technical issues, report bugs, request features, ask questions, or explore partnership opportunities. Our team is here to support you. Prefer email? Reach us at{' '}
                <a href="mailto:contact@dayonetools.app" style={{ color: colors.text, textDecoration: 'underline' }}>
                  contact@dayonetools.app
                </a>
              </p>

              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: colors.bgInput,
                borderRadius: '10px',
                border: `1px solid ${colors.border}`
              }}>
                <span style={{ fontSize: '20px' }}>✉️</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>Email</div>
                  <div style={{ fontSize: '14px', color: colors.textMuted }}>contact@dayonetools.app</div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div style={{ padding: isMobile ? '30px 24px' : '40px 36px' }}>
              {status === 'success' ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <h3 style={{ fontSize: '22px', fontWeight: '600', color: colors.text, marginBottom: '12px' }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: colors.textMuted, marginBottom: '24px' }}>
                    We'll get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setStatus('')}
                    style={{ padding: '12px 24px', background: colors.accent, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Name (Optional)</label>
                      <input 
                        type="text"
                        style={inputStyle}
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Email <span style={{ color: colors.red }}>*</span>
                      </label>
                      <input 
                        type="email"
                        required
                        style={inputStyle}
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>
                      Category <span style={{ color: colors.red }}>*</span>
                    </label>
                    <select 
                      required
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>
                      Subject <span style={{ color: colors.red }}>*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      minLength={5}
                      maxLength={200}
                      style={inputStyle}
                      placeholder="Brief description of your issue (5-200 characters)"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>
                      Message <span style={{ color: colors.red }}>*</span>
                    </label>
                    <textarea 
                      required
                      minLength={20}
                      maxLength={5000}
                      style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                      placeholder="Describe your issue in detail... (20-5000 characters)"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    />
                    <div style={{ textAlign: 'right', fontSize: '12px', color: colors.textMuted, marginTop: '6px' }}>
                      {formData.message.length}/5000
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={status === 'sending'}
                    style={{ 
                      width: '100%',
                      padding: '16px',
                      background: status === 'sending' ? '#6b7280' : colors.accent,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {status === 'sending' ? 'Sending...' : 'Submit Ticket'} 
                    {status !== 'sending' && <span>➤</span>}
                  </button>

                  {status === 'error' && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: colors.red, fontSize: '14px', textAlign: 'center' }}>
                      Something went wrong. Please try again or email us directly.
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: colors.textMuted }}>
          By submitting this form you agree to our{' '}
          <a href="/privacy" style={{ color: colors.text, textDecoration: 'underline' }}>privacy policy</a>.
        </div>
      </div>
    </div>
  );
}
