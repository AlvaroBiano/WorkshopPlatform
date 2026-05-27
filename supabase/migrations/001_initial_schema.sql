-- ============================================================
-- WORKSHOP Platform - Schema Completo
-- Grupo Braga & Biano
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('student', 'admin', 'super_admin', 'support', 'affiliate');
CREATE TYPE product_type AS ENUM ('workshop', 'course', 'ebook');
CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE order_status AS ENUM ('pending', 'approved', 'refunded', 'cancelled');
CREATE TYPE affiliate_status AS ENUM ('pending', 'active', 'blocked');
CREATE TYPE withdrawal_status AS ENUM ('requested', 'approved', 'paid', 'rejected');
CREATE TYPE lesson_type AS ENUM ('vimeo', 'youtube', 'pdf', 'text', 'quiz', 'video');
CREATE TYPE notification_type AS ENUM ('welcome', 'access_granted', 'announcement', 'system');

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf_hash TEXT,
    whatsapp TEXT,
    role user_role DEFAULT 'student',
    avatar_url TEXT,
    first_login BOOLEAN DEFAULT true,
    must_change_password BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    banned_at TIMESTAMPTZ,
    ban_reason TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- ============================================================
-- DEVICES (controle de acesso por dispositivo)
-- ============================================================
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    os TEXT,
    browser TEXT,
    ip_last_login TEXT,
    is_approved BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, device_fingerprint)
);

CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_fingerprint ON devices(device_fingerprint);

-- ============================================================
-- SESSIONS
-- ============================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    token_hash TEXT NOT NULL,
    refresh_token_hash TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================
-- PRODUCTS (Workshops/Cursos/Ebooks)
-- ============================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_url TEXT,
    price_cents INTEGER DEFAULT 0,
    type product_type DEFAULT 'workshop',
    status product_status DEFAULT 'draft',
    is_affiliable BOOLEAN DEFAULT true,
    affiliate_commission_pct NUMERIC(5,2) DEFAULT 40.00,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_type ON products(type);

-- ============================================================
-- MODULES (módulos dentro de um produto)
-- ============================================================
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    drip_days INTEGER DEFAULT 0, -- dias para liberar após compra
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_modules_product_id ON modules(product_id);
CREATE INDEX idx_modules_order ON modules(product_id, "order");

-- ============================================================
-- LESSONS (aulas dentro de um módulo)
-- ============================================================
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    type lesson_type DEFAULT 'video',
    vimeo_id TEXT,
    youtube_url TEXT,
    file_url TEXT,
    duration_sec INTEGER DEFAULT 0,
    content_md TEXT,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_order ON lessons(module_id, "order");

-- ============================================================
-- ORDERS (compras)
-- ============================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    affiliate_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL,
    status order_status DEFAULT 'pending',
    payment_proof_url TEXT,
    payment_reference TEXT,
    notes TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_affiliate_id ON orders(affiliate_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ============================================================
-- PRODUCT_ACCESS (acesso concedido ao aluno)
-- ============================================================
CREATE TABLE product_access (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- null = vitalício
    granted_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, product_id)
);

-- ============================================================
-- PROGRESS (progresso do aluno por aula)
-- ============================================================
CREATE TABLE progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    watched_sec INTEGER DEFAULT 0,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);

-- ============================================================
-- AFFILIATES
-- ============================================================
CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    commission_pct NUMERIC(5,2) DEFAULT 40.00,
    balance_cents BIGINT DEFAULT 0,
    balance_pending_cents BIGINT DEFAULT 0,
    pix_key TEXT,
    pix_key_type TEXT, -- 'cpf', 'cnpj', 'email', 'phone'
    bank_info JSONB,
    status affiliate_status DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_code ON affiliates(code);
CREATE INDEX idx_affiliates_status ON affiliates(status);

-- ============================================================
-- AFFILIATE_CLICKS (rastreamento de cliques)
-- ============================================================
CREATE TABLE affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    visitor_fp TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    landing_url TEXT,
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_visitor_fp ON affiliate_clicks(visitor_fp);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);

