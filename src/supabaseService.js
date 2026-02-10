// src/supabaseService.js
// Centralized Supabase CRUD operations for invoices, shares, and emails
import { supabase } from './supabaseClient';

// ============================================
// INVOICES
// ============================================

// Convert localStorage-style invoice object to Supabase column format
const toDbInvoice = (inv, userId) => ({
  user_id: userId,
  invoice_number: inv.invoiceNumber,
  status: inv.status || 'draft',
  auto_draft: inv.autoDraft || false,
  business_name: inv.businessName || null,
  business_email: inv.businessEmail || null,
  business_address: inv.businessAddress || null,
  business_phone: inv.businessPhone || null,
  logo_preview: inv.logoPreview || inv.businessLogo || null,
  customer_name: inv.customerName || null,
  customer_email: inv.customerEmail || null,
  customer_phone: inv.customerPhone || null,
  customer_address: inv.customerAddress || null,
  customer_zip_code: inv.customerZipCode || null,
  customer_identifier: inv.customerIdentifier || null,
  issue_date: inv.issueDate || null,
  due_date: inv.dueDate || null,
  currency: inv.currency || 'USD',
  invoice_mode: inv.invoiceMode || 'products',
  description: inv.description || null,
  end_message: inv.endMessage || null,
  payment_terms_text: inv.paymentTermsText || null,
  items: inv.items || [],
  custom_fields: inv.customFields || [],
  payment_methods: inv.paymentMethods || [],
  subtotal: inv.subtotal || 0,
  shipping_cost: inv.shippingCost || 0,
  discount: inv.discount || 0,
  discount_amount: inv.discountAmount || 0,
  tax_rate: inv.taxRate || 0,
  tax_type: inv.taxType || 'percent',
  tax_included: inv.taxIncluded || false,
  tax_amount: inv.taxAmount || inv.tax || 0,
  shipping_amount: inv.shippingAmount || inv.shipping || 0,
  total: inv.total || 0,
  selected_template: inv.selectedTemplate || 'regular',
  invoice_language: inv.invoiceLanguage || 'english',
  date_format: inv.dateFormat || 'Month DD, YYYY',
});

// Convert Supabase row back to the app's camelCase format
const fromDbInvoice = (row) => ({
  id: row.id,
  userId: row.user_id,
  invoiceNumber: row.invoice_number,
  status: row.status,
  autoDraft: row.auto_draft,
  businessName: row.business_name,
  businessEmail: row.business_email,
  businessAddress: row.business_address,
  businessPhone: row.business_phone,
  logoPreview: row.logo_preview,
  businessLogo: row.logo_preview,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  customerAddress: row.customer_address,
  customerZipCode: row.customer_zip_code,
  customerIdentifier: row.customer_identifier,
  issueDate: row.issue_date,
  dueDate: row.due_date,
  currency: row.currency,
  invoiceMode: row.invoice_mode,
  description: row.description,
  endMessage: row.end_message,
  paymentTermsText: row.payment_terms_text,
  items: row.items || [],
  customFields: row.custom_fields || [],
  paymentMethods: row.payment_methods || [],
  subtotal: parseFloat(row.subtotal) || 0,
  shippingCost: parseFloat(row.shipping_cost) || 0,
  discount: parseFloat(row.discount) || 0,
  discountAmount: parseFloat(row.discount_amount) || 0,
  taxRate: parseFloat(row.tax_rate) || 0,
  taxType: row.tax_type,
  taxIncluded: row.tax_included,
  taxAmount: parseFloat(row.tax_amount) || 0,
  tax: parseFloat(row.tax_amount) || 0,
  shippingAmount: parseFloat(row.shipping_amount) || 0,
  shipping: parseFloat(row.shipping_amount) || 0,
  total: parseFloat(row.total) || 0,
  selectedTemplate: row.selected_template,
  invoiceLanguage: row.invoice_language,
  dateFormat: row.date_format,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function fetchInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromDbInvoice);
}

export async function fetchInvoiceById(id) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return fromDbInvoice(data);
}

