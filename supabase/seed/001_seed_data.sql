-- ============================================================
-- SEED: Dados Iniciais
-- Grupo Braga & Biano
-- ============================================================

-- ============================================================
-- ADMINISTRADORES
-- ============================================================
INSERT INTO users (id, full_name, email, role, is_active, first_login) VALUES
('00000000-0000-0000-0000-000000000001', 'Braga', 'admin@grupobragabiano.com', 'super_admin', true, false),
('00000000-0000-0000-0000-000000000002', 'Biano', 'bianho@grupobragabiano.com', 'admin', true, false);

-- ============================================================
-- PRODUTO: Workshop Principal R$ 397
-- ============================================================
INSERT INTO products (id, title, slug, description, price_cents, type, status, is_affiliable, affiliate_commission_pct, is_published) VALUES
('00000000-0000-0000-0000-000000000010',
 'Dominando a Arte: Workshop Premium',
 'dominando-a-arte-workshop-premium',
 'Workshop completo de alta transformação com 6 módulos e 32 aulas práticas.',
 39700,
 'workshop',
 'published',
 true,
 40.00,
 true);

-- ============================================================
-- MÓDULOS DO WORKSHOP
-- ============================================================
INSERT INTO modules (id, product_id, title, "order", drip_days) VALUES
-- Módulo 1: Fundamentos
('00000000-0000-0000-0000-000000000101',
 '00000000-0000-0000-0000-000000000010',
 'Módulo 1: Fundamentos Essenciais',
 1, 0),

-- Módulo 2: Técnicas Avançadas
('00000000-0000-0000-0000-000000000102',
 '00000000-0000-0000-0000-000000000010',
 'Módulo 2: Técnicas Avançadas',
 2, 7),

-- Módulo 3: Mentalidade
('00000000-0000-0000-0000-000000000103',
 '00000000-0000-0000-0000-000000000010',
 'Módulo 3: Mentalidade de Sucesso',
 3, 14),

-- Módulo 4: Comunicação
('00000000-0000-0000-0000-000000000104',
 '00000000-0000-0000-0000-000000000010',
 'Módulo 4: Comunicação e Influence',
 4, 21),

-- Módulo 5: Estratégia
('00000000-0000-0000-0000-000000000105',
 '00000000-0000-0000-0000-000000000010',
 'Módulo 5: Estratégia e Crescimento',
 5, 28),

-- Módulo 6: Bônus
('00000000-0000-0000-0000-000000000106',
 '00000000-0000-0000-0000-000000000010',
 'Módulo 6: Conteúdo Bônus',
 6, 35);

-- ============================================================
-- AULAS DO MÓDULO 1 (Fundamentos) - 6 aulas
-- ============================================================
INSERT INTO lessons (id, module_id, title, "order", type, duration_sec, is_free) VALUES
('00000000-0000-0000-0000-000000000201',
 '00000000-0000-0000-0000-000000000101',
 'Aula 1: Apresentação do Workshop',
 1, 'youtube', 720, true),
('00000000-0000-0000-0000-000000000202',
 '00000000-0000-0000-0000-000000000101',
 'Aula 2: O Que Você Vai Aprender',
 2, 'youtube', 900, true),
('00000000-0000-0000-0000-000000000203',
 '00000000-0000-0000-0000-000000000101',
 'Aula 3: Sua Mentalidade Atual',
 3, 'vimeo', 840, false),
('00000000-0000-0000-0000-000000000204',
 '00000000-0000-0000-0000-000000000101',
 'Aula 4: Definindo Seus Objetivos',
 4, 'vimeo', 960, false),
('00000000-0000-0000-0000-000000000205',
 '00000000-0000-0000-0000-000000000101',
 'Aula 5: O Poder do Hábito',
 5, 'vimeo', 1080, false),
('00000000-0000-0000-0000-000000000206',
 '00000000-0000-0000-0000-000000000101',
 'Aula 6: Exercício Prático - Dia 1',
 6, 'pdf', 0, false);

-- ============================================================
-- AULAS DO MÓDULO 2 (Técnicas) - 6 aulas
-- ============================================================
INSERT INTO lessons (id, module_id, title, "order", type, duration_sec) VALUES
('00000000-0000-0000-0000-000000000207',
 '00000000-0000-0000-0000-000000000102',
 'Aula 7: Técnica de Foco Absoluto',
 1, 'vimeo', 900),
('00000000-0000-0000-0000-000000000208',
 '00000000-0000-0000-0000-000000000102',
 'Aula 8: Gestão de Tempo',
 2, 'vimeo', 840),
('00000000-0000-0000-0000-000000000209',
 '00000000-0000-0000-0000-000000000102',
 'Aula 9: Eliminando Distrações',
 3, 'vimeo', 780),
('00000000-0000-0000-0000-000000000210',
 '00000000-0000-0000-0000-000000000102',
 'Aula 10: Ritmo de Aprendizagem',
 4, 'vimeo', 960),
('00000000-0000-0000-0000-000000000211',
 '00000000-0000-0000-0000-000000000102',
 'Aula 11: Prática Dirigida',
 5, 'vimeo', 1200),
('00000000-0000-0000-0000-000000000212',
 '00000000-0000-0000-0000-000000000102',
 'Aula 12: Exercício Prático - Dia 2',
 6, 'pdf', 0);

