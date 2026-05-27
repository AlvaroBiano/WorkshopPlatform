-- ============================================================
-- CRIAR USUÁRIO SUPER ADMIN
-- Álvaro Biano
-- ============================================================

-- Passo 1: Criar usuário no Supabase Auth
-- Execute este comando no SQL Editor do Supabase:

SELECT auth.create_user(
  'alvarobiano@workshop.com',
  'AeSm1979@#',
  true
);

-- Passo 2: Vincular o auth_id na tabela users
-- Após executar o comando acima, copie o ID retornado e execute:

UPDATE users 
SET 
  auth_id = (SELECT id FROM auth.users WHERE email = 'alvarobiano@workshop.com'),
  role = 'super_admin',
  is_active = true,
  first_login = false,
  must_change_password = false
WHERE email = 'alvarobiano@workshop.com';

-- Se o usuário não existir na tabela users, crie-o:
INSERT INTO users (
  auth_id,
  full_name,
  email,
  role,
  is_active,
  first_login,
  must_change_password
)
SELECT 
  id,
  'Álvaro Biano',
  email,
  'super_admin',
  true,
  false,
  false
FROM auth.users 
WHERE email = 'alvarobiano@workshop.com'
ON CONFLICT (email) DO UPDATE SET
  auth_id = EXCLUDED.auth_id,
  role = 'super_admin',
  is_active = true,
  first_login = false,
  must_change_password = false;

-- Passo 3: Verificar se tudo está correto
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  u.auth_id IS NOT NULL as has_auth
FROM users u
WHERE u.email = 'alvarobiano@workshop.com';
