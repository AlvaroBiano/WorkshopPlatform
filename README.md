# Workshop Platform - Grupo Braga & Biano

Plataforma completa de cursos online com sistema de afiliados, controle de dispositivos e área administrativa.

## 🚀 Stack Tecnológica

- **Frontend:** Astro 4 + React 18 + TypeScript
- **Styling:** TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Deploy:** Vercel (frontend) + Supabase Cloud (backend)
- **Video:** Vimeo / YouTube embeds

## 📋 Funcionalidades

### Área do Aluno
- ✅ Login com fingerprint de dispositivo (max 2 dispositivos)
- ✅ Biblioteca de cursos estilo Netflix
- ✅ Player de vídeo (Vimeo/YouTube)
- ✅ Progresso automático salvo
- ✅ Perfil e gestão de dispositivos
- ✅ Primeiro acesso com troca obrigatória de senha

### Área Administrativa
- ✅ Dashboard com KPIs
- ✅ Gestão de alunos (aprovar/banir)
- ✅ CRUD completo de produtos
- ✅ CRUD de módulos e aulas
- ✅ Gestão de dispositivos
- ✅ Sistema de afiliados
- ✅ Financeiro com filtros e exportação CSV
- ✅ Mensagens/notificações broadcast
- ✅ Configurações da plataforma

### Sistema de Afiliados
- ✅ Dashboard com métricas
- ✅ Link de referral com tracking
- ✅ Sistema de saques
- ✅ Comissões automáticas

## 🗂️ Estrutura do Projeto

```
WorkshopPlatform/
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React reutilizáveis
│   │   ├── layouts/         # Layouts Astro (Admin, Student, Auth)
│   │   ├── lib/             # Utilitários (Supabase, auth, fingerprint)
│   │   ├── middleware.ts    # Middleware de autenticação
│   │   ├── pages/           # Rotas da aplicação
│   │   │   ├── admin/       # Painel administrativo
│   │   │   ├── student/     # Área do aluno
│   │   │   ├── affiliate/   # Área do afiliado
│   │   │   └── *.astro      # Páginas públicas
│   │   └── styles/          # CSS global
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   └── package.json
├── supabase/
│   ├── migrations/          # Schema do banco
│   │   ├── 001_initial_schema.sql
│   │   └── 002_fixes.sql
│   ├── seed/                # Dados iniciais
│   │   └── 001_seed_data.sql
│   └── functions/           # Edge Functions
│       ├── login-with-fingerprint/
│       ├── approve-student/
│       └── generate-affiliate-link/
├── .env                     # Variáveis de ambiente (não commitar)
├── .env.example             # Template de variáveis
└── README.md
```

## 🔧 Instalação e Setup

### 1. Clonar o repositório

```bash
git clone <repo-url>
cd WorkshopPlatform
```

### 2. Configurar Supabase

#### 2.1 Criar projeto no Supabase
1. Acesse https://supabase.com
2. Crie um novo projeto
3. Anote as credenciais (URL, anon key, service role key)

#### 2.2 Executar migrations
No SQL Editor do Supabase, execute na ordem:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_fixes.sql`

#### 2.3 Executar seed (dados iniciais)
```sql
-- Execute no SQL Editor:
-- supabase/seed/001_seed_data.sql
```

#### 2.4 Criar usuários admin no Supabase Auth
1. Vá em **Authentication > Users**
2. Clique em **Add User** > **Create New User**
3. Crie o admin principal:
   - Email: `admin@grupobragabiano.com`
   - Password: (senha forte)
   - Auto Confirm User: ✅
4. Depois vincule ao registro na tabela `users`:
```sql
UPDATE users 
SET auth_id = '<auth-user-id>' 
WHERE email = 'admin@grupobragabiano.com';
```

#### 2.5 Deploy das Edge Functions
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref <your-project-ref>

# Deploy das functions
supabase functions deploy login-with-fingerprint
supabase functions deploy approve-student
supabase functions deploy generate-affiliate-link
```

### 3. Configurar Frontend

#### 3.1 Instalar dependências
```bash
cd frontend
npm install
```

#### 3.2 Configurar variáveis de ambiente
Copie `.env.example` para `.env` e preencha:
```bash
cp .env.example .env
```

Edite `.env`:
```env
PUBLIC_SUPABASE_URL=http://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PUBLIC_APP_NAME=WORKSHOP
PUBLIC_APP_SUBTITLE=Grupo Braga & Biano
PUBLIC_SITE_URL=http://localhost:4321
AFFILIATE_COOKIE_DAYS=30
VIMEO_ACCESS_TOKEN=
```

#### 3.3 Rodar localmente
```bash
npm run dev
```

Acesse: http://localhost:4321