-- ============================================================
-- AULAS DO MÓDULO 3 (Mentalidade) - 6 aulas
-- ============================================================
INSERT INTO lessons (id, module_id, title, "order", type, duration_sec) VALUES
('00000000-0000-0000-0000-000000000213',
 '00000000-0000-0000-0000-000000000103',
 'Aula 13: Neuroplasticidade',
 1, 'vimeo', 900),
('00000000-0000-0000-0000-000000000214',
 '00000000-0000-0000-0000-000000000103',
 'Aula 14: Crenças Limitantes',
 2, 'vimeo', 1080),
('00000000-0000-0000-0000-000000000215',
 '00000000-0000-0000-0000-000000000103',
 'Aula 15: Reprogramação Mental',
 3, 'vimeo', 1200),
('00000000-0000-0000-0000-000000000216',
 '00000000-0000-0000-0000-000000000103',
 'Aula 16: Autodisciplina',
 4, 'vimeo', 840),
('00000000-0000-0000-0000-000000000217',
 '00000000-0000-0000-0000-000000000103',
 'Aula 17: Resiliência',
 5, 'vimeo', 960),
('00000000-0000-0000-0000-000000000218',
 '00000000-0000-0000-0000-000000000103',
 'Aula 18: Exercício Prático - Dia 3',
 6, 'pdf', 0);

-- ============================================================
-- AULAS DO MÓDULO 4 (Comunicação) - 6 aulas
-- ============================================================
INSERT INTO lessons (id, module_id, title, "order", type, duration_sec) VALUES
('00000000-0000-0000-0000-000000000219',
 '00000000-0000-0000-0000-000000000104',
 'Aula 19: Comunicação Eficaz',
 1, 'vimeo', 900),
('00000000-0000-0000-0000-000000000220',
 '00000000-0000-0000-0000-000000000104',
 'Aula 20: Linguagem Corporal',
 2, 'vimeo', 840),
('00000000-0000-0000-0000-000000000221',
 '00000000-0000-0000-0000-000000000104',
 'Aula 21: Rapport e Conexão',
 3, 'vimeo', 960),
('00000000-0000-0000-0000-000000000222',
 '00000000-0000-0000-0000-000000000104',
 'Aula 22: Storytelling',
 4, 'vimeo', 1080),
('00000000-0000-0000-0000-000000000223',
 '00000000-0000-0000-0000-000000000104',
 'Aula 23: Negociação',
 5, 'vimeo', 1200),
('00000000-0000-0000-0000-000000000224',
 '00000000-0000-0000-0000-000000000104',
 'Aula 24: Exercício Prático - Dia 4',
 6, 'pdf', 0);

-- ============================================================
-- AULAS DO MÓDULO 5 (Estratégia) - 5 aulas
-- ============================================================
INSERT INTO lessons (id, module_id, title, "order", type, duration_sec) VALUES
('00000000-0000-0000-0000-000000000225',
 '00000000-0000-0000-0000-000000000105',
 'Aula 25: Planejamento Estratégico',
 1, 'vimeo', 1080),
('00000000-0000-0000-0000-000000000226',
 '00000000-0000-0000-0000-000000000105',
 'Aula 26: Metas e Sistemas',
 2, 'vimeo', 900),
('00000000-0000-0000-0000-000000000227',
 '00000000-0000-0000-0000-000000000105',
 'Aula 27: Escalabilidade',
 3, 'vimeo', 1200),
('00000000-0000-0000-0000-000000000228',
 '00000000-0000-0000-0000-000000000105',
 'Aula 28: Automação',
 4, 'vimeo', 960),
('00000000-0000-0000-0000-000000000229',
 '00000000-0000-0000-0000-000000000105',
 'Aula 29: Exercício Prático - Dia 5',
 5, 'pdf', 0);

-- ============================================================
-- AULAS DO MÓDULO 6 (Bônus) - 3 aulas
-- ============================================================
INSERT INTO lessons (id, module_id, title, "order", type, duration_sec) VALUES
('00000000-0000-0000-0000-000000000230',
 '00000000-0000-0000-0000-000000000106',
 'Aula 30: Bônus Especial - Entrevista',
 1, 'vimeo', 1800),
('00000000-0000-0000-0000-000000000231',
 '00000000-0000-0000-0000-000000000106',
 'Aula 31: Material Complementar',
 2, 'pdf', 0),
('00000000-0000-0000-0000-000000000232',
 '00000000-0000-0000-0000-000000000106',
 'Aula 32: Considerações Finais e Próximos Passos',
 3, 'vimeo', 1200);

-- ============================================================
-- AFILIADO DE EXEMPLO
-- ============================================================
INSERT INTO users (id, full_name, email, role, is_active) VALUES
('00000000-0000-0000-0000-000000000003', 'Afiliado Exemplo', 'afiliado@exemplo.com', 'affiliate', true);

INSERT INTO affiliates (id, user_id, code, commission_pct, status, approved_at, approved_by) VALUES
('00000000-0000-0000-0000-000000000020',
 '00000000-0000-0000-0000-000000000003',
 'EXEMPLO20',
 40.00,
 'active',
 NOW(),
 '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- ATUALIZAÇÕES NECESSÁRIAS:
-- 1. Configurar variável de ambiente SUPABASE_URL no .env
-- 2. Configurar variável de ambiente SUPABASE_SERVICE_ROLE_KEY no .env
-- 3. No Supabase Dashboard, criar manualmente os usuários admin
--    com senhabcryptificada via Auth > Users
-- 4. Adicionar capa (cover_url) ao produto via Admin Panel
-- ============================================================