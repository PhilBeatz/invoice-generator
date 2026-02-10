import React, { useState, useEffect } from 'react';

export default function DashboardProducts({ darkMode = true }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [perPage, setPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [expandProperties, setExpandProperties] = useState(false);

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

  // Load products from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dayonetools_products');
    if (saved) {
      setProducts(JSON.parse(saved));
    }
  }, []);

  // Load categories from localStorage
  const [savedCategories, setSavedCategories] = useState([]);
  useEffect(() => {
    const saved = localStorage.getItem('dayonetools_categories');
    if (saved) {
      setSavedCategories(JSON.parse(saved));
    }
  }, [showModal]);

  // Save products to localStorage
  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('dayonetools_products', JSON.stringify(newProducts));
  };

  // Get unique categories from both saved categories and existing product categories
  const categories = [...new Set([
    ...savedCategories.filter(c => c.status === 'active').map(c => c.name),
    ...products.map(p => p.category).filter(Boolean)
  ])];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = !searchQuery || 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name': aVal = a.name || ''; bVal = b.name || ''; break;
        case 'price': aVal = parseFloat(a.price) || 0; bVal = parseFloat(b.price) || 0; break;
        case 'created': aVal = new Date(a.createdAt || 0); bVal = new Date(b.createdAt || 0); break;
        default: aVal = a.name || ''; bVal = b.name || '';
      }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    })
    .slice(0, perPage);

  const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
    setShowActionsMenu(null);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      saveProducts(products.filter(p => p.id !== productId));
    }
    setShowActionsMenu(null);
  };

  const handleSave = (productData) => {
    if (editingProduct) {
      // Update existing
      saveProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p));
    } else {
      // Create new
      const newProduct = {
        ...productData,
        id: `prod_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      saveProducts([...products, newProduct]);
    }
    setShowModal(false);
    setEditingProduct(null);
  };

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

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
    boxSizing: 'border-box',
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: `${colors.green}20`, color: colors.green, label: 'Active' },
      inactive: { bg: `${colors.textMuted}20`, color: colors.textMuted, label: 'Inactive' },
      draft: { bg: `${colors.yellow}20`, color: colors.yellow, label: 'Draft' },
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
            Products
          </h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, marginTop: '4px' }}>
            Manage your product catalog
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
          + Create Product
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
      }}>
        {/* Search */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>🔍</span>
            <input
              type="text"
              placeholder="Search by product name, model, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '36px' }}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ ...selectStyle, width: '170px' }}
          >
            <option value="all">All Products</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ ...selectStyle, width: '150px' }}
          >
            <option value="created">Created Date</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
          </select>
        </div>

        {/* Sort Order */}
        <div style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ ...selectStyle, width: '140px' }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Per Page */}
        <div style={{ flexShrink: 0 }}>
          <label style={{ fontSize: '12px', fontWeight: '500', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>Show</label>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            style={{ ...selectStyle, width: '140px' }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Product Properties Accordion */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        marginBottom: '16px',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setExpandProperties(!expandProperties)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 14px',
            background: colors.bgInput,
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            color: colors.text,
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏷️</span> Product Properties
          </span>
          <span style={{ transform: expandProperties ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
        </button>
        
        {expandProperties && (
          <div style={{ padding: '16px', background: colors.bgInput, borderRadius: '0 0 6px 6px', marginTop: '-1px', border: `1px solid ${colors.border}`, borderTop: 'none' }}>
            <p style={{ fontSize: '13px', color: colors.textMuted }}>Filter by custom product properties (coming soon)</p>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1.5fr 1fr 1fr 1.5fr 1fr 0.8fr 1fr 80px',
          gap: '12px',
          padding: '14px 20px',
          background: colors.bgInput,
          borderBottom: `1px solid ${colors.border}`,
          fontSize: '12px',
          fontWeight: '600',
          color: colors.textMuted,
          alignItems: 'center',
        }}>
          <div>🖼️ Photo</div>
          <div>🏷️ Name</div>
          <div># Model</div>
          <div>💰 Price</div>
          <div>📝 Description</div>
          <div>📁 Category</div>
          <div>Status</div>
          <div>📅 Created</div>
          <div>Actions</div>
        </div>

        {filteredProducts.length === 0 ? (
          /* Empty State */
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 20px',
              background: colors.bgInput,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              opacity: 0.5,
            }}>
              📦
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, marginBottom: '8px' }}>
              No products found
            </h3>
            <p style={{ fontSize: '14px', color: colors.textMuted, marginBottom: '20px' }}>
              Get started by creating your first product
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
              + Create Product
            </button>
          </div>
        ) : (
          /* Table Rows */
          filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1.5fr 1fr 1fr 1.5fr 1fr 0.8fr 1fr 80px',
                gap: '12px',
                padding: '14px 20px',
                borderBottom: `1px solid ${colors.border}`,
                alignItems: 'center',
                fontSize: '14px',
                color: colors.text,
              }}
            >
              {/* Photo */}
              <div>
                {product.photo ? (
                  <img src={product.photo} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: colors.bgInput, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', opacity: 0.5 }}>📦</div>
                )}
              </div>

              {/* Name */}
              <div style={{ fontWeight: '500' }}>{product.name || '—'}</div>

              {/* Model */}
              <div style={{ color: colors.textMuted, fontSize: '13px' }}>{product.model || '—'}</div>

              {/* Price */}
              <div style={{ fontWeight: '600' }}>{formatCurrency(product.price)}</div>

              {/* Description */}
              <div style={{ 
                color: colors.textMuted, 
                fontSize: '13px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {product.description || '—'}
              </div>

              {/* Category */}
              <div>
                {product.category ? (
                  <span style={{
                    padding: '4px 8px',
                    background: colors.bgInput,
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: colors.textMuted,
                  }}>
                    {product.category}
                  </span>
                ) : '—'}
              </div>

              {/* Status */}
              <div>{getStatusBadge(product.status)}</div>

              {/* Created */}
              <div style={{ color: colors.textMuted, fontSize: '13px' }}>{formatDate(product.createdAt)}</div>

              {/* Actions */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowActionsMenu(showActionsMenu === product.id ? null : product.id)}
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

                {showActionsMenu === product.id && (
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
                      onClick={() => handleEdit(product)}
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
                      onClick={() => handleDelete(product.id)}
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

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          darkMode={darkMode}
          colors={colors}
          product={editingProduct}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
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

// Product Modal Component
function ProductModal({ darkMode, colors, product, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    model: product?.model || '',
    price: product?.price || '',
    description: product?.description || '',
    category: product?.category || '',
    status: product?.status || 'active',
    photo: product?.photo || '',
  });
  const [newCategory, setNewCategory] = useState('');

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
    if (!formData.name) {
      alert('Product name is required');
      return;
    }
    onSave({
      ...formData,
      category: newCategory || formData.category,
    });
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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
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
            {product ? 'Edit Product' : 'Create Product'}
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
            {/* Two Column Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Product Name *</label>
                <input
                  style={inputStyle}
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Model / SKU</label>
                <input
                  style={inputStyle}
                  placeholder="Enter model or SKU"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
            </div>

            {/* Price and Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Price</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    style={{ ...inputStyle, paddingLeft: '30px' }}
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__new__">+ Add new category</option>
                </select>
                {formData.category === '__new__' && (
                  <input
                    style={{ ...inputStyle, marginTop: '8px' }}
                    placeholder="Enter new category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['active', 'inactive', 'draft'].map(status => (
                  <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ accentColor: colors.accent }}
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
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
