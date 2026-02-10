import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchInvoices, updateInvoice as updateInvoiceDb, deleteInvoice as deleteInvoiceDb } from '../supabaseService';

export default function DashboardInvoices({ darkMode = true, user }) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showBulkStatus, setShowBulkStatus] = useState(false);
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState(null);

  const colors = darkMode ? {
    bg: '#0f1419', bgCard: '#161b22', bgCard2: '#1c2128', bgInput: '#21262d',
    text: '#e6edf3', textMuted: '#8b949e', border: '#30363d',
    accent: '#3b82f6', green: '#10b981', yellow: '#f59e0b', red: '#ef4444', orange: '#f97316',
  } : {
    bg: '#f1f5f9', bgCard: '#ffffff', bgCard2: '#f8fafc', bgInput: '#f8fafc',
    text: '#1f2937', textMuted: '#6b7280', border: '#e5e7eb',
    accent: '#3b82f6', green: '#10b981', yellow: '#f59e0b', red: '#ef4444', orange: '#f97316',
  };

  const sCfg = {
    draft:     { bg: colors.textMuted + '20', color: colors.textMuted, label: 'Draft',     dot: colors.textMuted, desc: 'Invoice is being prepared' },
    sent:      { bg: colors.accent + '20',    color: colors.accent,    label: 'Sent',      dot: colors.accent,    desc: 'Invoice has been sent to customer' },
    paid:      { bg: colors.green + '20',     color: colors.green,     label: 'Paid',      dot: colors.green,     desc: 'Payment has been received' },
    overdue:   { bg: colors.red + '20',       color: colors.red,       label: 'Overdue',   dot: colors.red,       desc: 'Payment is past due date' },
    cancelled: { bg: colors.orange + '20',    color: colors.orange,    label: 'Cancelled', dot: colors.orange,    desc: 'Invoice has been cancelled' },
  };
  const sOpts = Object.entries(sCfg).map(([v, c]) => ({ value: v, ...c }));

  // Load
  useEffect(() => {
    if (!user) return;
    fetchInvoices().then(data => setInvoices(data)).catch(e => console.error('Error loading invoices:', e));
  }, [user]);

  // Close dropdowns
  useEffect(() => {
    const h = (e) => { if (!e.target.closest('.ddc')) { setShowActionsMenu(null); setStatusDropdown(null); setShowStatusFilter(false); setShowDateFilter(false); setShowSortMenu(false); setShowBulkStatus(false); } };
    document.addEventListener('click', h); return () => document.removeEventListener('click', h);
  }, []);

  const save = (u) => { setInvoices(u); };

  // Status change with paidDate logic
  const chgStatus = async (id, ns) => {
    try {
      const updates = { status: ns };
      if (ns === 'paid') updates.paidDate = new Date().toISOString();
      await updateInvoiceDb(id, updates);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv));
    } catch (e) { console.error('Error updating status:', e); }
    setStatusDropdown(null);
  };

  const bulkChgStatus = async (ns) => {
    try {
      for (const id of selectedInvoices) {
        const updates = { status: ns };
        if (ns === 'paid') updates.paidDate = new Date().toISOString();
        await updateInvoiceDb(id, updates);
      }
      setInvoices(prev => prev.map(inv => {
        if (!selectedInvoices.includes(inv.id)) return inv;
        const c = { status: ns, updatedAt: new Date().toISOString() };
        if (ns === 'paid') c.paidDate = new Date().toISOString();
        return { ...inv, ...c };
      }));
    } catch (e) { console.error('Error bulk updating:', e); }
    setSelectedInvoices([]); setBulkStatusConfirm(null); setShowBulkStatus(false);
  };

  const delInv = async (id) => {
    try {
      await deleteInvoiceDb(id);
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (e) { console.error('Error deleting invoice:', e); }
    setDeleteModal(null); setShowActionsMenu(null);
  };
  const bulkDel = async () => {
    try {
      for (const id of selectedInvoices) await deleteInvoiceDb(id);
      setInvoices(prev => prev.filter(i => !selectedInvoices.includes(i.id)));
    } catch (e) { console.error('Error bulk deleting:', e); }
    setSelectedInvoices([]); setDeleteModal(null);
  };

  // Filtering
  const hasFilters = searchQuery || statusFilters.length > 0 || dateRange;
  const filtered = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    const ms = !q || (inv.invoiceNumber||'').toLowerCase().includes(q) || (inv.customerName||'').toLowerCase().includes(q) || (inv.customerEmail||'').toLowerCase().includes(q) || (inv.description||'').toLowerCase().includes(q);
    const mst = statusFilters.length === 0 || statusFilters.includes(inv.status || 'draft');
    let md = true;
    if (dateRange) {
      const d = new Date(inv.issueDate || inv.createdAt);
      if (dateRange.start) md = md && d >= new Date(dateRange.start);
      if (dateRange.end) { const e = new Date(dateRange.end); e.setHours(23,59,59,999); md = md && d <= e; }
    }
    return ms && mst && md;
  }).sort((a, b) => {
    let aV = a[sortBy] || '', bV = b[sortBy] || '';
    if (['createdAt','issueDate','dueDate'].includes(sortBy)) { aV = new Date(aV).getTime()||0; bV = new Date(bV).getTime()||0; return sortOrder==='asc'?aV-bV:bV-aV; }
    if (sortBy === 'total') { aV = parseFloat(aV)||0; bV = parseFloat(bV)||0; return sortOrder==='asc'?aV-bV:bV-aV; }
    aV = aV.toString().toLowerCase(); bV = bV.toString().toLowerCase(); return sortOrder==='asc'?aV.localeCompare(bV):bV.localeCompare(aV);
  });

  const tp = Math.ceil(filtered.length / itemsPerPage);
  const page = filtered.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilters, dateRange, sortBy, sortOrder]);

  const allSel = page.length > 0 && page.every(i => selectedInvoices.includes(i.id));
  const someSel = page.some(i => selectedInvoices.includes(i.id)) && !allSel;

  const applyPreset = (days, label) => { const e = new Date(), s = new Date(); s.setDate(s.getDate()-days); setDateRange({start:s.toISOString().split('T')[0],end:e.toISOString().split('T')[0],label}); setShowDateFilter(false); };
  const applyYear = () => { const n = new Date(); setDateRange({start:`${n.getFullYear()}-01-01`,end:n.toISOString().split('T')[0],label:'This Year'}); setShowDateFilter(false); };
  const applyCustom = () => { if(customDateStart&&customDateEnd){const f=d=>new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});setDateRange({start:customDateStart,end:customDateEnd,label:`${f(customDateStart)} - ${f(customDateEnd)}`});setShowDateFilter(false);} };
  const colSort = (c) => { if(sortBy===c) setSortOrder(p=>p==='asc'?'desc':'asc'); else{setSortBy(c);setSortOrder('asc');} };

  const SI = ({c}) => sortBy!==c ? <span style={{opacity:0.3,fontSize:'10px',marginLeft:'4px'}}>↕</span> : <span style={{fontSize:'10px',marginLeft:'4px',color:colors.accent}}>{sortOrder==='asc'?'↑':'↓'}</span>;
  const fmtC = (a, c='USD') => `${c} ${parseFloat(a||0).toFixed(2)}`;
  const fmtD = d => { if(!d) return '—'; return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); };
  const fmtDT = d => { if(!d) return '—'; const t=new Date(d); return `${t.toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})} ${t.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})}`; };

  const iS = {width:'100%',padding:'10px 14px',background:colors.bgInput,border:`1px solid ${colors.border}`,borderRadius:'8px',color:colors.text,fontSize:'14px',fontFamily:"'Inter',sans-serif",outline:'none'};
  const cS = {display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 10px',background:colors.bgInput,border:`1px solid ${colors.border}`,borderRadius:'6px',fontSize:'12px',color:colors.text,fontFamily:"'Inter',sans-serif"};
  const fB = a => ({display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 16px',background:colors.bgInput,border:`1px solid ${a?colors.accent:colors.border}`,borderRadius:'8px',color:a?colors.accent:colors.textMuted,fontSize:'13px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"});

  // StatusBadge component
  const SB = ({s, id}) => {
    const c = sCfg[s] || sCfg.draft;
    return (
      <div className="ddc" style={{position:'relative'}}>
        <button onClick={e=>{e.stopPropagation();setStatusDropdown(statusDropdown===id?null:id);setShowActionsMenu(null);}}
          style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 12px',background:c.bg,color:c.color,borderRadius:'4px',fontSize:'12px',fontWeight:'600',border:'none',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          <span style={{width:'7px',height:'7px',borderRadius:'50%',background:c.dot,flexShrink:0}}/>{c.label}
        </button>
        {statusDropdown===id&&(
          <div style={{position:'absolute',top:'100%',left:0,marginTop:'4px',background:colors.bgCard,border:`1px solid ${colors.border}`,borderRadius:'10px',boxShadow:'0 8px 30px rgba(0,0,0,0.35)',zIndex:1200,minWidth:'260px',padding:'6px 0'}}>
            {sOpts.map(o=>(
              <button key={o.value} onClick={e=>{e.stopPropagation();chgStatus(id,o.value);}}
                style={{display:'flex',alignItems:'center',gap:'12px',width:'100%',padding:'10px 16px',background:'transparent',border:'none',cursor:'pointer',textAlign:'left',fontFamily:"'Inter',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background=colors.bgInput} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{width:'9px',height:'9px',borderRadius:'50%',background:o.dot,flexShrink:0}}/>
                <div style={{flex:1}}><div style={{fontSize:'14px',fontWeight:'500',color:colors.text}}>{o.label}</div><div style={{fontSize:'11px',color:colors.textMuted,marginTop:'1px'}}>{o.desc}</div></div>
                {s===o.value&&<span style={{color:colors.green,fontSize:'16px'}}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{padding:'24px',fontFamily:"'Inter',sans-serif"}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:'600',color:colors.text,margin:0}}>Invoices</h1>
          <p style={{fontSize:'14px',color:colors.textMuted,marginTop:'4px'}}>Manage and track your invoices</p>
        </div>
        <button onClick={()=>navigate('/dashboard/create')} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',background:colors.accent,color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>+ Create Invoice</button>
      </div>

      {/* Search */}
      <div style={{marginBottom:'12px',position:'relative'}}>
        <span style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:colors.textMuted,fontSize:'14px'}}>🔍</span>
        <input type="text" placeholder="Search by invoice number, client name, or email..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{...iS,paddingLeft:'40px'}}/>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:'10px',marginBottom:'12px',flexWrap:'wrap'}}>
        {/* Status Multi */}
        <div className="ddc" style={{position:'relative'}}>
          <button onClick={e=>{e.stopPropagation();setShowStatusFilter(!showStatusFilter);setShowDateFilter(false);setShowSortMenu(false);}} style={fB(statusFilters.length>0)}>
            ✓ {statusFilters.length>0?`${statusFilters.length} Status${statusFilters.length>1?'es':''}`:'All Statuses'} ▾
          </button>
          {showStatusFilter&&(
            <div style={{position:'absolute',top:'100%',left:0,marginTop:'4px',background:colors.bgCard,border:`1px solid ${colors.border}`,borderRadius:'10px',boxShadow:'0 8px 30px rgba(0,0,0,0.3)',zIndex:1100,minWidth:'220px',padding:'6px 0'}}>
              {sOpts.map(o=>{const ck=statusFilters.includes(o.value);return(
                <button key={o.value} onClick={e=>{e.stopPropagation();setStatusFilters(p=>ck?p.filter(x=>x!==o.value):[...p,o.value]);}}
                  style={{display:'flex',alignItems:'center',gap:'10px',width:'100%',padding:'10px 16px',background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background=colors.bgInput} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{width:'16px',height:'16px',borderRadius:'3px',border:`2px solid ${ck?colors.accent:colors.border}`,background:ck?colors.accent:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#fff',flexShrink:0}}>{ck&&'✓'}</div>
                  <span style={{width:'8px',height:'8px',borderRadius:'50%',background:o.dot,flexShrink:0}}/>
                  <span style={{fontSize:'14px',color:colors.text}}>{o.label}</span>
                </button>
              );})}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="ddc" style={{position:'relative'}}>
          <button onClick={e=>{e.stopPropagation();setShowDateFilter(!showDateFilter);setShowStatusFilter(false);setShowSortMenu(false);}} style={fB(!!dateRange)}>
            📅 {dateRange?dateRange.label:'Pick a date'} {dateRange&&<span onClick={e=>{e.stopPropagation();setDateRange(null);}} style={{cursor:'pointer',opacity:0.7,fontSize:'14px'}}>×</span>} {!dateRange&&'▾'}
          </button>
          {showDateFilter&&(
            <div style={{position:'absolute',top:'100%',left:0,marginTop:'4px',background:colors.bgCard,border:`1px solid ${colors.border}`,borderRadius:'10px',boxShadow:'0 8px 30px rgba(0,0,0,0.3)',zIndex:1100,minWidth:'260px',padding:'6px 0'}}>
              {[{l:'Last 7 days',d:7},{l:'Last 30 days',d:30},{l:'Last 90 days',d:90}].map(p=>(
                <button key={p.l} onClick={e=>{e.stopPropagation();applyPreset(p.d,p.l);}} style={{display:'block',width:'100%',padding:'10px 16px',background:'transparent',border:'none',cursor:'pointer',fontSize:'14px',color:colors.text,textAlign:'left',fontFamily:"'Inter',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background=colors.bgInput} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{p.l}</button>
              ))}
              <button onClick={e=>{e.stopPropagation();applyYear();}} style={{display:'block',width:'100%',padding:'10px 16px',background:'transparent',border:'none',cursor:'pointer',fontSize:'14px',color:colors.text,textAlign:'left',fontFamily:"'Inter',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.background=colors.bgInput} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>This Year</button>
              <div style={{borderTop:`1px solid ${colors.border}`,margin:'6px 0'}}/>
              <div style={{padding:'10px 16px'}}>
                <div style={{fontSize:'12px',color:colors.textMuted,marginBottom:'8px',fontWeight:'500'}}>Custom Range</div>
                <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                  <input type="date" value={customDateStart} onChange={e=>setCustomDateStart(e.target.value)} style={{...iS,padding:'6px 8px',fontSize:'12px',flex:1}}/>
                  <input type="date" value={customDateEnd} onChange={e=>setCustomDateEnd(e.target.value)} style={{...iS,padding:'6px 8px',fontSize:'12px',flex:1}}/>
                </div>
                <button onClick={e=>{e.stopPropagation();applyCustom();}} style={{width:'100%',padding:'8px',background:colors.accent,color:'#fff',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>Apply</button>
              </div>
            </div>
          )}
        </div>

        {/* Sort & Display */}
        <div className="ddc" style={{position:'relative'}}>
          <button onClick={e=>{e.stopPropagation();setShowSortMenu(!showSortMenu);setShowStatusFilter(false);setShowDateFilter(false);}} style={fB(false)}>▽ Sort & Display ▾</button>
          {showSortMenu&&(
            <div style={{position:'absolute',top:'100%',left:0,marginTop:'4px',background:colors.bgCard,border:`1px solid ${colors.border}`,borderRadius:'10px',boxShadow:'0 8px 30px rgba(0,0,0,0.3)',zIndex:1100,minWidth:'240px',padding:'8px 0'}}>
              <div style={{padding:'6px 16px',fontSize:'11px',color:colors.textMuted,fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px'}}>Sort By</div>
              {[{v:'createdAt',l:'Created Date'},{v:'issueDate',l:'Issue Date'},{v:'customerName',l:'Client Name'},{v:'invoiceNumber',l:'Invoice #'},{v:'total',l:'Amount'},{v:'status',l:'Status'}].map(o=>(
                <button key={o.v} onClick={e=>{e.stopPropagation();setSortBy(o.v);}}
                  style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'8px 16px',background:'transparent',border:'none',cursor:'pointer',fontSize:'13px',color:sortBy===o.v?colors.accent:colors.text,fontFamily:"'Inter',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background=colors.bgInput} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  {o.l}{sortBy===o.v&&<span style={{color:colors.green}}>✓</span>}
                </button>
              ))}
              <div style={{borderTop:`1px solid ${colors.border}`,margin:'6px 0'}}/>
              <div style={{padding:'6px 16px',fontSize:'11px',color:colors.textMuted,fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px'}}>Order</div>
              {[{v:'asc',l:'Ascending (A→Z / Oldest)'},{v:'desc',l:'Descending (Z→A / Newest)'}].map(o=>(
                <button key={o.v} onClick={e=>{e.stopPropagation();setSortOrder(o.v);}}
                  style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'8px 16px',background:'transparent',border:'none',cursor:'pointer',fontSize:'13px',color:sortOrder===o.v?colors.accent:colors.text,fontFamily:"'Inter',sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background=colors.bgInput} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  {o.l}{sortOrder===o.v&&<span style={{color:colors.green}}>✓</span>}
                </button>
              ))}
              <div style={{borderTop:`1px solid ${colors.border}`,margin:'6px 0'}}/>
              <div style={{padding:'6px 16px',fontSize:'11px',color:colors.textMuted,fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px'}}>Per Page</div>
              <div style={{display:'flex',gap:'6px',padding:'6px 16px'}}>
                {[10,25,50,100].map(n=>(
                  <button key={n} onClick={e=>{e.stopPropagation();setItemsPerPage(n);setCurrentPage(1);}}
                    style={{padding:'4px 10px',borderRadius:'4px',fontSize:'12px',fontWeight:'500',border:`1px solid ${itemsPerPage===n?colors.accent:colors.border}`,background:itemsPerPage===n?colors.accent+'20':'transparent',color:itemsPerPage===n?colors.accent:colors.textMuted,cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>{n}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Chips */}
      {hasFilters&&(
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
          <span style={{fontSize:'12px',color:colors.textMuted,fontWeight:'500'}}>Active filters:</span>
          {searchQuery&&<span style={cS}>Search: {searchQuery}<span onClick={()=>setSearchQuery('')} style={{cursor:'pointer',opacity:0.7,fontSize:'14px'}}>×</span></span>}
          {statusFilters.map(s=><span key={s} style={cS}>Status: {sCfg[s]?.label||s}<span onClick={()=>setStatusFilters(p=>p.filter(x=>x!==s))} style={{cursor:'pointer',opacity:0.7,fontSize:'14px'}}>×</span></span>)}
          {dateRange&&<span style={cS}>Date: {dateRange.label}<span onClick={()=>setDateRange(null)} style={{cursor:'pointer',opacity:0.7,fontSize:'14px'}}>×</span></span>}
          <button onClick={()=>{setSearchQuery('');setStatusFilters([]);setDateRange(null);}} style={{background:'transparent',border:'none',color:colors.accent,fontSize:'12px',cursor:'pointer',fontFamily:"'Inter',sans-serif",fontWeight:'500'}}>Clear all</button>
        </div>
      )}

      {/* Bulk Bar */}
      {selectedInvoices.length>0&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 20px',background:colors.bgCard2,border:`1px solid ${colors.border}`,borderRadius:'8px 8px 0 0',borderBottom:'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <span style={{fontSize:'13px',fontWeight:'600',color:colors.text}}>{selectedInvoices.length} invoice{selectedInvoices.length!==1?'s':''} selected</span>
            <button onClick={()=>setSelectedInvoices([])} style={{background:'transparent',border:'none',color:colors.textMuted,fontSize:'13px',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>× Clear</button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div className="ddc" style={{position:'relative'}}>
              <button onClick={e=>{e.stopPropagation();setShowBulkStatus(!showBulkStatus);}}
                style={{display:'flex',alignItems:'center',gap:'6px',padding:'7px 14px',background:colors.bgInput,border:`1px solid ${colors.border}`,borderRadius:'6px',color:colors.text,fontSize:'13px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>
                ⊕ Change Status ▾
              </button>
              {showBulkStatus&&(
                <div style={{position:'absolute',top:'100%',right:0,marginTop:'4px',background:colors.bgCard,border:`1px solid ${colors.border}`,borderRadius:'10px',boxShadow:'0 8px 30px rgba(0,0,0,0.35)',zIndex:1200,minWidth:'220px',padding:'6px 0'}}>
                  {sOpts.map(o=>(
                    <button key={o.value} onClick={e=>{e.stopPropagation();setBulkStatusConfirm({status:o.value,count:selectedInvoices.length});setShowBulkStatus(false);}}
                      style={{display:'flex',alignItems:'center',gap:'10px',width:'100%',padding:'10px 16px',background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}
                      onMouseEnter={e=>e.currentTarget.style.background=colors.bgInput} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span style={{width:'8px',height:'8px',borderRadius:'50%',background:o.dot}}/><span style={{fontSize:'14px',color:colors.text}}>{o.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={()=>setDeleteModal({type:'bulk',count:selectedInvoices.length})}
              style={{display:'flex',alignItems:'center',gap:'6px',padding:'7px 14px',background:colors.red,color:'#fff',border:'none',borderRadius:'6px',fontSize:'13px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>🗑 Delete Selected</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{background:colors.bgCard,border:`1px solid ${colors.border}`,borderRadius:selectedInvoices.length>0?'0 0 8px 8px':'8px',overflow:'visible'}}>
        <div style={{display:'grid',gridTemplateColumns:'40px 1.4fr 2fr 1.1fr 1fr 1.1fr 1.3fr 50px',gap:'8px',padding:'12px 20px',borderBottom:`1px solid ${colors.border}`,background:colors.bgCard2}}>
          <div><input type="checkbox" checked={allSel} ref={el=>{if(el)el.indeterminate=someSel;}} onChange={e=>setSelectedInvoices(e.target.checked?page.map(i=>i.id):[])} style={{width:'16px',height:'16px',cursor:'pointer',accentColor:colors.accent}}/></div>
          {[{c:'invoiceNumber',l:'📄 Invoice #'},{c:'customerName',l:'👤 Client'},{c:'total',l:'$ Amount'},{c:'status',l:'⊘ Status'},{c:'issueDate',l:'📅 Issued Date'},{c:'createdAt',l:'🕐 Created'}].map(h=>(
            <div key={h.c} onClick={()=>colSort(h.c)} style={{fontSize:'12px',fontWeight:'600',color:colors.textMuted,textTransform:'uppercase',letterSpacing:'0.3px',cursor:'pointer',userSelect:'none',display:'flex',alignItems:'center'}}>{h.l}<SI c={h.c}/></div>
          ))}
          <div style={{fontSize:'12px',fontWeight:'600',color:colors.textMuted}}>⚙</div>
        </div>

        {filtered.length===0&&(
          <div style={{padding:'60px 20px',textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>📋</div>
            <div style={{fontSize:'16px',fontWeight:'500',color:colors.text,marginBottom:'6px'}}>{invoices.length===0?'No invoices yet':'No invoices match your filters'}</div>
            <div style={{fontSize:'14px',color:colors.textMuted,marginBottom:'20px'}}>{invoices.length===0?'Create your first invoice to get started.':'Try adjusting your search or filters.'}</div>
            {invoices.length===0&&<button onClick={()=>navigate('/dashboard/create')} style={{padding:'10px 24px',background:colors.accent,color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>+ Create Invoice</button>}
          </div>
        )}

        {page.map(inv=>(
          <div key={inv.id} style={{display:'grid',gridTemplateColumns:'40px 1.4fr 2fr 1.1fr 1fr 1.1fr 1.3fr 50px',gap:'8px',padding:'14px 20px',borderBottom:`1px solid ${colors.border}`,alignItems:'center',fontSize:'14px',color:colors.text,background:selectedInvoices.includes(inv.id)?colors.accent+'08':'transparent',transition:'background 0.1s'}}
            onMouseEnter={e=>{if(!selectedInvoices.includes(inv.id))e.currentTarget.style.background=colors.bgCard2;}} onMouseLeave={e=>{if(!selectedInvoices.includes(inv.id))e.currentTarget.style.background='transparent';}}>
            <div><input type="checkbox" checked={selectedInvoices.includes(inv.id)} onChange={()=>setSelectedInvoices(p=>p.includes(inv.id)?p.filter(x=>x!==inv.id):[...p,inv.id])} style={{width:'16px',height:'16px',cursor:'pointer',accentColor:colors.accent}}/></div>
            <div onClick={()=>navigate(`/dashboard/invoices/${inv.id}`)} style={{fontWeight:'500',color:colors.accent,fontSize:'13px',cursor:'pointer'}}>{inv.invoiceNumber||'—'}</div>
            <div onClick={()=>navigate(`/dashboard/invoices/${inv.id}`)} style={{cursor:'pointer'}}><div style={{fontWeight:'500',fontSize:'14px'}}>{inv.customerName||'—'}</div><div style={{fontSize:'12px',color:colors.textMuted}}>{inv.customerEmail||''}</div></div>
            <div style={{fontWeight:'600',fontSize:'14px'}}>{fmtC(inv.total,inv.currency)}</div>
            <div><SB s={inv.status||'draft'} id={inv.id}/></div>
            <div style={{color:colors.textMuted,fontSize:'13px'}}>{fmtD(inv.issueDate)}</div>
            <div style={{color:colors.textMuted,fontSize:'13px'}}>{fmtDT(inv.createdAt)}</div>
            <div className="ddc" style={{position:'relative'}}>
              <button onClick={e=>{e.stopPropagation();setShowActionsMenu(showActionsMenu===inv.id?null:inv.id);setStatusDropdown(null);}}
                style={{padding:'4px 8px',background:'transparent',border:'none',color:colors.textMuted,fontSize:'18px',cursor:'pointer',borderRadius:'4px',letterSpacing:'2px',lineHeight:1}}>···</button>
              {showActionsMenu===inv.id&&(
                <div style={{position:'absolute',right:0,top:'100%',marginTop:'4px',background:colors.bgCard,border:`1px solid ${colors.border}`,borderRadius:'8px',boxShadow:'0 4px 20px rgba(0,0,0,0.3)',zIndex:1000,minWidth:'150px',padding:'4px 0'}}>
                  {[{l:'👁 View',a:()=>{navigate(`/dashboard/invoices/${inv.id}`);setShowActionsMenu(null);}},{l:'✏️ Edit',a:()=>{navigate(`/dashboard/create?edit=${inv.id}`);setShowActionsMenu(null);}},{l:'📥 Download',a:()=>setShowActionsMenu(null)}].map((x,i)=>(
                    <button key={i} onClick={x.a} style={{display:'block',width:'100%',padding:'9px 16px',background:'transparent',border:'none',color:colors.text,fontSize:'13px',textAlign:'left',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}
                      onMouseEnter={e=>e.currentTarget.style.background=colors.bgInput} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{x.l}</button>
                  ))}
                  <div style={{borderTop:`1px solid ${colors.border}`,margin:'2px 0'}}/>
                  <button onClick={()=>{setDeleteModal({type:'single',invoiceId:inv.id});setShowActionsMenu(null);}}
                    style={{display:'block',width:'100%',padding:'9px 16px',background:'transparent',border:'none',color:colors.red,fontSize:'13px',textAlign:'left',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}
                    onMouseEnter={e=>e.currentTarget.style.background=colors.bgInput} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>🗑 Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Pagination */}
        {filtered.length>0&&(
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',borderTop:`1px solid ${colors.border}`}}>
            <div style={{fontSize:'13px',color:colors.textMuted}}>Showing {((currentPage-1)*itemsPerPage)+1}–{Math.min(currentPage*itemsPerPage,filtered.length)} of {filtered.length} invoices</div>
            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}
                style={{padding:'6px 12px',borderRadius:'6px',fontSize:'13px',fontWeight:'500',border:`1px solid ${colors.border}`,background:colors.bgInput,color:currentPage===1?colors.textMuted:colors.text,cursor:currentPage===1?'not-allowed':'pointer',opacity:currentPage===1?0.5:1,fontFamily:"'Inter',sans-serif"}}>← Prev</button>
              {Array.from({length:Math.min(tp,5)},(_,i)=>{let p;if(tp<=5)p=i+1;else if(currentPage<=3)p=i+1;else if(currentPage>=tp-2)p=tp-4+i;else p=currentPage-2+i;return(
                <button key={p} onClick={()=>setCurrentPage(p)}
                  style={{padding:'6px 10px',borderRadius:'6px',fontSize:'13px',fontWeight:'500',border:`1px solid ${p===currentPage?colors.accent:colors.border}`,background:p===currentPage?colors.accent+'20':'transparent',color:p===currentPage?colors.accent:colors.textMuted,cursor:'pointer',minWidth:'32px',fontFamily:"'Inter',sans-serif"}}>{p}</button>
              );})}
              <button disabled={currentPage===tp||tp===0} onClick={()=>setCurrentPage(p=>p+1)}
                style={{padding:'6px 12px',borderRadius:'6px',fontSize:'13px',fontWeight:'500',border:`1px solid ${colors.border}`,background:colors.bgInput,color:currentPage===tp?colors.textMuted:colors.text,cursor:currentPage===tp?'not-allowed':'pointer',opacity:currentPage===tp||tp===0?0.5:1,fontFamily:"'Inter',sans-serif"}}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={()=>setDeleteModal(null)}>
          <div style={{background:colors.bgCard,border:`1px solid ${colors.border}`,borderRadius:'12px',padding:'28px',maxWidth:'440px',width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:'0 0 12px 0',fontSize:'18px',fontWeight:'600',color:colors.text}}>{deleteModal.type==='bulk'?'Delete Selected Invoices':'Delete Invoice'}</h3>
            <p style={{fontSize:'14px',color:colors.textMuted,margin:'0 0 8px 0'}}>{deleteModal.type==='bulk'?`Are you sure you want to delete ${deleteModal.count} selected invoice${deleteModal.count!==1?'s':''}?`:'Are you sure you want to delete this invoice?'}</p>
            <div style={{background:colors.red+'15',border:`1px solid ${colors.red}30`,borderRadius:'8px',padding:'12px',marginBottom:'20px'}}><p style={{fontSize:'13px',color:colors.red,margin:0}}>⚠ This action is permanent and cannot be undone. All associated data will be removed.</p></div>
            <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
              <button onClick={()=>setDeleteModal(null)} style={{padding:'10px 20px',background:colors.bgInput,border:`1px solid ${colors.border}`,borderRadius:'8px',color:colors.text,fontSize:'14px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>Cancel</button>
              <button onClick={()=>deleteModal.type==='bulk'?bulkDel():delInv(deleteModal.invoiceId)} style={{padding:'10px 20px',background:colors.red,border:'none',borderRadius:'8px',color:'#fff',fontSize:'14px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Modal */}
      {bulkStatusConfirm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={()=>setBulkStatusConfirm(null)}>
          <div style={{background:colors.bgCard,border:`1px solid ${colors.border}`,borderRadius:'12px',padding:'28px',maxWidth:'440px',width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{margin:'0 0 12px 0',fontSize:'18px',fontWeight:'600',color:colors.text}}>Change Status</h3>
            <p style={{fontSize:'14px',color:colors.textMuted,margin:'0 0 6px 0'}}>Change {bulkStatusConfirm.count} invoice{bulkStatusConfirm.count!==1?'s':''} to <span style={{color:sCfg[bulkStatusConfirm.status]?.color,fontWeight:'600'}}>{sCfg[bulkStatusConfirm.status]?.label}</span>?</p>
            {bulkStatusConfirm.status==='paid'&&(
              <div style={{background:colors.accent+'15',border:`1px solid ${colors.accent}30`,borderRadius:'8px',padding:'10px',marginTop:'10px',marginBottom:'6px'}}><p style={{fontSize:'12px',color:colors.accent,margin:0}}>ℹ The paid date will be automatically set to the current time for all selected invoices.</p></div>
            )}
            <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'20px'}}>
              <button onClick={()=>setBulkStatusConfirm(null)} style={{padding:'10px 20px',background:colors.bgInput,border:`1px solid ${colors.border}`,borderRadius:'8px',color:colors.text,fontSize:'14px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>Cancel</button>
              <button onClick={()=>bulkChgStatus(bulkStatusConfirm.status)} style={{padding:'10px 20px',background:colors.accent,border:'none',borderRadius:'8px',color:'#fff',fontSize:'14px',fontWeight:'500',cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