export async function createInvoice(invoice, userId) {
  const row = toDbInvoice(invoice, userId);
  const { data, error } = await supabase
    .from('invoices')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromDbInvoice(data);
}

export async function updateInvoice(id, updates, userId) {
  const row = {};
  // Only include fields that are being updated
  const mapping = {
    invoiceNumber: 'invoice_number', status: 'status', autoDraft: 'auto_draft',
    businessName: 'business_name', businessEmail: 'business_email', businessAddress: 'business_address',
    businessPhone: 'business_phone', logoPreview: 'logo_preview',
    customerName: 'customer_name', customerEmail: 'customer_email', customerPhone: 'customer_phone',
    customerAddress: 'customer_address', customerZipCode: 'customer_zip_code', customerIdentifier: 'customer_identifier',
    issueDate: 'issue_date', dueDate: 'due_date', currency: 'currency', invoiceMode: 'invoice_mode',
    description: 'description', endMessage: 'end_message', paymentTermsText: 'payment_terms_text',
    items: 'items', customFields: 'custom_fields', paymentMethods: 'payment_methods',
    subtotal: 'subtotal', shippingCost: 'shipping_cost', discount: 'discount', discountAmount: 'discount_amount',
    taxRate: 'tax_rate', taxType: 'tax_type', taxIncluded: 'tax_included', taxAmount: 'tax_amount',
    shippingAmount: 'shipping_amount', total: 'total',
    selectedTemplate: 'selected_template', invoiceLanguage: 'invoice_language', dateFormat: 'date_format',
  };
  for (const [camel, snake] of Object.entries(mapping)) {
    if (updates[camel] !== undefined) row[snake] = updates[camel];
  }
  // Also handle snake_case keys directly (e.g. from InvoiceDetail)
  if (updates.tax !== undefined) row.tax_amount = updates.tax;
  if (updates.shipping !== undefined) row.shipping_amount = updates.shipping;

  const { data, error } = await supabase
    .from('invoices')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return fromDbInvoice(data);
}

export async function deleteInvoice(id) {
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) throw error;
}

// Upsert auto-draft: find existing draft by invoice_number, update or create
export async function upsertAutoDraft(invoice, userId) {
  // First try to find existing auto-draft
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('user_id', userId)
    .eq('invoice_number', invoice.invoiceNumber)
    .eq('auto_draft', true)
    .maybeSingle();

  if (existing) {
    return await updateInvoice(existing.id, { ...invoice, autoDraft: true, status: 'draft' }, userId);
  } else {
    return await createInvoice({ ...invoice, autoDraft: true, status: 'draft' }, userId);
  }
}

// Finalize invoice: remove auto-draft, create final version
export async function finalizeInvoice(invoice, userId, editingId = null) {
  if (editingId) {
    return await updateInvoice(editingId, { ...invoice, autoDraft: false }, userId);
  }
  // Delete any auto-draft with same invoice number
  await supabase
    .from('invoices')
    .delete()
    .eq('user_id', userId)
    .eq('invoice_number', invoice.invoiceNumber)
    .eq('auto_draft', true);

  return await createInvoice({ ...invoice, autoDraft: false }, userId);
}


// ============================================
// SHARES
// ============================================

const fromDbShare = (row) => ({
  id: row.id,
  invoiceId: row.invoice_id,
  token: row.token,
  createdBy: row.created_by,
  passwordProtected: row.password_protected,
  expiresAt: row.expires_at,
  viewLimit: row.view_limit,
  viewCount: row.view_count,
  lastViewedAt: row.last_viewed_at,
  status: row.status,
  createdAt: row.created_at,
});

export async function fetchSharesForInvoice(invoiceId) {
  const { data, error } = await supabase
    .from('invoice_shares')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromDbShare);
}

