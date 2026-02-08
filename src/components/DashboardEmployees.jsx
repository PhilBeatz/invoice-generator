import React, { useState, useEffect } from 'react';

export default function DashboardEmployees({ darkMode = true }) {
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const colors = darkMode ? {
    bg: '#0d1117',
    bgCard: '#161b22',
    bgInput: '#21262d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    border: '#30363d',
    accent: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  } : {
    bg: '#f1f5f9',
    bgCard: '#ffffff',
    bgInput: '#f8fafc',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  };

  // Load employees and invoices from localStorage
  useEffect(() => {
    const savedEmployees = localStorage.getItem('dayonetools_employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
    const savedInvoices = localStorage.getItem('dayonetools_invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  // Save employees to localStorage
  const saveEmployees = (newEmployees) => {
    setEmployees(newEmployees);
    localStorage.setItem('dayonetools_employees', JSON.stringify(newEmployees));
  };

  // Get unique departments
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  // Get invoice count for an employee
  const getInvoiceCount = (employeeId) => {
    return invoices.filter(inv => inv.employeeId === employeeId).length;
  };

  // Filter & sort employees
  const filteredEmployees = employees
    .filter(emp => {
      const matchesSearch = !searchQuery || 
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    })
    .sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'name': valA = a.name || ''; valB = b.name || ''; break;
        case 'employeeId': valA = a.employeeId || ''; valB = b.employeeId || ''; break;
        case 'department': valA = a.department || ''; valB = b.department || ''; break;
        case 'created': valA = a.createdAt || ''; valB = b.createdAt || ''; break;
        default: valA = a.name || ''; valB = b.name || '';
      }
      if (sortOrder === 'asc') return valA.localeCompare(valB);
      return valB.localeCompare(valA);
    });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / perPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
    setShowActionsMenu(null);
  };

  const handleDelete = (employee) => {
    setShowDeleteConfirm(employee);
    setShowActionsMenu(null);
  };

  const confirmDelete = () => {
    const employee = showDeleteConfirm;
    const invoiceCount = getInvoiceCount(employee.id);
    
    if (invoiceCount > 0) {
      // Deactivate instead of delete
      saveEmployees(employees.map(e => 
        e.id === employee.id ? { ...e, status: 'inactive', updatedAt: new Date().toISOString() } : e
      ));
    } else {
      // Permanently delete
      saveEmployees(employees.filter(e => e.id !== employee.id));
    }
    setShowDeleteConfirm(null);
  };

  const handleView = (employee) => {
    setViewingEmployee(employee);
    setShowActionsMenu(null);
  };

  const handleSave = (employeeData) => {
    if (editingEmployee) {
      saveEmployees(employees.map(e => 
        e.id === editingEmployee.id ? { ...e, ...employeeData, updatedAt: new Date().toISOString() } : e
      ));
    } else {
      const newEmployee = {
        ...employeeData,
        id: `emp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      saveEmployees([...employees, newEmployee]);
    }
    setShowModal(false);
    setEditingEmployee(null);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: `${colors.green}20`, color: colors.green, label: 'Active' },
      inactive: { bg: `${colors.textMuted}20`, color: colors.textMuted, label: 'Inactive' },
    };
    const style = styles[status] || styles.active;
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 10px',
        background: style.bg,
        color: style.color,
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
      }}>
        {style.label}
      </span>
    );
  };

  const selectStyle = {
    padding: '9px 32px 9px 12px',
    background: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    color: colors.text,
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '14px',
  };

  // If viewing employee detail
  if (viewingEmployee) {
    return (
      <EmployeeDetail
        employee={viewingEmployee}
        invoices={invoices.filter(inv => inv.employeeId === viewingEmployee.id)}
        darkMode={darkMode}
        colors={colors}
        onBack={() => setViewingEmployee(null)}
        onEdit={() => { setEditingEmployee(viewingEmployee); setShowModal(true); }}
        onDelete={() => handleDelete(viewingEmployee)}
        formatDate={formatDate}
      />
    );
  }

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: colors.text, margin: 0 }}>
            Employees
          </h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>
            Manage your organization employees
          </p>
        </div>
        <button
          onClick={handleCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: colors.green,
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          + Add Employee
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '14px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              background: colors.bgInput,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              fontSize: '13px',
              fontFamily: "'Inter', sans-serif",
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Department Filter */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Department</label>
          <select
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
            style={selectStyle}
          >
            <option value="all">All departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={selectStyle}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={selectStyle}
          >
            <option value="name">Name</option>
            <option value="employeeId">Employee ID</option>
            <option value="department">Department</option>
            <option value="created">Date Created</option>
          </select>
        </div>

        {/* Order */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={selectStyle}
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
      </div>

      {/* Results count & pagination info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: colors.textMuted }}>
          Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
        </span>
        {totalPages > 1 && (
          <span style={{ fontSize: '13px', color: colors.textMuted }}>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Employees Table */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr 1.2fr 1fr 1.5fr 1fr 0.7fr 0.6fr 60px',
          gap: '8px',
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.border}`,
          background: darkMode ? '#0d1117' : '#f8fafc',
        }}>
          {[
            { icon: '👤', label: 'Name' },
            { icon: '#', label: 'Employee ID' },
            { icon: '💼', label: 'Position' },
            { icon: '🏢', label: 'Department' },
            { icon: '✉️', label: 'Email' },
            { icon: '📞', label: 'Phone' },
            { icon: '⚡', label: 'Status' },
            { icon: '📄', label: 'Invoices' },
            { icon: '', label: '' },
          ].map((col, i) => (
            <div key={i} style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {col.icon && <span style={{ fontSize: '11px' }}>{col.icon}</span>}
              {col.label}
            </div>
          ))}
        </div>

        {/* Table Body */}
        {paginatedEmployees.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>👥</div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: colors.text, marginBottom: '8px' }}>
              {employees.length === 0 ? 'No employees yet' : 'No employees match your filters'}
            </h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
              {employees.length === 0 
                ? 'Add your first employee to start tracking invoice performance.'
                : 'Try adjusting your search or filters.'}
            </p>
            {employees.length === 0 && (
              <button
                onClick={handleCreate}
                style={{
                  padding: '10px 20px',
                  background: colors.green,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                + Add Employee
              </button>
            )}
          </div>
        ) : (
          paginatedEmployees.map((emp) => (
            <div
              key={emp.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr 1.2fr 1fr 1.5fr 1fr 0.7fr 0.6fr 60px',
                gap: '8px',
                padding: '14px 16px',
                borderBottom: `1px solid ${colors.border}`,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onClick={() => handleView(emp)}
              onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? '#1c2128' : '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name */}
              <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {emp.name}
              </div>

              {/* Employee ID */}
              <div style={{ fontSize: '13px', color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {emp.employeeId}
              </div>

              {/* Position */}
              <div style={{ fontSize: '13px', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {emp.position || '—'}
              </div>

              {/* Department */}
              <div style={{ fontSize: '13px', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {emp.department || '—'}
              </div>

              {/* Email */}
              <div style={{ fontSize: '13px', color: colors.accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {emp.email || '—'}
              </div>

              {/* Phone */}
              <div style={{ fontSize: '13px', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {emp.phone || '—'}
              </div>

              {/* Status */}
              <div>{getStatusBadge(emp.status)}</div>

              {/* Invoice Count */}
              <div style={{ fontSize: '13px', color: colors.text, textAlign: 'center' }}>
                {getInvoiceCount(emp.id)}
              </div>

              {/* Actions */}
              <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowActionsMenu(showActionsMenu === emp.id ? null : emp.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  ⋯
                </button>

                {showActionsMenu === emp.id && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    zIndex: 1100,
                    minWidth: '150px',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => handleView(emp)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                        padding: '10px 14px', background: 'transparent', border: 'none',
                        color: colors.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => handleEdit(emp)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                        padding: '10px 14px', background: 'transparent', border: 'none',
                        color: colors.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emp)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                        padding: '10px 14px', background: 'transparent', border: 'none',
                        color: colors.red, fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: currentPage === 1 ? colors.textMuted : colors.text,
              fontSize: '13px',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            ‹ Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '8px 12px',
                background: page === currentPage ? colors.accent : 'transparent',
                border: page === currentPage ? 'none' : `1px solid ${colors.border}`,
                borderRadius: '6px',
                color: page === currentPage ? '#ffffff' : colors.text,
                fontSize: '13px',
                fontWeight: page === currentPage ? '600' : '400',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: currentPage === totalPages ? colors.textMuted : colors.text,
              fontSize: '13px',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Next ›
          </button>
        </div>
      )}

      {/* Employee Create/Edit Modal */}
      {showModal && (
        <EmployeeModal
          darkMode={darkMode}
          colors={colors}
          employee={editingEmployee}
          existingIds={employees.filter(e => e.id !== editingEmployee?.id).map(e => e.employeeId)}
          departments={departments}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingEmployee(null); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, padding: '20px',
        }}>
          <div style={{
            background: colors.bgCard, borderRadius: '12px', border: `1px solid ${colors.border}`,
            width: '100%', maxWidth: '440px', padding: '24px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: '0 0 12px' }}>
              Delete Employee
            </h3>
            <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', margin: '0 0 8px' }}>
              Are you sure you want to delete <strong style={{ color: colors.text }}>{showDeleteConfirm.name}</strong>?
            </p>
            {getInvoiceCount(showDeleteConfirm.id) > 0 ? (
              <p style={{ fontSize: '13px', color: colors.yellow, background: `${colors.yellow}15`, padding: '10px 14px', borderRadius: '6px', margin: '12px 0 20px' }}>
                ⚠️ This employee has {getInvoiceCount(showDeleteConfirm.id)} assigned invoice(s). They will be deactivated instead of deleted.
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: colors.red, margin: '4px 0 20px' }}>
                This action cannot be undone and will permanently remove all employee data.
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '10px 20px', background: 'transparent', border: `1px solid ${colors.border}`,
                  borderRadius: '6px', color: colors.text, fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px', background: colors.red, border: 'none',
                  borderRadius: '6px', color: '#ffffff', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close actions menus */}
      {showActionsMenu && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
          onClick={() => setShowActionsMenu(null)}
        />
      )}
    </div>
  );
}


// ============================================
// Employee Create/Edit Modal
// ============================================
function EmployeeModal({ darkMode, colors, employee, existingIds, departments, onSave, onClose }) {
  const [formData, setFormData] = useState({
    employeeId: employee?.employeeId || '',
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    position: employee?.position || '',
    department: employee?.department || '',
    hireDate: employee?.hireDate || '',
    linkedUser: employee?.linkedUser || '',
    status: employee?.status || 'active',
  });
  const [customDepartment, setCustomDepartment] = useState(false);
  const [errors, setErrors] = useState({});

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    background: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    color: colors.text,
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: colors.text,
    marginBottom: '6px',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
  };

  const validate = () => {
    const errs = {};
    if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    else if (existingIds.includes(formData.employeeId.trim())) errs.employeeId = 'Employee ID already exists';
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...formData,
      employeeId: formData.employeeId.trim(),
      name: formData.name.trim(),
    });
  };

  const handleDepartmentChange = (value) => {
    if (value === '__custom__') {
      setCustomDepartment(true);
      setFormData({ ...formData, department: '' });
    } else {
      setCustomDepartment(false);
      setFormData({ ...formData, department: value });
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 2000, padding: '20px',
    }}>
      <div style={{
        background: colors.bgCard, borderRadius: '12px', border: `1px solid ${colors.border}`,
        width: '100%', maxWidth: '620px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${colors.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>
              {employee ? 'Edit Employee' : 'Create New Employee'}
            </h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>
              {employee ? 'Update employee details below.' : 'Add a new employee to your organization. Fill in the details below.'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: colors.textMuted, fontSize: '20px', cursor: 'pointer', padding: '4px' }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Row 1: Employee ID & Full Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  <span style={{ fontSize: '12px' }}>#</span> Employee ID <span style={{ color: colors.red }}>*</span>
                </label>
                <input
                  style={{ ...inputStyle, borderColor: errors.employeeId ? colors.red : colors.border }}
                  placeholder="EMP001"
                  maxLength={50}
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                />
                {errors.employeeId && <p style={{ fontSize: '12px', color: colors.red, marginTop: '4px' }}>{errors.employeeId}</p>}
              </div>
              <div>
                <label style={labelStyle}>
                  <span style={{ fontSize: '12px' }}>👤</span> Full Name <span style={{ color: colors.red }}>*</span>
                </label>
                <input
                  style={{ ...inputStyle, borderColor: errors.name ? colors.red : colors.border }}
                  placeholder="John Doe"
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p style={{ fontSize: '12px', color: colors.red, marginTop: '4px' }}>{errors.name}</p>}
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  <span style={{ fontSize: '12px' }}>✉️</span> Email
                </label>
                <input
                  type="email"
                  style={{ ...inputStyle, borderColor: errors.email ? colors.red : colors.border }}
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p style={{ fontSize: '12px', color: colors.red, marginTop: '4px' }}>{errors.email}</p>}
              </div>
              <div>
                <label style={labelStyle}>
                  <span style={{ fontSize: '12px' }}>📞</span> Phone
                </label>
                <input
                  type="tel"
                  style={inputStyle}
                  placeholder="+1 (555) 123-4567"
                  maxLength={50}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Row 3: Position & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  <span style={{ fontSize: '12px' }}>💼</span> Position
                </label>
                <input
                  style={inputStyle}
                  placeholder="e.g., Sales Manager"
                  maxLength={100}
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  <span style={{ fontSize: '12px' }}>🏢</span> Department
                </label>
                {customDepartment ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="Enter department name"
                      maxLength={100}
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => { setCustomDepartment(false); setFormData({ ...formData, department: '' }); }}
                      style={{
                        padding: '8px 12px', background: 'transparent', border: `1px solid ${colors.border}`,
                        borderRadius: '6px', color: colors.textMuted, cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <select
                    style={selectStyle}
                    value={formData.department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="__custom__">+ Custom Department</option>
                  </select>
                )}
              </div>
            </div>

            {/* Row 4: Hire Date & Link to User */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  <span style={{ fontSize: '12px' }}>📅</span> Hire Date
                </label>
                <input
                  type="date"
                  style={{ ...inputStyle, colorScheme: darkMode ? 'dark' : 'light' }}
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  <span style={{ fontSize: '12px' }}>🔗</span> Link to User Account
                </label>
                <select
                  style={selectStyle}
                  value={formData.linkedUser}
                  onChange={(e) => setFormData({ ...formData, linkedUser: e.target.value })}
                >
                  <option value="">No user linked</option>
                </select>
                <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
                  Connect to an organization member account
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${colors.border}` }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px', background: 'transparent', border: `1px solid ${colors.border}`,
                borderRadius: '6px', color: colors.text, fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 24px', background: colors.green, border: 'none',
                borderRadius: '6px', color: '#ffffff', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {employee ? 'Save Changes' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ============================================
// Employee Detail View
// ============================================
function EmployeeDetail({ employee, invoices, darkMode, colors, onBack, onEdit, onDelete, formatDate }) {
  const [searchInvoices, setSearchInvoices] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Current month stats
  const now = new Date();
  const currentMonthInvoices = invoices.filter(inv => {
    const d = new Date(inv.createdAt || inv.issueDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalRevenue = currentMonthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  const filteredInvoices = invoices
    .filter(inv => {
      const matchesSearch = !searchInvoices ||
        inv.invoiceNumber?.toLowerCase().includes(searchInvoices.toLowerCase()) ||
        inv.customerName?.toLowerCase().includes(searchInvoices.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const getInvoiceStatusBadge = (status) => {
    const map = {
      paid: { bg: `${colors.green}20`, color: colors.green, label: 'Paid' },
      draft: { bg: `${colors.textMuted}20`, color: colors.textMuted, label: 'Draft' },
      sent: { bg: `${colors.accent}20`, color: colors.accent, label: 'Sent' },
      overdue: { bg: `${colors.red}20`, color: colors.red, label: 'Overdue' },
      pending: { bg: `${colors.yellow}20`, color: colors.yellow, label: 'Pending' },
    };
    const style = map[status] || map.draft;
    return (
      <span style={{ display: 'inline-block', padding: '3px 8px', background: style.bg, color: style.color, borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>
        {style.label}
      </span>
    );
  };

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent', border: 'none', color: colors.accent,
              fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: colors.text, margin: 0 }}>{employee.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onEdit}
            style={{
              padding: '8px 16px', background: colors.accent, border: 'none',
              borderRadius: '6px', color: '#ffffff', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '8px 16px', background: colors.red, border: 'none',
              borderRadius: '6px', color: '#ffffff', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Left Column */}
        <div>
          {/* Employee Details Card */}
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: '8px', padding: '24px', marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 Employee Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Name</div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: colors.text }}>{employee.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Employee ID</div>
                <div style={{ fontSize: '15px', color: colors.text }}># {employee.employeeId}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '15px', color: colors.accent }}>{employee.email || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Phone</div>
                <div style={{ fontSize: '15px', color: colors.text }}>{employee.phone || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Position</div>
                <div style={{ fontSize: '15px', color: colors.text }}>{employee.position || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Department</div>
                <div style={{ fontSize: '15px', color: colors.text }}>{employee.department || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Status</div>
                <div style={{ fontSize: '15px', color: employee.status === 'active' ? colors.green : colors.textMuted }}>
                  ● {employee.status === 'active' ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>Created</div>
                <div style={{ fontSize: '15px', color: colors.text }}>📅 {formatDate(employee.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Assigned Invoices */}
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: '8px', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📄 Assigned Invoices
              </h3>
              <span style={{ fontSize: '13px', color: colors.textMuted }}>
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </span>
            </div>

            {/* Invoice Filters */}
            <div style={{ padding: '12px 24px', display: 'flex', gap: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, fontSize: '13px' }}>🔍</span>
                <input
                  placeholder="Search invoices..."
                  value={searchInvoices}
                  onChange={(e) => setSearchInvoices(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px 8px 32px', background: colors.bgInput,
                    border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text,
                    fontSize: '13px', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 28px 8px 10px', background: colors.bgInput,
                  border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text,
                  fontSize: '13px', outline: 'none', cursor: 'pointer', appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '14px',
                }}
              >
                <option value="all">Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Invoice Table */}
            {filteredInvoices.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: colors.textMuted }}>No invoices assigned to this employee.</p>
              </div>
            ) : (
              <div>
                {/* Invoice Header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.7fr 0.8fr',
                  gap: '8px', padding: '10px 24px', borderBottom: `1px solid ${colors.border}`,
                  background: darkMode ? '#0d1117' : '#f8fafc',
                }}>
                  {['Invoice #', 'Customer', 'Items', 'Amount', 'Status', 'Issued'].map(h => (
                    <div key={h} style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted }}>{h}</div>
                  ))}
                </div>
                {filteredInvoices.map(inv => (
                  <div key={inv.id || inv.invoiceNumber} style={{
                    display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 0.8fr 0.7fr 0.8fr',
                    gap: '8px', padding: '12px 24px', borderBottom: `1px solid ${colors.border}`,
                  }}>
                    <div style={{ fontSize: '13px', color: colors.accent, fontWeight: '500' }}>{inv.invoiceNumber}</div>
                    <div style={{ fontSize: '13px', color: colors.text }}>{inv.customerName || '—'}</div>
                    <div style={{ fontSize: '13px', color: colors.textMuted }}>{inv.items?.length || 0} items</div>
                    <div style={{ fontSize: '13px', color: colors.text, fontWeight: '500' }}>${(inv.total || 0).toFixed(2)}</div>
                    <div>{getInvoiceStatusBadge(inv.status)}</div>
                    <div style={{ fontSize: '13px', color: colors.textMuted }}>{formatDate(inv.issueDate)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Timeline */}
        <div>
          {/* Current Month Stats */}
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: '8px', padding: '20px', marginBottom: '16px',
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: colors.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📅 Current Month - {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h4>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>📄 Total Invoices</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: colors.text }}>{currentMonthInvoices.length}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>💰 Sales by Currency</div>
              {currentMonthInvoices.length > 0 ? (
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.green }}>
                  ${totalRevenue.toFixed(2)}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: colors.textMuted }}>No invoices this month</div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: '8px', padding: '20px',
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', color: colors.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🕐 Timeline
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Created */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.green, marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: colors.text }}>Created</div>
                  <div style={{ fontSize: '12px', color: colors.textMuted }}>
                    {employee.createdAt ? new Date(employee.createdAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '—'}
                  </div>
                </div>
              </div>

              {/* Hired */}
              {employee.hireDate && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.accent, marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: colors.text }}>Hired</div>
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>{formatDate(employee.hireDate)}</div>
                  </div>
                </div>
              )}

              {/* Last Updated */}
              {employee.updatedAt && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.yellow, marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: colors.text }}>Last Updated</div>
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>
                      {new Date(employee.updatedAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