### 4. Deploy para Produção

#### 4.1 Frontend (Vercel)

**Opção A: Deploy via CLI**
```bash
# Instalar Vercel CLI
npm install -g vercel

cd frontend
vercel --prod
```

**Opção B: Deploy via Dashboard**
1. Acesse https://vercel.com
2. Clique em **Add New Project**
3. Importe o repositório Git
4. Configure:
   - **Framework Preset:** Astro
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.vercel/output`
5. Adicione as variáveis de ambiente (ver item 4.2)
6. Clique em **Deploy**

#### 4.2 Configurar variáveis de ambiente na Vercel
No dashboard da Vercel:
1. Vá em **Settings > Environment Variables**
2. Adicione todas as variáveis do `.env`:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PUBLIC_APP_NAME`
   - `PUBLIC_APP_SUBTITLE`
   - `PUBLIC_SITE_URL` (use o domínio da Vercel)
   - `AFFILIATE_COOKIE_DAYS`
   - `VIMEO_ACCESS_TOKEN`
3. Faça redeploy após adicionar as variáveis

## 📝 Rotas da Aplicação

### Públicas
- `/` - Landing page
- `/login` - Login
- `/cadastro` - Cadastro público
- `/recuperar-senha` - Recuperação de senha
- `/first-access` - Primeiro acesso (troca de senha)

### Área do Aluno
- `/student` - Biblioteca de cursos
- `/student/course/[slug]` - Player do curso
- `/student/profile` - Perfil e dispositivos

### Área do Afiliado
- `/affiliate/dashboard` - Dashboard do afiliado

### Área Administrativa
- `/admin` - Dashboard admin
- `/admin/students` - Gestão de alunos
- `/admin/products` - Listagem de produtos
- `/admin/products/new` - Criar produto
- `/admin/products/[id]` - Editar produto
- `/admin/devices` - Gestão de dispositivos
- `/admin/affiliates` - Gestão de afiliados
- `/admin/financial` - Financeiro
- `/admin/messages` - Mensagens
- `/admin/settings` - Configurações

## 🔐 Segurança

- **Autenticação:** Supabase Auth com JWT
- **RLS (Row Level Security):** Todas as tabelas têm políticas de acesso
- **Fingerprint de dispositivo:** SHA-256 via Web Crypto API
- **Limite de dispositivos:** 2 por usuário (configurável)
- **Cookies httpOnly:** Tokens armazenados com segurança
- **Middleware server-side:** Verificação de auth em todas as rotas protegidas

## 🎨 Design System

### Cores
```css
--verde-principal: #0F5132
--verde-claro: #198754
--azul-profundo: #0A2540
--azul-accent: #1E88E5
--dourado: #D4AF37
--dourado-claro: #F1C40F
--bg-dark: #0A0E1A
--bg-card: #141B2D
--text-light: #E8E8E8
```

### Tipografia
- **Display:** Playfair Display (títulos)
- **Body:** Inter (texto geral)

## 📊 Banco de Dados

### Tabelas Principais
- `users` - Usuários (alunos, admins, afiliados)
- `products` - Produtos (workshops, cursos, ebooks)
- `modules` - Módulos dos produtos
- `lessons` - Aulas dos módulos
- `orders` - Pedidos de compra
- `product_access` - Acesso concedido aos alunos
- `progress` - Progresso do aluno por aula
- `devices` - Dispositivos registrados
- `affiliates` - Afiliados
- `affiliate_clicks` - Cliques em links de afiliado
- `affiliate_withdrawals` - Saques de afiliados
- `notifications` - Notificações internas
- `settings` - Configurações da plataforma
- `audit_log` - Logs de auditoria

## 🚀 Próximos Passos

### Funcionalidades Futuras
- [ ] Upload de vídeos diretamente para Supabase Storage
- [ ] Player de vídeo customizado com controles avançados
- [ ] Certificados de conclusão (PDF)
- [ ] Sistema de cupons de desconto
- [ ] Integração com gateway de pagamento (Stripe/Mercado Pago)
- [ ] Email automático (Resend/SendGrid)
- [ ] PWA (Progressive Web App)
- [ ] Modo Smart TV
- [ ] LGPD / Termos de uso
- [ ] Testes automatizados

### Melhorias Técnicas
- [ ] Adicionar testes unitários
- [ ] Implementar CI/CD completo
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics (Plausible/PostHog)
- [ ] Rate limiting nas APIs
- [ ] Cache de queries pesadas

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@grupobragabiano.com
- Issues: [GitHub Issues](link-do-repo)

## 📄 Licença

Todos os direitos reservados - Grupo Braga & Biano © 2024

---

**Desenvolvido com ❤️ por Grupo Braga & Biano**
