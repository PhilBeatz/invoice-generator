import React, { useState, useEffect } from 'react';

export default function DashboardCategories({ darkMode = true }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);

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

  // Load categories and products from localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem('dayonetools_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    
    const savedProducts = localStorage.getItem('dayonetools_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save categories to localStorage
  const saveCategories = (newCategories) => {
    setCategories(newCategories);
    localStorage.setItem('dayonetools_categories', JSON.stringify(newCategories));
  };

  // Count products in a category
  const getProductCount = (categoryName) => {
    return products.filter(p => p.category === categoryName).length;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
    setShowActionsMenu(null);
  };

  const handleDelete = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const productCount = getProductCount(category?.name);
    
    if (productCount > 0) {
      if (!window.confirm(`This category has ${productCount} product(s). Deleting it will remove the category from those products. Continue?`)) {
        return;
      }
      // Remove category from products
      const updatedProducts = products.map(p => 
        p.category === category.name ? { ...p, category: '' } : p
      );
      setProducts(updatedProducts);
      localStorage.setItem('dayonetools_products', JSON.stringify(updatedProducts));
    } else {
      if (!window.confirm('Are you sure you want to delete this category?')) {
        return;
      }
    }
    
    saveCategories(categories.filter(c => c.id !== categoryId));
    setShowActionsMenu(null);
  };

  const handleSave = (categoryData) => {
    if (editingCategory) {
      // Update existing - also update products if name changed
      const oldName = editingCategory.name;
      const newName = categoryData.name;
      
      if (oldName !== newName) {
        const updatedProducts = products.map(p => 
          p.category === oldName ? { ...p, category: newName } : p
        );
        setProducts(updatedProducts);
        localStorage.setItem('dayonetools_products', JSON.stringify(updatedProducts));
      }
      
      saveCategories(categories.map(c => 
        c.id === editingCategory.id ? { ...c, ...categoryData, updatedAt: new Date().toISOString() } : c
      ));
    } else {
      // Create new
      const newCategory = {
        ...categoryData,
        id: `cat_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: categoryData.status || 'active',
      };
      saveCategories([...categories, newCategory]);
    }
    setShowModal(false);
    setEditingCategory(null);
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
            Categories
          </h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>
            Organize your products with categories for better management
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
          + Create Category
        </button>
      </div>

      {/* Categories Table */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1.2fr 80px',
          gap: '12px',
          padding: '14px 20px',
          background: colors.bgInput,
          borderBottom: `1px solid ${colors.border}`,
          fontSize: '12px',
          fontWeight: '600',
          color: colors.textMuted,
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🏷️ Name</div>
          <div>Description</div>
          <div>Products</div>
          <div>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📅 Created</div>
          <div>Actions</div>
        </div>

        {categories.length === 0 ? (
          /* Empty State */
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              opacity: 0.3,
            }}>
              🏷️
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, marginBottom: '8px' }}>
              No categories found
            </h3>
            <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '20px' }}>
              Get started by creating your first product category
            </p>
            <button
              onClick={handleCreate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
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
              + Create Category
            </button>
          </div>
        ) : (
          /* Table Rows */
          categories.map((category) => (
            <div
              key={category.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1.2fr 80px',
                gap: '12px',
                padding: '14px 20px',
                borderBottom: `1px solid ${colors.border}`,
                alignItems: 'center',
                fontSize: '14px',
                color: colors.text,
              }}
            >
              {/* Name */}
              <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🏷️</span>
                {category.name || '—'}
              </div>

              {/* Description */}
              <div style={{ 
                color: colors.textMuted, 
                fontSize: '13px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {category.description || '—'}
              </div>

              {/* Products Count */}
              <div>
                <span style={{
                  padding: '4px 10px',
                  background: colors.bgInput,
                  borderRadius: '4px',
                  fontSize: '13px',
                  color: colors.text,
                }}>
                  {getProductCount(category.name)} products
                </span>
              </div>

              {/* Status */}
              <div>{getStatusBadge(category.status)}</div>

              {/* Created */}
              <div style={{ color: colors.textMuted, fontSize: '13px' }}>{formatDate(category.createdAt)}</div>

              {/* Actions */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowActionsMenu(showActionsMenu === category.id ? null : category.id)}
                  style={{
                    padding: '6px 10px',
                    background: 'transparent',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  ⋮
                </button>

                {showActionsMenu === category.id && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '100%',
                    marginBottom: '4px',
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    minWidth: '140px',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => handleEdit(category)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: colors.text,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: colors.red,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
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

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          darkMode={darkMode}
          colors={colors}
          category={editingCategory}
          existingNames={categories.filter(c => c.id !== editingCategory?.id).map(c => c.name)}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingCategory(null); }}
        />
      )}

      {/* Click outside to close menus */}
      {showActionsMenu && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
          onClick={() => setShowActionsMenu(null)}
        />
      )}
    </div>
  );
}

// Category Modal Component
function CategoryModal({ darkMode, colors, category, existingNames, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    status: category?.status || 'active',
  });

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
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }
    if (existingNames.includes(formData.name.trim())) {
      alert('A category with this name already exists');
      return;
    }
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
    }}>
      <div style={{
        background: colors.bgCard,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        width: '100%',
        maxWidth: '500px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, margin: 0 }}>
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textMuted,
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>Category Name *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>🏷️</span>
                <input
                  style={{ ...inputStyle, paddingLeft: '42px' }}
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Enter category description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['active', 'inactive'].map(status => (
                  <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ accentColor: colors.green }}
                    />
                    <span style={{ color: colors.text, fontSize: '14px', textTransform: 'capitalize' }}>{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${colors.border}` }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                color: colors.text,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: colors.green,
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
