import React, { useState, useEffect } from 'react';
import { fetchProposals, createProposal, updateProposal, deleteProposal as deleteProposalApi } from '../supabaseService';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
const STATUS_OPTIONS = ['Client Review', 'Sold', 'Dead', 'Pending', 'Submitted', 'Negotiation'];

export default function DashboardProposals({ darkMode = true, user }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_submitted');
  const [sortOrder, setSortOrder] = useState('desc');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [form, setForm] = useState({
    proposalNumber: '', assignedTo: '', dateSubmitted: '', customer: '',
    address: '', city: '', state: '', service: '', proposalAmount: '',
    followUpDate: '', status: 'Client Review', contactName: '', contactPhone: '',
    contactEmail: '', notes: '',
  });

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Action menu
  const [actionMenuId, setActionMenuId] = useState(null);

  const colors = darkMode ? {
    bg: '#0d1117', bgCard: '#161b22', bgInput: '#21262d', text: '#e6edf3',
    textMuted: '#8b949e', border: '#30363d', accent: '#3b82f6', green: '#10b981',
    yellow: '#f59e0b', red: '#ef4444', orange: '#f97316',
  } : {
    bg: '#f1f5f9', bgCard: '#ffffff', bgInput: '#f8fafc', text: '#1f2937',
    textMuted: '#6b7280', border: '#e5e7eb', accent: '#3b82f6', green: '#10b981',
    yellow: '#f59e0b', red: '#ef4444', orange: '#f97316',
  };

  useEffect(() => {
    fetchProposals().then(data => { setProposals(data); setLoading(false); }).catch(e => { console.error('Error loading proposals:', e); setLoading(false); });
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.action-menu-container')) setActionMenuId(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Generate next proposal number
  const getNextProposalNumber = () => {
    const year = new Date().getFullYear();
    const prefix = `P-${year}-`;
    const existing = proposals.filter(p => p.proposalNumber.startsWith(prefix));
    const maxNum = existing.reduce((max, p) => {
      const num = parseInt(p.proposalNumber.replace(prefix, '')) || 0;
      return num > max ? num : max;
    }, 0);
    return `${prefix}${String(maxNum + 1).padStart(2, '0')}`;
  };

  const openCreateModal = () => {
    setEditingProposal(null);
    setForm({
      proposalNumber: getNextProposalNumber(), assignedTo: '', dateSubmitted: new Date().toISOString().split('T')[0],
      customer: '', address: '', city: '', state: '', service: '', proposalAmount: '',
      followUpDate: '', status: 'Client Review', contactName: '', contactPhone: '', contactEmail: '', notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (proposal) => {
    setEditingProposal(proposal);
    setForm({
      proposalNumber: proposal.proposalNumber, assignedTo: proposal.assignedTo, dateSubmitted: proposal.dateSubmitted,
      customer: proposal.customer, address: proposal.address, city: proposal.city, state: proposal.state,
      service: proposal.service, proposalAmount: proposal.proposalAmount || '', followUpDate: proposal.followUpDate,
      status: proposal.status, contactName: proposal.contactName, contactPhone: proposal.contactPhone,
      contactEmail: proposal.contactEmail, notes: proposal.notes,
    });
    setShowModal(true);
    setActionMenuId(null);
  };

  const handleSave = async () => {
    if (!form.proposalNumber.trim() || !form.customer.trim()) return;
    try {
      if (editingProposal) {
        const updated = await updateProposal(editingProposal.id, form, user.id);
        setProposals(prev => prev.map(p => p.id === editingProposal.id ? updated : p));
      } else {
        const created = await createProposal(form, user.id);
        setProposals(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (e) {
      console.error('Error saving proposal:', e);
      alert('Failed to save proposal.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProposalApi(id);
      setProposals(prev => prev.filter(p => p.id !== id));
      setConfirmDeleteId(null);
      setActionMenuId(null);
    } catch (e) {
      console.error('Error deleting proposal:', e);
    }
  };

  // Filter & sort
  const filtered = proposals.filter(p => {
    const query = search.toLowerCase();
    const matchesSearch = !query ||
      p.proposalNumber.toLowerCase().includes(query) ||
      p.customer.toLowerCase().includes(query) ||
      p.service.toLowerCase().includes(query) ||
      p.contactName.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.state.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'proposal_number': aVal = a.proposalNumber; bVal = b.proposalNumber; break;
      case 'customer': aVal = a.customer; bVal = b.customer; break;
      case 'amount': aVal = a.proposalAmount; bVal = b.proposalAmount; return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      case 'status': aVal = a.status; bVal = b.status; break;
      default: aVal = a.dateSubmitted || ''; bVal = b.dateSubmitted || '';
    }
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Client Review': { bg: `${colors.yellow}20`, color: colors.yellow },
      'Sold': { bg: `${colors.green}20`, color: colors.green },
      'Dead': { bg: `${colors.red}20`, color: colors.red },
      'Pending': { bg: `${colors.orange}20`, color: colors.orange },
      'Submitted': { bg: `${colors.accent}20`, color: colors.accent },
      'Negotiation': { bg: '#8b5cf620', color: '#8b5cf6' },
    };
    return styles[status] || { bg: `${colors.textMuted}20`, color: colors.textMuted };
  };

  // Stats
  const totalAmount = proposals.reduce((sum, p) => sum + (p.proposalAmount || 0), 0);
  const soldAmount = proposals.filter(p => p.status === 'Sold').reduce((sum, p) => sum + (p.proposalAmount || 0), 0);
  const activeCount = proposals.filter(p => !['Dead', 'Sold'].includes(p.status)).length;

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: colors.bgInput,
    border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text,
    fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: '600', color: colors.text, display: 'block', marginBottom: '6px',
  };

  if (loading) return <div style={{ padding: '24px', color: colors.textMuted }}>Loading proposals...</div>;

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: colors.text, margin: 0 }}>Proposal Log</h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>Track and manage your business proposals</p>
        </div>
        <button onClick={openCreateModal} style={{
          padding: '10px 18px', background: colors.green, color: '#fff', border: 'none',
          borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
        }}>+ New Proposal</button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Proposals', value: proposals.length, icon: '📋' },
          { label: 'Active', value: activeCount, icon: '🔄' },
          { label: 'Total Value', value: formatCurrency(totalAmount), icon: '💰' },
          { label: 'Sold Value', value: formatCurrency(soldAmount), icon: '✅' },
        ].map((stat, i) => (
          <div key={i} style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>{stat.icon} {stat.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: colors.text }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>Search</div>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search proposals..." style={{ ...inputStyle, padding: '8px 14px' }} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>Status</div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }}>
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>Sort by</div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }}>
            <option value="date_submitted">Date Submitted</option>
            <option value="proposal_number">Proposal #</option>
            <option value="customer">Customer</option>
            <option value="amount">Amount</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>Order</div>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }}>
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>Show</div>
          <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ ...inputStyle, padding: '8px 14px', cursor: 'pointer' }}>
            {[10, 25, 50].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 100px 100px 120px 110px 120px 1fr 40px',
          padding: '12px 16px', borderBottom: `1px solid ${colors.border}`,
          fontSize: '11px', fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          <div>📋 Proposal #</div>
          <div>👤 Customer</div>
          <div>📍 City</div>
          <div>🏛️ State</div>
          <div>💰 Amount</div>
          <div>📊 Status</div>
          <div>📅 Submitted</div>
          <div>🔧 Service</div>
          <div></div>
        </div>

        {/* Table Rows */}
        {paginated.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: colors.textMuted }}>
            {search || statusFilter !== 'all' ? 'No proposals match your filters.' : 'No proposals yet. Click "+ New Proposal" to get started.'}
          </div>
        ) : paginated.map(proposal => {
          const statusStyle = getStatusStyle(proposal.status);
          return (
            <div key={proposal.id} style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 100px 100px 120px 110px 120px 1fr 40px',
              padding: '14px 16px', borderBottom: `1px solid ${colors.border}`,
              alignItems: 'center', fontSize: '13px',
            }}>
              <div style={{ fontWeight: '600', color: colors.accent }}>{proposal.proposalNumber}</div>
              <div>
                <div style={{ fontWeight: '500', color: colors.text }}>{proposal.customer || '—'}</div>
                {proposal.contactName && <div style={{ fontSize: '11px', color: colors.textMuted }}>{proposal.contactName}</div>}
              </div>
              <div style={{ color: colors.textMuted }}>{proposal.city || '—'}</div>
              <div style={{ color: colors.textMuted }}>{proposal.state || '—'}</div>
              <div style={{ fontWeight: '600', color: colors.text }}>{formatCurrency(proposal.proposalAmount)}</div>
              <div>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                  fontWeight: '600', background: statusStyle.bg, color: statusStyle.color,
                }}>{proposal.status}</span>
              </div>
              <div style={{ color: colors.textMuted }}>{formatDate(proposal.dateSubmitted)}</div>
              <div style={{ color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proposal.service || '—'}</div>
              <div className="action-menu-container" style={{ position: 'relative' }}>
                <button onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === proposal.id ? null : proposal.id); }}
                  style={{ background: 'transparent', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '16px', padding: '4px' }}>⋯</button>
                {actionMenuId === proposal.id && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', background: colors.bgCard,
                    border: `1px solid ${colors.border}`, borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    zIndex: 100, minWidth: '140px', overflow: 'hidden',
                  }}>
                    <button onClick={() => openEditModal(proposal)} style={{
                      display: 'block', width: '100%', padding: '10px 16px', background: 'transparent',
                      border: 'none', color: colors.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                    }}>✏️ Edit</button>
                    <button onClick={() => { setConfirmDeleteId(proposal.id); setActionMenuId(null); }} style={{
                      display: 'block', width: '100%', padding: '10px 16px', background: 'transparent',
                      border: 'none', color: colors.red, fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                    }}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <div style={{ fontSize: '13px', color: colors.textMuted }}>
            Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              style={{ padding: '6px 12px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: currentPage === 1 ? colors.textMuted : colors.text, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}>← Prev</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              style={{ padding: '6px 12px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: currentPage === totalPages ? colors.textMuted : colors.text, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}>Next →</button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowModal(false)}>
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>{editingProposal ? 'Edit Proposal' : 'New Proposal'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: colors.textMuted, fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Row 1: Proposal #, Date, Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Proposal Number *</label>
                  <input value={form.proposalNumber} onChange={(e) => setForm({ ...form, proposalNumber: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Date Submitted</label>
                  <input type="date" value={form.dateSubmitted} onChange={(e) => setForm({ ...form, dateSubmitted: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Customer, Service */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Customer *</label>
                  <input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Company name" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Service</label>
                  <input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="e.g. Annual Inspection" style={inputStyle} />
                </div>
              </div>

              {/* Row 3: Address, City, State */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">—</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 4: Amount, Assigned To, Follow-up */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Proposal Amount ($)</label>
                  <input type="number" value={form.proposalAmount} onChange={(e) => setForm({ ...form, proposalAmount: e.target.value })} placeholder="0.00" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Assigned To</label>
                  <input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} placeholder="Team member" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Follow-up Date</label>
                  <input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* Client Contact Section */}
              <div style={{ padding: '16px', background: colors.bgInput, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: colors.text, marginBottom: '12px' }}>👤 Client Contact Info</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Name</label>
                    <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Phone</label>
                    <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px' }}>Email</label>
                    <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes, follow-up details..." rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={!form.proposalNumber.trim() || !form.customer.trim()} style={{
                padding: '10px 20px', background: (!form.proposalNumber.trim() || !form.customer.trim()) ? colors.bgInput : colors.green,
                border: 'none', borderRadius: '6px', color: (!form.proposalNumber.trim() || !form.customer.trim()) ? colors.textMuted : '#fff',
                fontSize: '14px', fontWeight: '500', cursor: (!form.proposalNumber.trim() || !form.customer.trim()) ? 'not-allowed' : 'pointer',
              }}>{editingProposal ? 'Save Changes' : 'Create Proposal'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setConfirmDeleteId(null)}>
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: '0 0 8px' }}>Delete Proposal</h3>
            <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '20px' }}>Are you sure? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ padding: '8px 16px', background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} style={{ padding: '8px 16px', background: colors.red, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
