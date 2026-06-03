-- ============================================================
-- WORKSHOP Platform - Schema Unificado para Turso (SQLite)
-- Grupo Braga & Biano
-- Migration: 005_sqlite_unified.sql
-- ============================================================
-- Esta migration consolida todas as tabelas e funções do sistema
-- usando APENAS sintaxe compatível com Turso/SQLite.
-- Substitui as migrations 001-004 (Postgres) que usam features
-- incompatíveis: ENUM, plpgsql, RLS, auth.uid(), etc.
-- ============================================================

-- ============================================================
-- TABELA: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    auth_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    cpf TEXT,
    cpf_hash TEXT,
    whatsapp TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin', 'support', 'affiliate')),
    avatar_url TEXT,
    first_login INTEGER NOT NULL DEFAULT 1,
    must_change_password INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    banned_at TEXT,
    ban_reason TEXT,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- ============================================================
-- TABELA: devices
-- ============================================================
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    os TEXT,
    browser TEXT,
    ip_last_login TEXT,
    user_agent TEXT,
    is_approved INTEGER NOT NULL DEFAULT 0,
    is_blocked INTEGER NOT NULL DEFAULT 0,
    registered_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, device_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_fingerprint ON devices(device_fingerprint);

-- ============================================================
-- TABELA: sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT REFERENCES devices(id) ON DELETE SET NULL,
    token_hash TEXT NOT NULL,
    refresh_token_hash TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================
-- TABELA: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_url TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'workshop' CHECK (type IN ('workshop', 'course', 'ebook')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_affiliable INTEGER NOT NULL DEFAULT 1,
    affiliate_commission_pct REAL NOT NULL DEFAULT 40.00,
    is_published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);

-- ============================================================
-- TABELA: modules
-- ============================================================
CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    drip_days INTEGER NOT NULL DEFAULT 0,
    is_free INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_modules_product_id ON modules(product_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(product_id, sort_order);

-- ============================================================
-- TABELA: lessons
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('vimeo', 'youtube', 'pdf', 'text', 'quiz', 'video')),
    vimeo_id TEXT,
    youtube_url TEXT,
    video_url TEXT,
    file_url TEXT,
    duration_sec INTEGER NOT NULL DEFAULT 0,
    content_md TEXT,
    is_free INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(module_id, sort_order);

-- ============================================================
-- TABELA: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    affiliate_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL,
    coupon_id TEXT REFERENCES coupons(id) ON DELETE SET NULL,
    discount_cents INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'refunded', 'cancelled', 'rejected')),
    payment_proof_url TEXT,
    payment_reference TEXT,
    payment_method TEXT DEFAULT 'manual' CHECK (payment_method IN ('manual', 'stripe', 'pix')),
    notes TEXT,
    approved_at TEXT,
    approved_by TEXT REFERENCES users(id),
    rejected_at TEXT,
    rejection_reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_affiliate_id ON orders(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- ============================================================
-- TABELA: coupons
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INTEGER NOT NULL,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TEXT,
    valid_until TEXT,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_product_id ON coupons(product_id);

-- ============================================================
-- TABELA: order_coupons
-- ============================================================
CREATE TABLE IF NOT EXISTS order_coupons (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
    discount_cents INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_order_coupons_order_id ON order_coupons(order_id);
CREATE INDEX IF NOT EXISTS idx_order_coupons_coupon_id ON order_coupons(coupon_id);

-- ============================================================
-- TABELA: product_access
-- ============================================================
CREATE TABLE IF NOT EXISTS product_access (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    granted_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT,
    granted_by TEXT REFERENCES users(id),
    PRIMARY KEY (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_access_user ON product_access(user_id);
CREATE INDEX IF NOT EXISTS idx_product_access_product ON product_access(product_id);

-- ============================================================
-- TABELA: progress
-- ============================================================
CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    watched_sec INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);

-- ============================================================
-- TABELA: affiliates
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    commission_pct REAL NOT NULL DEFAULT 40.00,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    balance_pending_cents INTEGER NOT NULL DEFAULT 0,
    pix_key TEXT,
    pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone') OR pix_key_type IS NULL),
    bank_info TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
    is_active INTEGER NOT NULL DEFAULT 1,
    approved_at TEXT,
    approved_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- ============================================================
-- TABELA: affiliate_clicks
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id TEXT PRIMARY KEY,
    affiliate_id TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    visitor_fp TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    landing_url TEXT,
    clicked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_visitor_fp ON affiliate_clicks(visitor_fp);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);

-- ============================================================
-- TABELA: affiliate_conversions
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_conversions (
    id TEXT PRIMARY KEY,
    affiliate_id TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    visitor_fp TEXT NOT NULL,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    commission_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    confirmed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate_id ON affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_visitor_fp ON affiliate_conversions(visitor_fp);

-- ============================================================
-- TABELA: affiliate_withdrawals
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
    id TEXT PRIMARY KEY,
    affiliate_id TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'paid', 'rejected')),
    pix_key TEXT,
    pix_key_type TEXT,
    notes TEXT,
    requested_at TEXT NOT NULL DEFAULT (datetime('now')),
    approved_at TEXT,
    approved_by TEXT REFERENCES users(id),
    paid_at TEXT,
    paid_by TEXT REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_withdrawals_affiliate_id ON affiliate_withdrawals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_withdrawals_status ON affiliate_withdrawals(status);

-- ============================================================
-- TABELA: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('welcome', 'access_granted', 'announcement', 'system', 'info', 'success', 'warning', 'error')),
    link_url TEXT,
    read INTEGER NOT NULL DEFAULT 0,
    read_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================================