-- ============================================================
-- AFFILIATE_CONVERSIONS (vendas rastreadas)
-- ============================================================
CREATE TABLE affiliate_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    visitor_fp TEXT NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    commission_cents INTEGER NOT NULL,
    status order_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_affiliate_conversions_affiliate_id ON affiliate_conversions(affiliate_id);
CREATE INDEX idx_affiliate_conversions_visitor_fp ON affiliate_conversions(visitor_fp);

-- ============================================================
-- AFFILIATE_WITHDRAWALS (saques)
-- ============================================================
CREATE TABLE affiliate_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    status withdrawal_status DEFAULT 'requested',
    pix_key TEXT,
    pix_key_type TEXT,
    notes TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    paid_at TIMESTAMPTZ,
    paid_by UUID REFERENCES users(id)
);

CREATE INDEX idx_affiliate_withdrawals_affiliate_id ON affiliate_withdrawals(affiliate_id);
CREATE INDEX idx_affiliate_withdrawals_status ON affiliate_withdrawals(status);

-- ============================================================
-- NOTIFICATIONS (notificações internas)
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    type notification_type DEFAULT 'system',
    link_url TEXT,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================
-- SETTINGS (configurações globais)
-- ============================================================
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT_LOG (logs de auditoria admin)
-- ============================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função: Verificar limite de dispositivos
CREATE OR REPLACE FUNCTION check_device_limit()
RETURNS TRIGGER AS $$
DECLARE
    max_devices INTEGER := 2;
    current_count INTEGER;
    setting_value JSONB;
BEGIN
    -- Busca configuração global
    SELECT value->>'max_devices_per_user' INTO setting_value
    FROM settings WHERE key = 'platform';
    
    IF setting_value IS NOT NULL THEN
        max_devices = (setting_value->>'max_devices')::INTEGER;
    END IF;
    
    -- Conta dispositivos ativos
    SELECT COUNT(*) INTO current_count
    FROM devices
    WHERE user_id = NEW.user_id AND is_blocked = false;
    
    IF current_count >= max_devices THEN
        RAISE EXCEPTION 'Limite de dispositivos atingido. Máximo: %', max_devices;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_check_device_limit
    BEFORE INSERT ON devices
    FOR EACH ROW
    WHEN (NEW.is_approved = true)
    EXECUTE FUNCTION check_device_limit();

-- Função: Criar acesso ao produto após aprovação
CREATE OR REPLACE FUNCTION grant_product_access(
    p_user_id UUID,
    p_product_id UUID,
    p_granted_by UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO product_access (user_id, product_id, granted_by)
    VALUES (p_user_id, p_product_id, p_granted_by)
    ON CONFLICT (user_id, product_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Função: Atualizar progresso
CREATE OR REPLACE FUNCTION update_lesson_progress(
    p_user_id UUID,
    p_lesson_id UUID,
    p_watched_sec INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO progress (user_id, lesson_id, watched_sec, last_seen_at, completed)
    VALUES (p_user_id, p_lesson_id, p_watched_sec, NOW(), false)
    ON CONFLICT (user_id, lesson_id)
    DO UPDATE SET
        watched_sec = GREATEST(progress.watched_sec, p_watched_sec),
        last_seen_at = NOW(),
        completed = CASE WHEN progress.watched_sec >= lessons.duration_sec * 0.9 THEN true ELSE progress.completed END
    FROM lessons WHERE lessons.id = p_lesson_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Criar notificação
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_body TEXT,
    p_type notification_type DEFAULT 'system'
)
RETURNS UUID AS $$
DECLARE
    notif_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, body, type)
    VALUES (p_user_id, p_title, p_body, p_type)
    RETURNING id INTO notif_id;
    
    RETURN notif_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Registrar clique de afiliado
CREATE OR REPLACE FUNCTION register_affiliate_click(
    p_affiliate_id UUID,
    p_visitor_fp TEXT,
    p_ip TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    click_id UUID;
BEGIN
    INSERT INTO affiliate_clicks (affiliate_id, visitor_fp, ip, user_agent, referrer)
    VALUES (p_affiliate_id, p_visitor_fp, p_ip, p_user_agent, p_referrer)
    RETURNING id INTO click_id;
    
    RETURN click_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Calcular e creditar comissão de afiliado
CREATE OR REPLACE FUNCTION credit_affiliate_commission(
    p_order_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_order RECORD;
    v_affiliate RECORD;
    v_commission_cents INTEGER;
    v_product RECORD;
BEGIN
    -- Busca pedido
    SELECT o.*, p.is_affiliable, p.affiliate_commission_pct
    INTO v_order
    FROM orders o
    JOIN products p ON p.id = o.product_id
    WHERE o.id = p_order_id;
    
    IF v_order.affiliate_id IS NULL OR v_order.is_affiliable = false THEN
        RETURN;
    END IF;
    
    -- Calcula comissão
    v_commission_cents = (v_order.amount_cents * v_order.affiliate_commission_pct::NUMERIC / 100)::INTEGER;
    
    -- Busca afiliado
    SELECT * INTO v_affiliate FROM affiliates WHERE user_id = v_order.affiliate_id;
    
    -- Credita como pendente
    UPDATE affiliates
    SET balance_pending_cents = balance_pending_cents + v_commission_cents
    WHERE id = v_affiliate.id;
    
    -- Registra conversão
    INSERT INTO affiliate_conversions (affiliate_id, visitor_fp, order_id, commission_cents, status)
    VALUES (
        v_affiliate.id,
        COALESCE((SELECT device_fingerprint FROM devices WHERE user_id = v_order.user_id ORDER BY registered_at DESC LIMIT 1), 'unknown'),
        p_order_id,
        v_commission_cents,
        'pending'
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth_id = auth.uid());

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Devices
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
    ON devices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = devices.user_id
        )
    );

CREATE POLICY "Users can register own devices"
    ON devices FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = devices.user_id
        )
    );

