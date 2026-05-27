-- ============================================================
-- WORKSHOP Platform - Migration 002: Correções Críticas
-- Grupo Braga & Biano
-- ============================================================

-- ============================================================
-- 1. CORRIGIR ENUM lesson_type (adicionar 'video')
-- ============================================================
ALTER TYPE lesson_type ADD VALUE IF NOT EXISTS 'video';

-- ============================================================
-- 2. ADICIONAR auth_id NA TABELA users
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- ============================================================
-- 3. CORRIGIR notifications (read -> read_at)
-- ============================================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

UPDATE notifications SET read_at = NOW() WHERE read = true AND read_at IS NULL;

-- ============================================================
-- 4. CRIAR TABELA pending_registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    whatsapp TEXT NOT NULL,
    desired_product_id UUID REFERENCES products(id),
    affiliate_code TEXT,
    payment_proof_url TEXT,
    payment_notes TEXT,
    status TEXT DEFAULT 'awaiting_proof',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_pending_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_registrations(status);

ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert pending registrations"
    ON pending_registrations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view all pending registrations"
    ON pending_registrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update pending registrations"
    ON pending_registrations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================
-- 5. CORRIGIR RLS POLICIES (usar auth_id em vez de id direto)
-- ============================================================

-- Drop policies antigas
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can view own devices" ON devices;
DROP POLICY IF EXISTS "Users can register own devices" ON devices;
DROP POLICY IF EXISTS "Admins can view all devices" ON devices;
DROP POLICY IF EXISTS "Admins can manage devices" ON devices;
DROP POLICY IF EXISTS "Users can view own access" ON product_access;
DROP POLICY IF EXISTS "Admins can manage access" ON product_access;
DROP POLICY IF EXISTS "Users can view own progress" ON progress;
DROP POLICY IF EXISTS "Users can update own progress" ON progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON progress;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Users can view own affiliate" ON affiliates;
DROP POLICY IF EXISTS "Admins can manage affiliates" ON affiliates;

-- Criar novas policies com auth_id
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

-- ============================================================
-- 6. ADICIONAR POLICIES PARA MÓDULOS E AULAS (alunos podem ver)
-- ============================================================
DROP POLICY IF EXISTS "Admins only" ON modules;
DROP POLICY IF EXISTS "Admins only" ON lessons;

CREATE POLICY "Anyone with access can view modules"
    ON modules FOR SELECT
    USING (true);

CREATE POLICY "Anyone with access can view lessons"
    ON lessons FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage modules"
    ON modules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can manage lessons"
    ON lessons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================================
-- 7. CORRIGIR TRIGGER check_device_limit
-- ============================================================
DROP TRIGGER IF EXISTS tr_check_device_limit ON devices;

CREATE OR REPLACE FUNCTION check_device_limit()
RETURNS TRIGGER AS $$
DECLARE
    max_devices INTEGER := 2;
    current_count INTEGER;
    setting_value JSONB;
BEGIN
    SELECT value INTO setting_value
    FROM settings WHERE key = 'platform';
    
    IF setting_value IS NOT NULL AND setting_value ? 'max_devices_per_user' THEN
        max_devices = (setting_value->>'max_devices_per_user')::INTEGER;
    END IF;
    
    SELECT COUNT(*) INTO current_count
    FROM devices
    WHERE user_id = NEW.user_id AND is_blocked = false AND is_approved = true;
    
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

-- ============================================================
-- 8. FUNÇÃO: Aprovar registro pendente
-- ============================================================
CREATE OR REPLACE FUNCTION approve_pending_registration(
    p_pending_id UUID,
    p_approved_by UUID
)
RETURNS UUID AS $$
DECLARE
    v_pending RECORD;
    v_user_id UUID;
    v_auth_user_id UUID;
BEGIN
    SELECT * INTO v_pending FROM pending_registrations WHERE id = p_pending_id;
    
    IF v_pending IS NULL THEN
        RAISE EXCEPTION 'Registro pendente não encontrado';
    END IF;
    
    INSERT INTO users (full_name, email, whatsapp, role, is_active, first_login, must_change_password)
    VALUES (v_pending.full_name, v_pending.email, v_pending.whatsapp, 'student', true, true, true)
    RETURNING id INTO v_user_id;
    
    UPDATE pending_registrations
    SET status = 'approved', reviewed_by = p_approved_by, reviewed_at = NOW()
    WHERE id = p_pending_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