-- TABELA: pending_registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_registrations (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf TEXT UNIQUE,
    whatsapp TEXT NOT NULL,
    desired_product_id TEXT REFERENCES products(id),
    affiliate_code TEXT,
    payment_proof_url TEXT,
    payment_notes TEXT,
    status TEXT NOT NULL DEFAULT 'awaiting_proof' CHECK (status IN ('awaiting_proof', 'pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    reviewed_by TEXT REFERENCES users(id),
    reviewed_at TEXT,
    rejection_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_pending_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_registrations(status);

-- ============================================================
-- TABELA: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- ============================================================
-- TABELA: comments
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_lesson_id ON comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- ============================================================
-- TABELA: cohorts (turmas)
-- ============================================================
CREATE TABLE IF NOT EXISTS cohorts (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT,
    max_students INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cohorts_product_id ON cohorts(product_id);

-- ============================================================
-- TABELA: cohort_members
-- ============================================================
CREATE TABLE IF NOT EXISTS cohort_members (
    id TEXT PRIMARY KEY,
    cohort_id TEXT NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    UNIQUE(cohort_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort_id ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_user_id ON cohort_members(user_id);

-- ============================================================
-- TABELA: attachments (uploads base64)
-- ============================================================
CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    data TEXT NOT NULL,
    storage_type TEXT NOT NULL DEFAULT 'database' CHECK (storage_type IN ('database', 'external')),
    external_url TEXT,
    uploaded_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- ============================================================
-- TABELA: settings
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- TABELA: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================================
-- TABELA: password_resets
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- ============================================================
-- TABELA: errors (monitoramento)
-- ============================================================
CREATE TABLE IF NOT EXISTS errors (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    user_id TEXT REFERENCES users(id),
    url TEXT,
    user_agent TEXT,
    context TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_errors_created_at ON errors(created_at);
CREATE INDEX IF NOT EXISTS idx_errors_source ON errors(source);

-- ============================================================
-- SEED: Configurações iniciais
-- ============================================================
INSERT OR IGNORE INTO settings (key, value, description) VALUES
  ('site_name', 'WORKSHOP', 'Nome do site'),
  ('site_description', 'Plataforma de Workshops Online', 'Descrição do site'),
  ('support_email', '', 'Email de suporte'),
  ('support_whatsapp', '', 'WhatsApp de suporte'),
  ('max_devices_per_user', '2', 'Máximo de dispositivos por usuário'),
  ('registration_enabled', 'true', 'Cadastro aberto'),
  ('maintenance_mode', 'false', 'Modo manutenção'),
  ('default_commission_pct', '40', 'Comissão padrão de afiliados'),
  ('affiliate_cookie_days', '30', 'Dias de cookie de afiliado'),
  ('platform', '{"name":"WORKSHOP","subtitle":"Grupo Braga & Biano"}', 'Configurações gerais');

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