export async function createShare(invoiceId, userId, options = {}) {
  // Generate token
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) token += chars[Math.floor(Math.random() * chars.length)];

  const row = {
    invoice_id: invoiceId,
    user_id: userId,
    token,
    created_by: options.createdBy || 'Owner',
    password_protected: options.passwordProtected || false,
    password_hash: options.password || null, // In production, hash this server-side
    expires_at: options.expiresAt || null,
    view_limit: options.viewLimit || null,
  };

  const { data, error } = await supabase
    .from('invoice_shares')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return fromDbShare(data);
}

export async function deleteShare(shareId) {
  const { error } = await supabase.from('invoice_shares').delete().eq('id', shareId);
  if (error) throw error;
}

export async function revokeShare(shareId) {
  const { error } = await supabase
    .from('invoice_shares')
    .update({ status: 'revoked' })
    .eq('id', shareId);
  if (error) throw error;
}

// PUBLIC: Validate share token and get invoice (no auth needed)
export async function getSharedInvoice(token, password = null) {
  const { data, error } = await supabase.rpc('get_shared_invoice', {
    share_token: token,
    share_password: password,
  });
  if (error) throw error;
  if (data?.error) return { error: data.error, shareId: data.share_id };

  return {
    share: data.share,
    invoice: data.invoice ? fromDbInvoice(data.invoice) : null,
  };
}


// ============================================
// EMAILS
// ============================================

const fromDbEmail = (row) => ({
  id: row.id,
  invoiceId: row.invoice_id,
  to: row.recipient_email,
  message: row.custom_message,
  type: row.email_type,
  sentBy: row.sent_by,
  resendEmailId: row.resend_email_id,
  linkClicks: row.link_clicks,
  lastClickedAt: row.last_clicked_at,
  sentAt: row.sent_at,
});

export async function fetchEmailsForInvoice(invoiceId) {
  const { data, error } = await supabase
    .from('invoice_emails')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('sent_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromDbEmail);
}

export async function sendInvoiceEmail(invoiceId, userId, options = {}) {
  // 1. Record the email in the database
  const emailRow = {
    invoice_id: invoiceId,
    user_id: userId,
    recipient_email: options.to,
    custom_message: options.message || null,
    email_type: options.type || 'Invoice Sent',
    sent_by: options.sentBy || 'Owner',
  };

  const { data: emailRecord, error: dbError } = await supabase
    .from('invoice_emails')
    .insert(emailRow)
    .select()
    .single();
  if (dbError) throw dbError;

  // 2. Call the Edge Function to actually send the email via Resend
  try {
    const { data: sendResult, error: fnError } = await supabase.functions.invoke('send-invoice-email', {
      body: {
        invoiceId,
        emailId: emailRecord.id,
        to: options.to,
        message: options.message,
      },
    });

    if (fnError) {
      console.error('Edge function error:', fnError);
      // Email record is still saved even if send fails
    } else if (sendResult?.resendId) {
      // Update the email record with Resend's ID
      await supabase
        .from('invoice_emails')
        .update({ resend_email_id: sendResult.resendId })
        .eq('id', emailRecord.id);
    }
  } catch (e) {
    console.error('Failed to invoke send function:', e);
  }

  return fromDbEmail(emailRecord);
}


// ============================================
// MIGRATION HELPER
// ============================================
// One-time migration: move localStorage invoices to Supabase
export async function migrateLocalInvoices(userId) {
  const saved = localStorage.getItem('dayonetools_invoices');
  if (!saved) return { migrated: 0 };

  const localInvoices = JSON.parse(saved);
  if (!localInvoices.length) return { migrated: 0 };

  let migrated = 0;
  for (const inv of localInvoices) {
    try {
      // Check if already migrated (by invoice number)
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', userId)
        .eq('invoice_number', inv.invoiceNumber)
        .maybeSingle();

      if (!existing) {
        await createInvoice(inv, userId);
        migrated++;
      }
    } catch (e) {
      console.error('Migration error for invoice:', inv.invoiceNumber, e);
    }
  }

  // Mark as migrated so we don't re-run
  if (migrated > 0) {
    localStorage.setItem('dayonetools_invoices_migrated', 'true');
  }

  return { migrated };
}
