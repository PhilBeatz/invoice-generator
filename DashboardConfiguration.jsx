import React, { useState, useEffect } from 'react';

export default function DashboardConfiguration({ darkMode = true }) {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('numbers');
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    strategy: 'sequential',
    prefix: 'INV',
    sequenceLength: 4,
    customPattern: '{prefix}-{year}-{seq:4}',
    defaultTerms: '',
    defaultEndMessage: 'Thank you for your business!',
    defaultDateFormat: 'Month DD, YYYY',
    defaultTemplate: 'standard',
    defaultLanguage: 'english',
    customFields: [],
  });
  const [draft, setDraft] = useState(null);
  const [nextSeq, setNextSeq] = useState(1);

  const colors = darkMode ? {
    bg: '#0d1117', bgCard: '#161b22', bgCard2: '#1c2128', bgInput: '#21262d',
    text: '#e6edf3', textMuted: '#8b949e', border: '#30363d',
    accent: '#3b82f6', green: '#10b981', red: '#ef4444', orange: '#f97316',
  } : {
    bg: '#f1f5f9', bgCard: '#ffffff', bgCard2: '#f8fafc', bgInput: '#f8fafc',
    text: '#1f2937', textMuted: '#6b7280', border: '#e5e7eb',
    accent: '#3b82f6', green: '#10b981', red: '#ef4444', orange: '#f97316',
  };

  // Load settings
  useEffect(() => {
    const s = localStorage.getItem('dayonetools_invoice_settings');
    if (s) { try { setSettings(JSON.parse(s)); } catch(e){} }
    // Get next sequence number from existing invoices
    const invs = localStorage.getItem('dayonetools_invoices');
    if (invs) { try { setNextSeq(JSON.parse(invs).length + 1); } catch(e){} }
  }, []);

  const save = () => {
    const toSave = draft || settings;
    localStorage.setItem('dayonetools_invoice_settings', JSON.stringify(toSave));
    setSettings(toSave);
    setDraft(null);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const cancel = () => { setDraft(null); setEditing(false); };
  const startEdit = () => { setDraft({ ...settings, customFields: [...settings.customFields.map(f => ({...f}))] }); setEditing(true); };
  const cur = draft || settings;
  const upd = (key, val) => setDraft(prev => ({ ...prev, [key]: val }));

  // Generate preview number
  const generatePreview = () => {
    const now = new Date();
    const yr = now.getFullYear().toString();
    const yr2 = yr.slice(2);
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const dy = String(now.getDate()).padStart(2, '0');
    const q = 'Q' + Math.ceil((now.getMonth() + 1) / 3);
    const wk = String(Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / 604800000)).padStart(2, '0');
    const moNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const moFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const seq = String(nextSeq).padStart(cur.sequenceLength, '0');
    const randChar = () => { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; return c[Math.floor(Math.random()*c.length)]; };
    const randStr = (n) => Array.from({length:n}, randChar).join('');
    const hexStr = (n) => Array.from({length:n}, () => '0123456789ABCDEF'[Math.floor(Math.random()*16)]).join('');

    if (cur.strategy === 'sequential') return `${cur.prefix}-${yr}-${seq}`;
    if (cur.strategy === 'random') return `${cur.prefix}-${yr}-${randStr(6)}`;
    if (cur.strategy === 'timestamp') return `${cur.prefix}-${yr}${mo}${dy}-${randStr(4)}`;
    if (cur.strategy === 'custom') {
      let p = cur.customPattern;
      p = p.replace(/\{prefix\}/g, cur.prefix);
      p = p.replace(/\{org\}/g, 'ORG');
      p = p.replace(/\{year\}/g, yr);
      p = p.replace(/\{year2\}/g, yr2);
      p = p.replace(/\{month\}/g, mo);
      p = p.replace(/\{day\}/g, dy);
      p = p.replace(/\{quarter\}/g, q);
      p = p.replace(/\{week\}/g, wk);
      p = p.replace(/\{monthName\}/g, moNames[now.getMonth()]);
      p = p.replace(/\{monthNameFull\}/g, moFull[now.getMonth()]);
      p = p.replace(/\{dayOfWeek\}/g, dayNames[now.getDay()]);
      p = p.replace(/\{timestamp\}/g, `${yr}${mo}${dy}`);
      p = p.replace(/\{seq:(\d+)\}/g, (_, n) => String(nextSeq).padStart(parseInt(n), '0'));
      p = p.replace(/\{random:(\d+)\}/g, (_, n) => randStr(parseInt(n)));
      p = p.replace(/\{uuid:(\d+)\}/g, (_, n) => randStr(parseInt(n)));
      p = p.replace(/\{hex:(\d+)\}/g, (_, n) => hexStr(parseInt(n)));
      return p;
    }
    return `${cur.prefix}-${yr}-${seq}`;
  };

  const iS = { width: '100%', padding: '10px 14px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text, fontSize: '14px', fontFamily: "'Inter',sans-serif", outline: 'none' };
  const lS = { display: 'block', fontSize: '13px', fontWeight: '600', color: colors.text, marginBottom: '6px' };
  const hS = { fontSize: '12px', color: colors.textMuted, marginTop: '4px' };
  const secS = { background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '24px', marginBottom: '24px' };

  const strategies = [
    { value: 'sequential', label: 'Sequential', desc: 'INV-2025-0001, INV-2025-0002...' },
    { value: 'random', label: 'Secure Random', desc: 'INV-2025-A7K9M2, INV-2025-X3F8P1...' },
    { value: 'timestamp', label: 'Timestamp', desc: 'INV-20250910-X4Y7, INV-20250910-P9K2...' },
    { value: 'custom', label: 'Custom Pattern', desc: 'Use custom placeholders' },
  ];

  const dateFormats = [
    { value: 'Month DD, YYYY', ex: 'December 01, 2025' },
    { value: 'DD/MM/YYYY', ex: '01/12/2025' },
    { value: 'MM/DD/YYYY', ex: '12/01/2025' },
    { value: 'DD-MM-YYYY', ex: '01-12-2025' },
    { value: 'YYYY-MM-DD', ex: '2025-12-01' },
  ];

  const templates = [
    { value: 'standard', label: 'Standard', desc: 'Balanced default design with clean layout' },
    { value: 'bold', label: 'Bold Professional', desc: 'Strong dark header with emphasis' },
    { value: 'mono', label: 'Mono', desc: 'Clean, minimal monospace design' },
    { value: 'startup', label: 'Startup Modern', desc: 'Modern and sleek contemporary style' },
  ];

  const languages = [
    { value: 'english', label: 'English' }, { value: 'german', label: 'Deutsch' },
    { value: 'french', label: 'Français' }, { value: 'spanish', label: 'Español' },
    { value: 'portuguese', label: 'Português' }, { value: 'italian', label: 'Italiano' },
    { value: 'arabic', label: 'العربية' }, { value: 'chinese', label: '中文' },
    { value: 'japanese', label: '日本語' }, { value: 'korean', label: '한국어' },
    { value: 'turkish', label: 'Türkçe' }, { value: 'azerbaijani', label: 'Azərbaycan dili' },
  ];

  const addCustomField = () => {
    upd('customFields', [...cur.customFields, { id: Date.now(), label: '', value: '' }]);
  };

  const updateField = (id, key, val) => {
    upd('customFields', cur.customFields.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const removeField = (id) => {
    upd('customFields', cur.customFields.filter(f => f.id !== id));
  };

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '600', color: colors.text, margin: 0 }}>Invoice Settings</h1>
            <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>Configure how invoice numbers are generated for your organization</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!editing ? (
            <button onClick={startEdit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: colors.green, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
              ✏️ Edit Settings
            </button>
          ) : (
            <>
              <button onClick={save} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: colors.green, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                💾 Save Invoice Settings
              </button>
              <button onClick={cancel} style={{ padding: '10px 20px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text, fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success toast */}
      {saved && (
        <div style={{ padding: '12px 20px', background: `${colors.green}20`, border: `1px solid ${colors.green}40`, borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: colors.green, fontSize: '14px' }}>✓ Invoice settings saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '28px', background: colors.bgCard, borderRadius: '8px', border: `1px solid ${colors.border}`, overflow: 'hidden', maxWidth: '500px' }}>
        {[{ id: 'numbers', label: '# Invoice Numbers', icon: '#' }, { id: 'content', label: '📄 Default Content', icon: '📄' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, padding: '12px 20px', background: activeTab === t.id ? colors.accent : 'transparent', color: activeTab === t.id ? '#fff' : colors.textMuted, border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Invoice Numbers */}
      {activeTab === 'numbers' && (
        <div style={secS}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: '0 0 4px 0' }}># Invoice Number Generation</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Configure how invoice numbers are automatically generated</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Strategy */}
            <div>
              <label style={lS}># Generation Strategy</label>
              {editing ? (
                <select value={cur.strategy} onChange={e => upd('strategy', e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                  {strategies.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              ) : (
                <div style={{ ...iS, background: colors.bgInput, opacity: 0.8, minHeight: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div>{strategies.find(s => s.value === cur.strategy)?.label || 'Sequential'}</div>
                  <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{strategies.find(s => s.value === cur.strategy)?.desc}</div>
                </div>
              )}
              <p style={hS}>Choose how invoice numbers are generated.</p>
            </div>

            {/* Prefix */}
            <div>
              <label style={lS}># Prefix</label>
              <input style={iS} value={cur.prefix} onChange={e => upd('prefix', e.target.value.toUpperCase().slice(0, 10))} disabled={!editing} maxLength={10} placeholder="INV" />
              <p style={hS}>Prefix for all invoice numbers (3-10 characters).</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: cur.strategy === 'custom' ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Sequence Length */}
            <div>
              <label style={lS}># Sequence Length</label>
              <input type="number" min={4} max={10} style={iS} value={cur.sequenceLength} onChange={e => upd('sequenceLength', Math.min(10, Math.max(4, parseInt(e.target.value) || 4)))} disabled={!editing} />
              <p style={hS}>Number of digits for sequence padding (4-10).</p>
            </div>

            {/* Custom Pattern (only when strategy is custom) */}
            {cur.strategy === 'custom' && (
              <div>
                <label style={lS}># Custom Pattern <span style={{ cursor: 'help', opacity: 0.6 }} title="Use placeholders: {prefix}, {year}, {year2}, {month}, {day}, {quarter}, {week}, {monthName}, {seq:N}, {random:N}, {hex:N}, {uuid:N}">ⓘ</span></label>
                <input style={{ ...iS, borderColor: colors.green }} value={cur.customPattern} onChange={e => upd('customPattern', e.target.value)} disabled={!editing} placeholder="{prefix}-{year}-{seq:4}" />
                <p style={hS}>Define a custom pattern using placeholders.</p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div style={{ background: colors.bgCard2, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px', marginTop: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: colors.textMuted, marginBottom: '8px' }}>👁 Preview</div>
            <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '4px' }}>Next invoice number:</div>
            <div style={{ display: 'inline-block', padding: '6px 14px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', color: colors.accent, letterSpacing: '0.5px' }}>
              {generatePreview()}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Default Content */}
      {activeTab === 'content' && (
        <div style={secS}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: '0 0 4px 0' }}>📄 Default Invoice Content</h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Set default values for new invoices</p>
          </div>

          {/* Terms */}
          <div style={{ marginBottom: '20px' }}>
            <label style={lS}>💰 Default Terms of Payment</label>
            <input style={iS} value={cur.defaultTerms} onChange={e => upd('defaultTerms', e.target.value)} disabled={!editing} placeholder="e.g. 30% advance, 70% before shipment" />
            <p style={hS}>Default payment terms for new invoices.</p>
          </div>

          {/* End Message */}
          <div style={{ marginBottom: '20px' }}>
            <label style={lS}>📝 Default End Message</label>
            <textarea style={{ ...iS, minHeight: '70px', resize: 'vertical' }} value={cur.defaultEndMessage} onChange={e => upd('defaultEndMessage', e.target.value)} disabled={!editing} placeholder="Thank you for your business!" />
            <p style={hS}>Default message to appear at the end of invoices.</p>
          </div>

          {/* Date Format */}
          <div style={{ marginBottom: '20px' }}>
            <label style={lS}>📅 Default Date Format</label>
            {editing ? (
              <select value={cur.defaultDateFormat} onChange={e => upd('defaultDateFormat', e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                {dateFormats.map(f => <option key={f.value} value={f.value}>{f.value} — {f.ex}</option>)}
              </select>
            ) : (
              <div style={{ ...iS, opacity: 0.8, minHeight: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div>{cur.defaultDateFormat}</div>
                <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{dateFormats.find(f => f.value === cur.defaultDateFormat)?.ex}</div>
              </div>
            )}
            <p style={hS}>Default date format for new invoices.</p>
          </div>

          {/* Template */}
          <div style={{ marginBottom: '20px' }}>
            <label style={lS}>📋 Default Invoice Template</label>
            {editing ? (
              <select value={cur.defaultTemplate} onChange={e => upd('defaultTemplate', e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                {templates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            ) : (
              <div style={{ ...iS, opacity: 0.8 }}>{templates.find(t => t.value === cur.defaultTemplate)?.label || 'Standard'}</div>
            )}
            <p style={hS}>Default template style for new invoices.</p>
          </div>

          {/* Language */}
          <div style={{ marginBottom: '24px' }}>
            <label style={lS}>🌐 Default Invoice Language</label>
            {editing ? (
              <select value={cur.defaultLanguage} onChange={e => upd('defaultLanguage', e.target.value)} style={{ ...iS, cursor: 'pointer' }}>
                {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            ) : (
              <div style={{ ...iS, opacity: 0.8 }}>{languages.find(l => l.value === cur.defaultLanguage)?.label || 'English'}</div>
            )}
            <p style={hS}>Language for PDF labels like "Bill To", "Invoice Date", "Total", etc.</p>
          </div>

          {/* Custom Fields */}
          <div>
            <label style={lS}>🏷️ Default Custom Fields</label>
            <p style={{ ...hS, marginTop: 0, marginBottom: '12px' }}>Custom fields that will be automatically added to new invoices.</p>
            
            {cur.customFields.map((f, i) => (
              <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 36px', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input style={iS} placeholder="Label" value={f.label} onChange={e => updateField(f.id, 'label', e.target.value)} disabled={!editing} />
                <input style={iS} placeholder="Value" value={f.value} onChange={e => updateField(f.id, 'value', e.target.value)} disabled={!editing} />
                {editing && (
                  <button onClick={() => removeField(f.id)} style={{ width: '36px', height: '36px', background: 'transparent', border: `1px solid ${colors.red}40`, borderRadius: '6px', color: colors.red, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                )}
              </div>
            ))}

            {editing && (
              <button onClick={addCustomField} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', border: `1px dashed ${colors.border}`, borderRadius: '6px', color: colors.accent, fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter',sans-serif", marginTop: '4px' }}>
                + Add Default Custom Field
              </button>
            )}

            {cur.customFields.length === 0 && !editing && (
              <div style={{ padding: '16px', background: colors.bgCard2, borderRadius: '8px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>No custom fields configured.</div>
            )}
          </div>
        </div>
      )}

      {/* Bottom action bar when editing */}
      {editing && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={save} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: colors.green, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
            💾 Save Invoice Settings
          </button>
          <button onClick={cancel} style={{ padding: '12px 24px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text, fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