CREATE POLICY "Admins can view all devices"
    ON devices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can manage devices"
    ON devices FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products"
    ON products FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Product Access
ALTER TABLE product_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access"
    ON product_access FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = product_access.user_id
        )
    );

CREATE POLICY "Admins can manage access"
    ON product_access FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Progress
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
    ON progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = progress.user_id
        )
    );

CREATE POLICY "Users can update own progress"
    ON progress FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = progress.user_id
        )
    );

CREATE POLICY "Users can insert own progress"
    ON progress FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = progress.user_id
        )
    );

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = notifications.user_id
        )
    );

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = notifications.user_id
        )
    );

CREATE POLICY "Admins can manage all notifications"
    ON notifications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = orders.user_id
        )
    );

CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can manage orders"
    ON orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Affiliates
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate"
    ON affiliates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = affiliates.user_id
        )
    );

CREATE POLICY "Admins can manage affiliates"
    ON affiliates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- All other tables - admins only
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules" ON modules FOR SELECT
    USING (true);
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT
    USING (true);
CREATE POLICY "Admins can manage modules" ON modules FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins only" ON affiliate_clicks FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Affiliates can view own clicks" ON affiliate_clicks FOR SELECT
    USING (EXISTS (SELECT 1 FROM affiliates WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND id = affiliate_clicks.affiliate_id));
CREATE POLICY "Admins only" ON affiliate_conversions FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins only" ON affiliate_withdrawals FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Affiliates can view own withdrawals" ON affiliate_withdrawals FOR SELECT
    USING (EXISTS (SELECT 1 FROM affiliates WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid()) AND id = affiliate_withdrawals.affiliate_id));
CREATE POLICY "Admins only" ON settings FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins only" ON audit_log FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')));

-- ============================================================
-- SEED: Configurações iniciais
-- ============================================================
INSERT INTO settings (key, value, description) VALUES
('platform', '{"name": "WORKSHOP", "subtitle": "Grupo Braga & Biano", "max_devices_per_user": 2, "affiliate_cookie_days": 30, "commission_quarantine_days": 7}', 'Configurações gerais da plataforma'),
('colors', '{"verde_principal": "#0F5132", "verde_claro": "#198754", "azul_profundo": "#0A2540", "azul_accent": "#1E88E5", "dourado": "#D4AF37", "dourado_claro": "#F1C40F", "bg_dark": "#0A0E1A", "bg_card": "#141B2D", "text_light": "#E8E8E8"}', 'Paleta de cores da identidade visual');