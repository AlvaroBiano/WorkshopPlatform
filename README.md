# WORKSHOP Platform

Plataforma completa de workshops/cursos com Turso (SQLite) + Vercel + Astro 5.

## Stack

- **Astro 5** + Tailwind CSS (SSR mode com Vercel adapter)
- **Turso** (libSQL/SQLite) - banco de dados
- **JWT** + bcrypt - autenticação
- **Astro middleware** - proteção de rotas

## Variáveis de ambiente

Crie um `.env` em `frontend/`:

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
JWT_SECRET=<32-char-random-string>
PUBLIC_APP_NAME=WORKSHOP
PUBLIC_APP_SUBTITLE=Grupo Braga & Biano
PUBLIC_SITE_URL=https://your-domain.com
```

## Setup local

```bash
# 1. Instalar dependências
cd frontend
npm install

# 2. Rodar migração no Turso
turso db shell workshop-platform < ../supabase/migrations/005_sqlite_unified.sql

# 3. Criar admin
npm run db:seed-admin
# Email: alvarobiano@workshop.com
# Senha: AeSm1979@#

# 4. (Opcional) Criar produto demo
npm run db:seed-demo

# 5. Dev server
npm run dev
```

## Deploy (Vercel)

1. Configure as envs no painel do Vercel
2. Root Directory: deixe vazio
3. Build: automático (vercel.json)
4. Output: frontend/.vercel/output

## Estrutura

```
/admin         - Painel administrativo
/student       - Área do aluno
/affiliate     - Painel do afiliado
/api           - Endpoints públicos
/admin/api     - Endpoints admin
/student/api   - Endpoints aluno
/affiliate/api - Endpoints afiliado
/produto/[slug] - Página pública do produto
/checkout/[slug] - Checkout
```

## Features implementadas

- Autenticação JWT (login/logout/recuperação)
- 3 perfis: admin, aluno, afiliado
- 22 tabelas no banco (produtos, módulos, aulas, pedidos, comissões, etc)
- Cupons de desconto com regras de uso
- Afiliados com comissões automáticas
- Reviews com moderação
- Comentários em aulas
- Turmas (cohorts)
- Notificações real-time (polling 30s)
- Health check em /api/health
- Sitemap dinâmico em /sitemap.xml
- robots.txt
- Open Graph + Twitter cards
- Audit log de ações admin
```

## Tarefas restantes (não críticas)

- [ ] Drag-and-drop visual para reorder de módulos/aulas (UI está pronta, falta polish)
- [ ] Upload de imagem para capa do produto (storage S3/R2)
- [ ] Stripe checkout
- [ ] Email transacional (Resend/SendGrid)
- [ ] Painel de health check com erros recentes
