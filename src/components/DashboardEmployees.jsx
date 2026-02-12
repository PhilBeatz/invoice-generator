import React, { useState, useEffect, useCallback } from 'react';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee as deleteEmployeeApi, fetchInvoices } from '../supabaseService';

function getUserId() {
  try {
    var authKeys = Object.keys(localStorage).filter(function(k) { return k.startsWith('sb-') && k.endsWith('-auth-token'); });
    if (authKeys.length === 0) return null;
    var session = JSON.parse(localStorage.getItem(authKeys[0]) || '{}');
    return session.user?.id || null;
  } catch(e) { return null; }
}

function nextEmployeeId(employees) {
  var ids = employees.map(function(e) { var m = (e.employeeId || '').match(/(\d+)/); return m ? parseInt(m[1]) : 0; });
  var max = ids.length > 0 ? Math.max.apply(null, ids) : 0;
  return 'EMP' + String(max + 1).padStart(3, '0');
}

function Modal({ open, onClose, children, title, subtitle }) {
  if (!open) return null;
  return React.createElement('div', { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', padding: '16px' }, onClick: onClose },
    React.createElement('div', { style: { background: '#161b22', borderRadius: '10px', border: '1px solid #30363d', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }, onClick: function(e) { e.stopPropagation(); } },
      React.createElement('div', { style: { padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
        React.createElement('div', null,
          React.createElement('h2', { style: { fontSize: '18px', fontWeight: '700', color: '#e6edf3', margin: 0 } }, title),
          subtitle && React.createElement('p', { style: { fontSize: '13px', color: '#8b949e', marginTop: '4px' } }, subtitle)
        ),
        React.createElement('button', { onClick: onClose, style: { background: 'none', border: 'none', color: '#8b949e', fontSize: '20px', cursor: 'pointer', padding: '4px', lineHeight: 1 } }, '\u2715')
      ),
      React.createElement('div', { style: { padding: '16px 24px 24px' } }, children)
    )
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, confirmColor }) {
  if (!open) return null;
  return React.createElement('div', { style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', padding: '16px' }, onClick: onClose },
    React.createElement('div', { style: { background: '#161b22', borderRadius: '10px', border: '1px solid #30363d', padding: '24px', maxWidth: '420px', width: '100%' }, onClick: function(e) { e.stopPropagation(); } },
      React.createElement('h3', { style: { fontSize: '16px', fontWeight: '700', color: '#e6edf3', margin: '0 0 8px' } }, title),
      React.createElement('p', { style: { fontSize: '14px', color: '#8b949e', marginBottom: '20px', lineHeight: 1.5 } }, message),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
        React.createElement('button', { onClick: onClose, style: { padding: '8px 16px', background: '#21262d', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', fontSize: '13px', fontWeight: '500', cursor: 'pointer' } }, 'Cancel'),
        React.createElement('button', { onClick: onConfirm, style: { padding: '8px 16px', background: confirmColor || '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' } }, confirmLabel || 'Delete')
      )
    )
  );
}

var PER_PAGE = 10;
var DEFAULT_DEPTS = ['Sales', 'Marketing', 'Engineering', 'Design', 'Finance', 'Support', 'Human Resources', 'Product'];

export default function DashboardEmployees({ darkMode }) {
  var [employees, setEmployees] = useState([]);
  var [invoices, setInvoices] = useState([]);
  var [search, setSearch] = useState('');
  var [filterDept, setFilterDept] = useState('all');
  var [filterStatus, setFilterStatus] = useState('all');
  var [sortBy, setSortBy] = useState('name');
  var [sortOrder, setSortOrder] = useState('asc');
  var [page, setPage] = useState(1);
  var [isMobile, setIsMobile] = useState(false);
  var [showModal, setShowModal] = useState(false);
  var [editingEmp, setEditingEmp] = useState(null);
  var [showDetail, setShowDetail] = useState(null);
  var [delConfirm, setDelConfirm] = useState(null);
  var [form, setForm] = useState({ employeeId: '', fullName: '', email: '', phone: '', position: '', department: '', customDept: '', hireDate: '', status: 'active' });
  var [errors, setErrors] = useState({});

  useEffect(function() { var ck = function() { setIsMobile(window.innerWidth <= 768); }; ck(); window.addEventListener('resize', ck); return function() { window.removeEventListener('resize', ck); }; }, []);

  var loadData = useCallback(function() {
    fetchEmployees().then(function(data) { setEmployees(data); }).catch(function(e) { console.error('Error loading employees:', e); });
    fetchInvoices().then(function(data) { setInvoices(data); }).catch(function(e) { console.error('Error loading invoices:', e); });
  }, []);
  useEffect(function() { loadData(); }, [loadData]);

  var allDepts = Array.from(new Set(DEFAULT_DEPTS.concat(employees.map(function(e) { return e.department; }).filter(Boolean)))).sort();
  var invCount = function(id) { return invoices.filter(function(i) { return i.employeeId === id || i.assignedEmployee === id; }).length; };

  var filtered = employees.filter(function(e) {
    if (search) { var q = search.toLowerCase(); if (![e.fullName, e.employeeId, e.email, e.phone, e.position, e.department].some(function(f) { return (f||'').toLowerCase().includes(q); })) return false; }
    if (filterDept !== 'all' && e.department !== filterDept) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  }).sort(function(a, b) {
    var f = { name: 'fullName', id: 'employeeId', department: 'department', position: 'position', hireDate: 'hireDate' }[sortBy] || 'fullName';
    var vA = (a[f]||'').toLowerCase(), vB = (b[f]||'').toLowerCase();
    return vA < vB ? (sortOrder==='asc'?-1:1) : vA > vB ? (sortOrder==='asc'?1:-1) : 0;
  });

  var totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  var paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  useEffect(function() { setPage(1); }, [search, filterDept, filterStatus, sortBy, sortOrder]);

  var openCreate = function() { setEditingEmp(null); setForm({ employeeId: nextEmployeeId(employees), fullName: '', email: '', phone: '', position: '', department: '', customDept: '', hireDate: '', status: 'active' }); setErrors({}); setShowModal(true); };
  var openEdit = function(emp) {
    setEditingEmp(emp);
    var isCust = emp.department && !DEFAULT_DEPTS.includes(emp.department);
    setForm({ employeeId: emp.employeeId||'', fullName: emp.fullName||'', email: emp.email||'', phone: emp.phone||'', position: emp.position||'', department: isCust ? '__custom__' : (emp.department||''), customDept: isCust ? emp.department : '', hireDate: emp.hireDate||'', status: emp.status||'active' });
    setErrors({}); setShowModal(true);
  };

  var validate = function() {
    var er = {};
    if (!form.employeeId.trim()) er.employeeId = 'Employee ID is required';
    else if (!editingEmp && employees.some(function(e) { return e.employeeId === form.employeeId.trim(); })) er.employeeId = 'Employee ID already exists';
    if (!form.fullName.trim()) er.fullName = 'Full name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Invalid email';
    setErrors(er); return Object.keys(er).length === 0;
  };

  var handleSave = async function() {
    if (!validate()) return;
    var dept = form.department === '__custom__' ? form.customDept.trim() : form.department;
    var d = { employeeId: form.employeeId.trim(), fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), position: form.position.trim(), department: dept, hireDate: form.hireDate, status: form.status };
    var userId = getUserId();
    try {
      if (editingEmp) {
        var updated = await updateEmployee(editingEmp.id, d, userId);
        setEmployees(function(prev) { return prev.map(function(e) { return e.id === editingEmp.id ? updated : e; }); });
        if (showDetail && showDetail.id === editingEmp.id) setShowDetail(updated);
      } else {
        var created = await createEmployee(d, userId);
        setEmployees(function(prev) { return prev.concat([created]); });
      }
    } catch(e) { alert('Error saving employee: ' + e.message); }
    setShowModal(false);
  };

  var handleDel = function(emp) { setDelConfirm({ employee: emp, hasInv: invCount(emp.employeeId) > 0 }); };
  var confirmDel = async function() {
    if (!delConfirm) return;
    var userId = getUserId();
    try {
      if (delConfirm.hasInv) {
        var updated = await updateEmployee(delConfirm.employee.id, { status: 'inactive' }, userId);
        setEmployees(function(prev) { return prev.map(function(e) { return e.id === delConfirm.employee.id ? updated : e; }); });
        if (showDetail && showDetail.id === delConfirm.employee.id) setShowDetail(updated);
      } else {
        await deleteEmployeeApi(delConfirm.employee.id);
        setEmployees(function(prev) { return prev.filter(function(e) { return e.id !== delConfirm.employee.id; }); });
        if (showDetail && showDetail.id === delConfirm.employee.id) setShowDetail(null);
      }
    } catch(e) { alert('Error: ' + e.message); }
    setDelConfirm(null);
  };

  var C = { bg: '#0d1117', bgCard: '#161b22', bgIn: '#0d1117', text: '#e6edf3', tm: '#8b949e', bdr: '#30363d', acc: '#3b82f6', grn: '#10b981', red: '#ef4444', yel: '#f59e0b' };
  var inpS = { width: '100%', padding: '9px 12px', background: C.bgIn, border: '1px solid '+C.bdr, borderRadius: '6px', color: C.text, fontSize: '13px', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' };
  var selS = Object.assign({}, inpS, { cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px', paddingRight: '32px' });
  var lblS = { fontSize: '12px', fontWeight: '600', color: C.tm, marginBottom: '4px', display: 'block' };

  var renderForm = function() {
    return React.createElement('div', null,
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' } },
        React.createElement('div', null, React.createElement('label', { style: lblS }, '# Employee ID *'), React.createElement('input', { style: Object.assign({}, inpS, errors.employeeId ? {borderColor:C.red} : {}), value: form.employeeId, onChange: function(e){setForm(Object.assign({},form,{employeeId:e.target.value}));}, placeholder: 'EMP001', maxLength: 50 }), errors.employeeId && React.createElement('span', { style: { fontSize: '11px', color: C.red } }, errors.employeeId)),
        React.createElement('div', null, React.createElement('label', { style: lblS }, '\uD83D\uDC64 Full Name *'), React.createElement('input', { style: Object.assign({}, inpS, errors.fullName ? {borderColor:C.red} : {}), value: form.fullName, onChange: function(e){setForm(Object.assign({},form,{fullName:e.target.value}));}, placeholder: 'John Doe', maxLength: 100 }), errors.fullName && React.createElement('span', { style: { fontSize: '11px', color: C.red } }, errors.fullName))
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' } },
        React.createElement('div', null, React.createElement('label', { style: lblS }, '\u2709 Email'), React.createElement('input', { style: Object.assign({}, inpS, errors.email ? {borderColor:C.red} : {}), value: form.email, onChange: function(e){setForm(Object.assign({},form,{email:e.target.value}));}, placeholder: 'john@company.com', type: 'email' }), errors.email && React.createElement('span', { style: { fontSize: '11px', color: C.red } }, errors.email)),
        React.createElement('div', null, React.createElement('label', { style: lblS }, '\uD83D\uDCDE Phone'), React.createElement('input', { style: inpS, value: form.phone, onChange: function(e){setForm(Object.assign({},form,{phone:e.target.value}));}, placeholder: '+1 (555) 123-4567', maxLength: 50 }))
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' } },
        React.createElement('div', null, React.createElement('label', { style: lblS }, '\uD83C\uDFE2 Position'), React.createElement('input', { style: inpS, value: form.position, onChange: function(e){setForm(Object.assign({},form,{position:e.target.value}));}, placeholder: 'e.g., Sales Manager', maxLength: 100 })),
        React.createElement('div', null, React.createElement('label', { style: lblS }, '\uD83C\uDFDB Department'),
          React.createElement('select', { style: selS, value: form.department, onChange: function(e){setForm(Object.assign({},form,{department:e.target.value}));} },
            React.createElement('option', { value: '' }, 'Select department'),
            allDepts.map(function(d){ return React.createElement('option', { key: d, value: d }, d); }),
            React.createElement('option', { value: '__custom__' }, 'Custom Department...')
          ),
          form.department === '__custom__' && React.createElement('input', { style: Object.assign({}, inpS, {marginTop:'6px'}), value: form.customDept, onChange: function(e){setForm(Object.assign({},form,{customDept:e.target.value}));}, placeholder: 'Enter department name' })
        )
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' } },
        React.createElement('div', null, React.createElement('label', { style: lblS }, '\uD83D\uDCC5 Hire Date'), React.createElement('input', { type: 'date', style: inpS, value: form.hireDate, onChange: function(e){setForm(Object.assign({},form,{hireDate:e.target.value}));} })),
        editingEmp && React.createElement('div', null, React.createElement('label', { style: lblS }, 'Status'), React.createElement('select', { style: selS, value: form.status, onChange: function(e){setForm(Object.assign({},form,{status:e.target.value}));} }, React.createElement('option', {value:'active'}, 'Active'), React.createElement('option', {value:'inactive'}, 'Inactive')))
      ),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
        React.createElement('button', { onClick: handleSave, style: { padding: '9px 20px', background: C.grn, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' } }, editingEmp ? 'Save Changes' : 'Save Employee')
      )
    );
  };

  // Detail View
  if (showDetail) {
    var emp = showDetail;
    var eInv = invoices.filter(function(i){ return i.employeeId===emp.employeeId||i.assignedEmployee===emp.employeeId; });
    var totRev = eInv.reduce(function(s,i){ return s+(parseFloat(i.total)||0); }, 0);
    var paidInv = eInv.filter(function(i){ return i.status==='paid'; });
    var paidRev = paidInv.reduce(function(s,i){ return s+(parseFloat(i.total)||0); }, 0);
    var now = new Date();
    var curMo = now.toLocaleString('default',{month:'long',year:'numeric'});
    var moInv = eInv.filter(function(i){ var d=new Date(i.createdAt||i.issueDate); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear(); });

    return React.createElement('div', { style: { padding: isMobile?'16px':'24px', fontFamily: "'Inter',sans-serif" } },
      React.createElement('div', { style: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'10px' } },
        React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'12px' } },
          React.createElement('button', { onClick: function(){ setShowDetail(null); }, style: { background:'none', border:'none', color:C.acc, fontSize:'13px', fontWeight:'500', cursor:'pointer', padding:0 } }, '\u2190 Back'),
          React.createElement('h1', { style: { fontSize:'20px', fontWeight:'700', color:C.text, margin:0 } }, emp.fullName)
        ),
        React.createElement('div', { style: { display:'flex', gap:'8px' } },
          React.createElement('button', { onClick: function(){ openEdit(emp); }, style: { padding:'7px 14px', background:C.acc, border:'none', borderRadius:'6px', color:'#fff', fontSize:'12px', fontWeight:'600', cursor:'pointer' } }, '\u270E Edit'),
          React.createElement('button', { onClick: function(){ handleDel(emp); }, style: { padding:'7px 14px', background:C.red, border:'none', borderRadius:'6px', color:'#fff', fontSize:'12px', fontWeight:'600', cursor:'pointer' } }, '\uD83D\uDDD1 Delete')
        )
      ),
      React.createElement('div', { style: { display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 280px', gap:'16px' } },
        React.createElement('div', null,
          React.createElement('div', { style: { background:C.bgCard, borderRadius:'8px', border:'1px solid '+C.bdr, padding:'20px', marginBottom:'16px' } },
            React.createElement('h3', { style: { fontSize:'14px', fontWeight:'600', color:C.text, margin:'0 0 16px' } }, '\uD83D\uDC64 Employee Details'),
            React.createElement('div', { style: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' } },
              [{l:'Name',v:emp.fullName},{l:'Employee ID',v:'# '+emp.employeeId},{l:'Email',v:emp.email||'\u2014'},{l:'Phone',v:emp.phone||'\u2014'},{l:'Position',v:emp.position||'\u2014'},{l:'Department',v:emp.department||'\u2014'},{l:'Status',v:emp.status==='active'?'Active':'Inactive',s:true},{l:'Created',v:emp.createdAt?new Date(emp.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):'\u2014'}].map(function(f,i){
                return React.createElement('div', { key: i },
                  React.createElement('div', { style: { fontSize:'11px', color:C.tm, fontWeight:'600', marginBottom:'4px' } }, f.l),
                  f.s ? React.createElement('span', { style: { padding:'2px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'600', color: emp.status==='active'?C.grn:C.tm, background: emp.status==='active'?C.grn+'18':C.tm+'18' } }, f.v) : React.createElement('div', { style: { fontSize:'14px', color:C.text } }, f.v)
                );
              })
            )
          ),
          React.createElement('div', { style: { background:C.bgCard, borderRadius:'8px', border:'1px solid '+C.bdr, padding:'20px' } },
            React.createElement('h3', { style: { fontSize:'14px', fontWeight:'600', color:C.text, margin:'0 0 12px' } }, '\uD83D\uDCC4 Assigned Invoices'),
            React.createElement('div', { style: { fontSize:'12px', color:C.tm, marginBottom:'12px' } }, 'Showing '+eInv.length+' invoices'),
            eInv.length > 0 ?
              React.createElement('div', { style: { overflowX:'auto' } },
                React.createElement('table', { style: { width:'100%', borderCollapse:'collapse', fontSize:'12px' } },
                  React.createElement('thead', null, React.createElement('tr', { style: { borderBottom:'1px solid '+C.bdr } },
                    ['Invoice #','Customer','Amount','Status','Issued'].map(function(h){ return React.createElement('th', { key:h, style: { padding:'8px 10px', textAlign:'left', color:C.tm, fontWeight:'600', whiteSpace:'nowrap' } }, h); })
                  )),
                  React.createElement('tbody', null, eInv.slice(0,10).map(function(inv,i){
                    var sc = inv.status==='paid'?C.grn:inv.status==='sent'?C.acc:inv.status==='overdue'?C.red:C.tm;
                    return React.createElement('tr', { key:i, style:{borderBottom:'1px solid '+C.bdr} },
                      React.createElement('td', { style:{padding:'8px 10px',color:C.text,fontWeight:'500'} }, inv.invoiceNumber||inv.id),
                      React.createElement('td', { style:{padding:'8px 10px',color:C.text} }, inv.customerName||'\u2014'),
                      React.createElement('td', { style:{padding:'8px 10px',color:C.text,fontWeight:'500'} }, '$'+(parseFloat(inv.total)||0).toFixed(2)),
                      React.createElement('td', { style:{padding:'8px 10px'} }, React.createElement('span', { style:{padding:'2px 8px',borderRadius:'4px',fontSize:'11px',fontWeight:'600',color:'#fff',background:sc} }, (inv.status||'draft').charAt(0).toUpperCase()+(inv.status||'draft').slice(1))),
                      React.createElement('td', { style:{padding:'8px 10px',color:C.tm} }, inv.issueDate?new Date(inv.issueDate).toLocaleDateString():'\u2014')
                    );
                  }))
                )
              )
            : React.createElement('div', { style:{textAlign:'center',padding:'32px 0',color:C.tm} }, React.createElement('div', {style:{fontSize:'32px',marginBottom:'8px'}}, '\uD83D\uDCCB'), React.createElement('div', {style:{fontSize:'13px'}}, 'No invoices assigned'))
          )
        ),
        React.createElement('div', { style: { display:'flex', flexDirection:'column', gap:'12px' } },
          React.createElement('div', { style: { background:C.bgCard, borderRadius:'8px', border:'1px solid '+C.bdr, padding:'16px' } },
            React.createElement('h4', { style:{fontSize:'13px',fontWeight:'600',color:C.text,margin:'0 0 12px'} }, '\uD83D\uDCC5 Current Month - '+curMo),
            React.createElement('div', {style:{marginBottom:'10px'}}, React.createElement('div', {style:{fontSize:'11px',color:C.tm,marginBottom:'2px'}}, '\uD83D\uDCC4 Total Invoices'), React.createElement('div', {style:{fontSize:'22px',fontWeight:'700',color:C.text}}, moInv.length)),
            React.createElement('div', null, React.createElement('div', {style:{fontSize:'11px',color:C.tm,marginBottom:'2px'}}, '\uD83D\uDCB0 Sales'), moInv.length>0 ? React.createElement('div', {style:{fontSize:'14px',fontWeight:'600',color:C.grn}}, '$'+moInv.reduce(function(s,i){return s+(parseFloat(i.total)||0);},0).toFixed(2)) : React.createElement('div', {style:{fontSize:'13px',color:C.tm}}, 'No invoices this month'))
          ),
          React.createElement('div', { style: { background:C.bgCard, borderRadius:'8px', border:'1px solid '+C.bdr, padding:'16px' } },
            React.createElement('h4', { style:{fontSize:'13px',fontWeight:'600',color:C.text,margin:'0 0 12px'} }, '\uD83D\uDD50 Timeline'),
            [{l:'Created',d:emp.createdAt,c:C.grn}].concat(emp.hireDate?[{l:'Hired',d:emp.hireDate,c:C.acc}]:[]).concat(emp.updatedAt?[{l:'Last Updated',d:emp.updatedAt,c:C.yel}]:[]).map(function(it,i){
              return React.createElement('div', { key:i, style:{display:'flex',alignItems:'flex-start',gap:'10px',marginBottom:'10px'} },
                React.createElement('div', { style:{width:'8px',height:'8px',borderRadius:'50%',background:it.c,marginTop:'4px',flexShrink:0} }),
                React.createElement('div', null, React.createElement('div', {style:{fontSize:'12px',fontWeight:'600',color:C.text}}, it.l), React.createElement('div', {style:{fontSize:'11px',color:C.tm}}, it.d?new Date(it.d).toLocaleString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'}):'\u2014'))
              );
            })
          ),
          React.createElement('div', { style: { background:C.bgCard, borderRadius:'8px', border:'1px solid '+C.bdr, padding:'16px' } },
            React.createElement('h4', { style:{fontSize:'13px',fontWeight:'600',color:C.text,margin:'0 0 12px'} }, '\uD83D\uDCCA All-Time Stats'),
            [{l:'Total Invoices',v:eInv.length},{l:'Total Revenue',v:'$'+totRev.toFixed(2)},{l:'Paid Revenue',v:'$'+paidRev.toFixed(2)},{l:'Paid Invoices',v:paidInv.length}].map(function(s,i){
              return React.createElement('div', { key:i, style:{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:i<3?'1px solid '+C.bdr:'none'} },
                React.createElement('span', {style:{fontSize:'12px',color:C.tm}}, s.l), React.createElement('span', {style:{fontSize:'12px',fontWeight:'600',color:C.text}}, s.v)
              );
            })
          )
        )
      ),
      React.createElement(Modal, { open:showModal, onClose:function(){setShowModal(false);}, title:editingEmp?'Edit Employee':'Create New Employee', subtitle:editingEmp?'Update employee details.':'Add a new employee to your organization.' }, renderForm()),
      React.createElement(ConfirmDialog, { open:!!delConfirm, onClose:function(){setDelConfirm(null);}, onConfirm:confirmDel, title:'Delete Employee', message:delConfirm&&delConfirm.hasInv?'This employee has invoices and will be deactivated instead.':'Are you sure? This cannot be undone.', confirmLabel:delConfirm&&delConfirm.hasInv?'Deactivate':'Delete', confirmColor:delConfirm&&delConfirm.hasInv?C.yel:C.red })
    );
  }

  // Main list
  return React.createElement('div', { style: { padding:isMobile?'16px':'24px', fontFamily:"'Inter',sans-serif" } },
    React.createElement('div', { style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',flexWrap:'wrap',gap:'10px'} },
      React.createElement('div', null, React.createElement('h1', {style:{fontSize:'22px',fontWeight:'700',color:C.text,margin:0}}, 'Employees'), React.createElement('p', {style:{fontSize:'14px',color:C.tm,marginTop:'4px'}}, 'Manage your organization employees')),
      React.createElement('button', { onClick:openCreate, style:{padding:'9px 16px',background:C.grn,border:'none',borderRadius:'6px',color:'#fff',fontSize:'13px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',whiteSpace:'nowrap'} }, '+ Add Employee')
    ),
    React.createElement('div', { style:{background:C.bgCard,borderRadius:'8px',border:'1px solid '+C.bdr,padding:isMobile?'12px':'16px',marginBottom:'16px',display:'grid',gridTemplateColumns:isMobile?'1fr':'2fr 1fr 1fr 1fr 0.7fr',gap:'12px',alignItems:'end'} },
      React.createElement('div', null, React.createElement('label', {style:lblS}, 'Search'), React.createElement('div', {style:{position:'relative'}}, React.createElement('span', {style:{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:C.tm,fontSize:'13px'}}, '\uD83D\uDD0D'), React.createElement('input', { style:Object.assign({},inpS,{paddingLeft:'32px'}), value:search, onChange:function(e){setSearch(e.target.value);}, placeholder:'Search employees...' }))),
      React.createElement('div', null, React.createElement('label', {style:lblS}, 'Department'), React.createElement('select', { style:selS, value:filterDept, onChange:function(e){setFilterDept(e.target.value);} }, React.createElement('option', {value:'all'}, 'All departments'), allDepts.map(function(d){return React.createElement('option',{key:d,value:d},d);}))),
      React.createElement('div', null, React.createElement('label', {style:lblS}, 'Status'), React.createElement('select', { style:selS, value:filterStatus, onChange:function(e){setFilterStatus(e.target.value);} }, React.createElement('option',{value:'all'},'All status'), React.createElement('option',{value:'active'},'Active'), React.createElement('option',{value:'inactive'},'Inactive'))),
      React.createElement('div', null, React.createElement('label', {style:lblS}, 'Sort by'), React.createElement('select', { style:selS, value:sortBy, onChange:function(e){setSortBy(e.target.value);} }, React.createElement('option',{value:'name'},'Name'), React.createElement('option',{value:'id'},'Employee ID'), React.createElement('option',{value:'department'},'Department'), React.createElement('option',{value:'position'},'Position'), React.createElement('option',{value:'hireDate'},'Hire Date'))),
      React.createElement('div', null, React.createElement('label', {style:lblS}, 'Order'), React.createElement('select', { style:selS, value:sortOrder, onChange:function(e){setSortOrder(e.target.value);} }, React.createElement('option',{value:'asc'},'A-Z'), React.createElement('option',{value:'desc'},'Z-A')))
    ),
    React.createElement('div', { style:{background:C.bgCard,borderRadius:'8px',border:'1px solid '+C.bdr,overflow:'hidden'} },
      filtered.length > 0 && React.createElement('div', { style:{display:'flex',justifyContent:'space-between',padding:'10px 16px',fontSize:'12px',color:C.tm,borderBottom:'1px solid '+C.bdr} },
        React.createElement('span', null, 'Showing '+((page-1)*PER_PAGE+1)+'\u2013'+Math.min(page*PER_PAGE,filtered.length)+' of '+filtered.length+' employees'),
        React.createElement('span', null, 'Page '+page+' of '+totalPages)
      ),
      filtered.length > 0 ?
        React.createElement('div', { style:{overflowX:'auto'} },
          React.createElement('table', { style:{width:'100%',borderCollapse:'collapse',fontSize:'13px',minWidth:isMobile?'700px':'auto'} },
            React.createElement('thead', null, React.createElement('tr', { style:{borderBottom:'1px solid '+C.bdr} },
              ['Name','Employee ID','Position','Department','Email','Phone','Status','Invoices'].map(function(h){return React.createElement('th',{key:h,style:{padding:'10px 12px',textAlign:'left',color:C.tm,fontWeight:'600',fontSize:'12px',whiteSpace:'nowrap'}},h);})
            )),
            React.createElement('tbody', null, paged.map(function(emp){
              var ic = invCount(emp.employeeId);
              return React.createElement('tr', { key:emp.id, style:{borderBottom:'1px solid '+C.bdr,cursor:'pointer',transition:'background 0.15s'}, onClick:function(){setShowDetail(emp);}, onMouseEnter:function(e){e.currentTarget.style.background='#1c2333';}, onMouseLeave:function(e){e.currentTarget.style.background='transparent';} },
                React.createElement('td', {style:{padding:'10px 12px',color:C.text,fontWeight:'600'}}, emp.fullName),
                React.createElement('td', {style:{padding:'10px 12px',color:C.tm}}, emp.employeeId),
                React.createElement('td', {style:{padding:'10px 12px',color:C.text}}, emp.position||'\u2014'),
                React.createElement('td', {style:{padding:'10px 12px',color:C.text}}, emp.department||'\u2014'),
                React.createElement('td', {style:{padding:'10px 12px',color:C.tm,fontSize:'12px'}}, emp.email||'\u2014'),
                React.createElement('td', {style:{padding:'10px 12px',color:C.tm}}, emp.phone||'\u2014'),
                React.createElement('td', {style:{padding:'10px 12px'}}, React.createElement('span', {style:{padding:'2px 8px',borderRadius:'4px',fontSize:'11px',fontWeight:'600',color:emp.status==='active'?C.grn:C.tm}}, emp.status==='active'?'Active':'Inactive')),
                React.createElement('td', {style:{padding:'10px 12px',color:C.text,fontWeight:'600',textAlign:'center'}}, ic)
              );
            }))
          )
        )
      : React.createElement('div', { style:{textAlign:'center',padding:'60px 20px'} },
          React.createElement('div', {style:{fontSize:'48px',marginBottom:'12px',opacity:0.5}}, '\uD83D\uDC64'),
          React.createElement('div', {style:{fontSize:'16px',fontWeight:'600',color:C.text,marginBottom:'6px'}}, 'No employees found'),
          React.createElement('div', {style:{fontSize:'13px',color:C.tm}}, employees.length===0?'Add your first employee to get started.':'No employees match your current filters.')
        ),
      totalPages > 1 && React.createElement('div', { style:{display:'flex',justifyContent:'center',alignItems:'center',gap:'6px',padding:'14px',borderTop:'1px solid '+C.bdr} },
        React.createElement('button', { disabled:page<=1, onClick:function(){setPage(function(p){return p-1;});}, style:{padding:'6px 12px',background:'transparent',border:'1px solid '+C.bdr,borderRadius:'6px',color:page<=1?C.bdr:C.tm,fontSize:'12px',cursor:page<=1?'default':'pointer'} }, '\u2039 Previous'),
        Array.from({length:totalPages},function(_,i){return i+1;}).slice(Math.max(0,page-3),Math.min(totalPages,page+2)).map(function(p){
          return React.createElement('button', { key:p, onClick:function(){setPage(p);}, style:{padding:'6px 10px',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',background:p===page?C.acc:'transparent',color:p===page?'#fff':C.tm,border:p===page?'none':'1px solid '+C.bdr} }, p);
        }),
        React.createElement('button', { disabled:page>=totalPages, onClick:function(){setPage(function(p){return p+1;});}, style:{padding:'6px 12px',background:'transparent',border:'1px solid '+C.bdr,borderRadius:'6px',color:page>=totalPages?C.bdr:C.tm,fontSize:'12px',cursor:page>=totalPages?'default':'pointer'} }, 'Next \u203A')
      )
    ),
    React.createElement(Modal, { open:showModal, onClose:function(){setShowModal(false);}, title:editingEmp?'Edit Employee':'Create New Employee', subtitle:editingEmp?'Update employee details.':'Add a new employee to your organization.' }, renderForm()),
    React.createElement(ConfirmDialog, { open:!!delConfirm, onClose:function(){setDelConfirm(null);}, onConfirm:confirmDel, title:'Delete Employee', message:delConfirm&&delConfirm.hasInv?'This employee has invoices and will be deactivated instead.':'Are you sure? This cannot be undone.', confirmLabel:delConfirm&&delConfirm.hasInv?'Deactivate':'Delete', confirmColor:delConfirm&&delConfirm.hasInv?C.yel:C.red })
  );
}
