# SPEC - Sistema de Administração Workshop Platform

## Visão Geral
Este documento especifica a implementação completa de todas as sessões internas do painel administrativo, incluindo estrutura de dados, endpoints da API, componentes de interface e regras de negócio.

---

## 1. SISTEMA DE LOGOUT

### 1.1 Funcionalidade
- Invalidar sessão do usuário
- Limpar cookies de autenticação
- Redirecionar para página de login

### 1.2 Implementação

#### Arquivo: `src/pages/logout.astro`
```typescript
---
import { db } from '../lib/turso'

const token = Astro.cookies.get('sb-access-token')?.value

if (token) {
  // Opcional: registrar logout no banco
  // await db.execute('UPDATE users SET last_logout_at = datetime("now") WHERE id = ?', [userId])
}

// Limpar cookies
Astro.cookies.delete('sb-access-token', { path: '/' })
Astro.cookies.delete('sb-refresh-token', { path: '/' })

return Astro.redirect('/login')
---
```

---

## 2. GESTÃO DE ALUNOS (/admin/students)

### 2.1 Estrutura de Dados

#### Tabela: `users` (já existe)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  is_active INTEGER NOT NULL DEFAULT 1,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  banned_at TEXT,
  ban_reason TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 2.2 Endpoints da API

#### GET `/admin/api/students`
**Descrição:** Listar todos os alunos com paginação e filtros

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (opcional) - busca por nome ou email
- `status` (opcional) - `active`, `inactive`, `banned`
- `sort` (default: `created_at`)
- `order` (default: `desc`)

**Response:**
```json
{
  "students": [
    {
      "id": "uuid",
      "email": "aluno@email.com",
      "full_name": "Nome do Aluno",
      "is_active": true,
      "banned_at": null,
      "last_login_at": "2026-05-27 10:00:00",
      "created_at": "2026-05-20 15:30:00",
      "products_count": 2
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

#### POST `/admin/api/students`
**Descrição:** Criar novo aluno

**Request Body:**
```json
{
  "email": "novo@email.com",
  "password": "senha123",
  "full_name": "Nome Completo",
  "must_change_password": true
}
```

**Response:**
```json
{
  "success": true,
  "student": { "id": "uuid", ... }
}
```

#### PUT `/admin/api/students/[id]`
**Descrição:** Atualizar dados do aluno

**Request Body:**
```json
{
  "full_name": "Novo Nome",
  "email": "novo@email.com",
  "is_active": true,
  "must_change_password": false
}
```

#### POST `/admin/api/students/[id]/ban`
**Descrição:** Banir aluno

**Request Body:**
```json
{
  "reason": "Violação dos termos de uso"
}
```

#### POST `/admin/api/students/[id]/unban`
**Descrição:** Desbanir aluno

#### DELETE `/admin/api/students/[id]`
**Descrição:** Remover aluno (soft delete - marcar como inativo)

### 2.3 Interface

#### Componentes:
1. **Tabela de Alunos**
   - Colunas: Nome, Email, Status, Último Login, Data Cadastro, Ações
   - Filtros: Busca, Status
   - Paginação
   - Ordenação por coluna

2. **Modal de Criação/Edição**
   - Formulário com campos: Nome, Email, Senha (apenas criação)
   - Checkbox: "Forçar troca de senha no primeiro login"
   - Validações: email único, senha mínima 8 caracteres

3. **Modal de Banimento**
   - Campo: Motivo do banimento (obrigatório)
   - Confirmação

4. **Cards de Estatísticas**
   - Total de alunos
   - Alunos ativos
   - Alunos banidos
   - Novos alunos (últimos 7 dias)

---

## 3. GESTÃO DE PRODUTOS (/admin/products)

### 3.1 Estrutura de Dados

#### Tabela: `products`
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'course',
  status TEXT NOT NULL DEFAULT 'draft',
  is_affiliable INTEGER NOT NULL DEFAULT 0,
  affiliate_commission_pct REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### Tabela: `modules`
```sql
CREATE TABLE modules (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### Tabela: `lessons`
```sql
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  video_url TEXT,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);
```

### 3.2 Endpoints da API

#### GET `/admin/api/products`
**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "title": "Workshop Mentalidade Financeira",
      "slug": "workshop-mentalidade-financeira",
      "price_cents": 39700,
      "type": "course",
      "status": "published",
      "modules_count": 5,
      "lessons_count": 25,
      "students_count": 150,
      "created_at": "2026-05-01 10:00:00"
    }
  ]
}
```

#### POST `/admin/api/products`
**Request Body:**
```json
{
  "title": "Novo Workshop",
  "description": "Descrição completa",
  "price_cents": 49700,
  "type": "course",
  "status": "draft",
  "cover_url": "https://...",
  "is_affiliable": true,
  "affiliate_commission_pct": 40
}
```

#### GET `/admin/api/products/[id]`
**Response:** Produto completo com módulos e aulas

#### PUT `/admin/api/products/[id]`
**Descrição:** Atualizar produto

#### DELETE `/admin/api/products/[id]`
**Descrição:** Remover produto (cascade delete modules e lessons)

#### POST `/admin/api/products/[id]/publish`
**Descrição:** Publicar produto

#### POST `/admin/api/products/[id]/unpublish`
**Descrição:** Despublicar produto

### 3.3 Gestão de Módulos

#### POST `/admin/api/products/[productId]/modules`
**Request Body:**
```json
{
  "title": "Módulo 1 - Introdução",
  "sort_order": 1
}
```

#### PUT `/admin/api/products/[productId]/modules/[moduleId]`
**Descrição:** Atualizar módulo

#### DELETE `/admin/api/products/[productId]/modules/[moduleId]`
**Descrição:** Remover módulo (cascade delete lessons)

#### PUT `/admin/api/products/[productId]/modules/reorder`
**Request Body:**
```json
{
  "module_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### 3.4 Gestão de Aulas

#### POST `/admin/api/products/[productId]/modules/[moduleId]/lessons`
**Request Body:**
```json
{
  "title": "Aula 1 - Boas-vindas",
  "video_url": "https://vimeo.com/123456",
  "duration_sec": 300,
  "sort_order": 1
}
```

#### PUT `/admin/api/products/[productId]/modules/[moduleId]/lessons/[lessonId]`
**Descrição:** Atualizar aula

#### DELETE `/admin/api/products/[productId]/modules/[moduleId]/lessons/[lessonId]`
**Descrição:** Remover aula

#### PUT `/admin/api/products/[productId]/modules/[moduleId]/lessons/reorder`
**Request Body:**
```json
{
  "lesson_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### 3.5 Interface

#### Lista de Produtos
- Cards com: Capa, Título, Preço, Status, Módulos, Alunos
- Filtros: Status, Tipo
- Botão: "Novo Produto"

#### Editor de Produto
- **Aba 1: Informações Gerais**
  - Título, Slug (auto-gerado), Descrição
  - Preço, Tipo, Status
  - Upload de capa
  - Configurações de afiliado

- **Aba 2: Conteúdo**
  - Lista de módulos (drag & drop para reordenar)
  - Dentro de cada módulo: lista de aulas (drag & drop)
  - Botões: "Adicionar Módulo", "Adicionar Aula"
  - Para cada aula: título, URL do vídeo, duração

- **Aba 3: Alunos**
  - Lista de alunos com acesso ao produto
  - Botão: "Adicionar Aluno" (busca por email)

---

## 4. GESTÃO DE DISPOSITIVOS (/admin/devices)

### 4.1 Estrutura de Dados

#### Tabela: `devices`
```sql
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  is_approved INTEGER NOT NULL DEFAULT 1,
  registered_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, fingerprint)
);
```

### 4.2 Endpoints da API

#### GET `/admin/api/devices`
**Response:**
```json
{
  "devices": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_name": "Nome do Aluno",
      "user_email": "aluno@email.com",
      "fingerprint": "abc123...",
      "device_info": "Chrome on Windows",
      "ip_address": "192.168.1.1",
      "is_approved": true,
      "registered_at": "2026-05-20 10:00:00",
      "last_seen_at": "2026-05-27 15:30:00"
    }
  ]
}
```

#### POST `/admin/api/devices/[id]/approve`
**Descrição:** Aprovar dispositivo pendente

#### DELETE `/admin/api/devices/[id]`
**Descrição:** Remover dispositivo (força logout no dispositivo)

### 4.3 Interface

#### Lista de Dispositivos
- Tabela com: Usuário, Dispositivo, IP, Status, Data Registro, Último Acesso
- Filtros: Usuário, Status (aprovado/pendente)
- Ações: Aprovar, Remover

---

## 5. GESTÃO DE AFILIADOS (/admin/affiliates)

### 5.1 Estrutura de Dados

#### Tabela: `affiliates`
```sql
CREATE TABLE affiliates (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  commission_pct REAL NOT NULL DEFAULT 40,
  total_earned_cents INTEGER NOT NULL DEFAULT 0,
  total_withdrawn_cents INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabela: `affiliate_clicks`
```sql
CREATE TABLE affiliate_clicks (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  clicked_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE
);
```

#### Tabela: `affiliate_conversions`
```sql
CREATE TABLE affiliate_conversions (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  commission_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

#### Tabela: `affiliate_withdrawals`
```sql
CREATE TABLE affiliate_withdrawals (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  pix_key TEXT,
  approved_at TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE
);
```

### 5.2 Endpoints da API

#### GET `/admin/api/affiliates`
**Response:**
```json
{
  "affiliates": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_name": "Nome do Afiliado",
      "user_email": "afiliado@email.com",
      "code": "ABC123",
      "commission_pct": 40,
      "total_earned_cents": 50000,
      "total_withdrawn_cents": 30000,
      "pending_withdrawals_cents": 10000,
      "clicks_count": 500,
      "conversions_count": 25,
      "conversion_rate": 5.0,
      "is_active": true,
      "created_at": "2026-05-01 10:00:00"
    }
  ]
}
```

#### POST `/admin/api/affiliates`
**Request Body:**
```json
{
  "user_id": "uuid",
  "commission_pct": 40
}
```

#### PUT `/admin/api/affiliates/[id]`
**Descrição:** Atualizar afiliado (comissão, status)

#### DELETE `/admin/api/affiliates/[id]`
**Descrição:** Desativar afiliado

#### GET `/admin/api/affiliates/[id]/stats`
**Response:** Estatísticas detalhadas do afiliado

#### GET `/admin/api/affiliates/[id]/clicks`
**Response:** Lista de cliques do afiliado

#### GET `/admin/api/affiliates/[id]/conversions`
**Response:** Lista de conversões do afiliado

### 5.3 Interface

#### Lista de Afiliados
- Tabela com: Nome, Email, Código, Comissão, Ganhos, Saques, Conversões, Taxa
- Filtros: Status, Período
- Ações: Editar, Desativar, Ver Detalhes

#### Detalhes do Afiliado
- **Aba 1: Visão Geral**
  - Métricas: Cliques, Conversões, Taxa, Ganhos Totais
  - Gráfico de conversões ao longo do tempo

- **Aba 2: Cliques**
  - Tabela com: Data, IP, User Agent

- **Aba 3: Conversões**
  - Tabela com: Data, Pedido, Valor, Comissão, Status

- **Aba 4: Saques**
  - Tabela com: Data, Valor, Status, Chave PIX
  - Botões: Aprovar, Rejeitar, Marcar como Pago

---

## 6. FINANCEIRO (/admin/financial)

### 6.1 Estrutura de Dados

#### Tabela: `orders`
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_proof_url TEXT,
  approved_at TEXT,
  approved_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### Tabela: `product_access`
```sql
CREATE TABLE product_access (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  granted_by TEXT,
  UNIQUE(user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 6.2 Endpoints da API

#### GET `/admin/api/financial/overview`
**Response:**
```json
{
  "total_revenue_cents": 500000,
  "month_revenue_cents": 50000,
  "pending_orders_count": 5,
  "pending_amount_cents": 25000,
  "approved_today_count": 10,
  "approved_today_amount_cents": 50000
}
```

#### GET `/admin/api/financial/orders`
**Query Parameters:**
- `status` (opcional) - `pending`, `approved`, `rejected`
- `date_from`, `date_to` (opcional)
- `page`, `limit`

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "order_number": "WB-2026-001",
      "user_name": "Nome do Aluno",
      "user_email": "aluno@email.com",
      "product_title": "Workshop Mentalidade Financeira",
      "amount_cents": 39700,
      "status": "pending",
      "payment_method": "pix",
      "payment_proof_url": "https://...",
      "created_at": "2026-05-27 10:00:00"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### POST `/admin/api/financial/orders/[id]/approve`
**Descrição:** Aprovar pedido e liberar acesso ao produto

**Lógica:**
1. Atualizar status do pedido para `approved`
2. Criar registro em `product_access`
3. Enviar notificação para o aluno

#### POST `/admin/api/financial/orders/[id]/reject`
**Request Body:**
```json
{
  "reason": "Comprovante inválido"
}
```

#### GET `/admin/api/financial/orders/[id]`
**Response:** Detalhes completos do pedido

### 6.3 Interface

#### Dashboard Financeiro
- Cards: Receita Total, Receita do Mês, Pedidos Pendentes, Aprovados Hoje
- Gráfico: Receita ao longo do tempo (últimos 30 dias)
- Gráfico: Pedidos por status

#### Lista de Pedidos
- Tabela com: Número, Aluno, Produto, Valor, Status, Data, Ações
- Filtros: Status, Período, Busca por aluno
- Ações: Aprovar, Rejeitar, Ver Detalhes

#### Modal de Aprovação
- Visualização do comprovante de pagamento
- Informações do pedido
- Botões: Aprovar, Rejeitar

---

## 7. MENSAGENS (/admin/messages)

### 7.1 Estrutura de Dados

#### Tabela: `notifications`
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link_url TEXT,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 7.2 Endpoints da API

#### GET `/admin/api/notifications`
**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "user_name": "Nome do Aluno",
      "user_email": "aluno@email.com",
      "title": "Bem-vindo!",
      "body": "Seu acesso foi liberado",
      "type": "welcome",
      "read": false,
      "created_at": "2026-05-27 10:00:00"
    }
  ]
}
```

#### POST `/admin/api/notifications`
**Descrição:** Enviar notificação para usuário(s)

**Request Body:**
```json
{
  "user_ids": ["uuid1", "uuid2"],
  "title": "Novo módulo disponível",
  "body": "Confira o novo módulo do workshop",
  "type": "info",
  "link_url": "/student/course/workshop-mentalidade-financeira"
}
```

#### POST `/admin/api/notifications/broadcast`
**Descrição:** Enviar notificação para todos os alunos

**Request Body:**
```json
{
  "title": "Manutenção programada",
  "body": "O sistema ficará indisponível amanhã das 2h às 4h",
  "type": "warning"
}
```

#### DELETE `/admin/api/notifications/[id]`
**Descrição:** Remover notificação

### 7.3 Interface

#### Lista de Mensagens
- Tabela com: Destinatário, Título, Tipo, Lida, Data
- Filtros: Tipo, Lida/Não lida, Usuário
- Botão: "Nova Mensagem"

#### Modal de Nova Mensagem
- Seleção de destinatários (um ou todos)
- Campos: Título, Corpo, Tipo, Link
- Preview da mensagem

---

## 8. CONFIGURAÇÕES (/admin/settings)

### 8.1 Estrutura de Dados

#### Tabela: `settings`
```sql
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 8.2 Configurações Padrão

```sql
INSERT INTO settings (key, value, description) VALUES
  ('site_name', 'Workshop Platform', 'Nome do site'),
  ('site_description', 'Plataforma de workshops online', 'Descrição do site'),
  ('max_devices_per_user', '2', 'Máximo de dispositivos por usuário'),
  ('default_commission_pct', '40', 'Comissão padrão de afiliados (%)'),
  ('maintenance_mode', 'false', 'Modo manutenção'),
  ('registration_enabled', 'true', 'Cadastro aberto'),
  ('support_email', 'suporte@workshop.com', 'Email de suporte'),
  ('support_whatsapp', '5511999999999', 'WhatsApp de suporte');
```

### 8.3 Endpoints da API

#### GET `/admin/api/settings`
**Response:**
```json
{
  "settings": [
    {
      "key": "site_name",
      "value": "Workshop Platform",
      "description": "Nome do site"
    }
  ]
}
```

#### PUT `/admin/api/settings`
**Request Body:**
```json
{
  "settings": {
    "site_name": "Novo Nome",
    "max_devices_per_user": "3",
    "maintenance_mode": "false"
  }
}
```

### 8.4 Interface

#### Formulário de Configurações
- **Seção: Geral**
  - Nome do site
  - Descrição do site
  - Email de suporte
  - WhatsApp de suporte

- **Seção: Acesso**
  - Máximo de dispositivos por usuário
  - Cadastro aberto (toggle)
  - Modo manutenção (toggle)

- **Seção: Afiliados**
  - Comissão padrão (%)

- Botão: "Salvar Configurações"

---

## 9. COMPONENTES REUTILIZÁVEIS

### 9.1 Tabela Genérica
```typescript
interface TableProps {
  columns: Array<{
    key: string
    label: string
    sortable?: boolean
    render?: (value: any, row: any) => JSX.Element
  }>
  data: any[]
  loading?: boolean
  onSort?: (column: string, order: 'asc' | 'desc') => void
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
  }
}
```

### 9.2 Modal
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: JSX.Element
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
```

### 9.3 Formulário
```typescript
interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string, label: string }>
  validation?: (value: any) => string | null
}
```

### 9.4 Card de Estatística
```typescript
interface StatCardProps {
  icon: string
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'dourado' | 'verde-claro' | 'vermelho' | 'azul'
}
```

### 9.5 Toast/Notificação
```typescript
interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}
```

---

## 10. REGRAS DE NEGÓCIO

### 10.1 Autenticação e Autorização
- Apenas usuários com `role = 'admin'` ou `role = 'super_admin'` podem acessar o painel
- Todas as rotas `/admin/*` devem verificar autenticação no middleware
- Token JWT deve ser validado em cada requisição à API

### 10.2 Validações
- **Email:** formato válido, único no sistema
- **Senha:** mínimo 8 caracteres, deve conter letras e números
- **Preço:** valor em centavos, mínimo 0
- **URLs:** formato válido (http/https)
- **Percentuais:** entre 0 e 100

### 10.3 Soft Delete
- Usuários: marcar `is_active = 0` em vez de deletar
- Produtos: marcar `status = 'archived'` em vez de deletar
- Manter histórico para auditoria

### 10.4 Cascade Delete
- Produto deletado → remove módulos → remove aulas
- Usuário deletado → remove dispositivos, progresso, acessos
- Afiliado deletado → mantém histórico de cliques e conversões

### 10.5 Notificações Automáticas
- Novo aluno cadastrado → notificar admin
- Novo pedido pendente → notificar admin
- Dispositivo não aprovado → notificar aluno
- Pedido aprovado → notificar aluno

---

## 11. SEGURANÇA

### 11.1 Proteção de Rotas
- Middleware verifica token JWT em todas as rotas `/admin/*`
- APIs verificam `role` do usuário
- CSRF protection em formulários

### 11.2 Rate Limiting
- Login: máximo 5 tentativas por IP a cada 15 minutos
- APIs: máximo 100 requisições por minuto por usuário

### 11.3 Sanitização
- Escape de HTML em todos os inputs
- Validação de tipos de dados
- Prepared statements em todas as queries SQL

### 11.4 Logs de Auditoria
```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Registrar todas as ações administrativas:
- Criação/edição/remoção de usuários
- Aprovação/rejeição de pedidos
- Alterações em produtos
- Mudanças em configurações

---

## 12. PRÓXIMOS PASSOS

### Fase 1 (Prioridade Alta)
1. ✅ Login/Logout
2. ⏳ Gestão de Alunos (CRUD completo)
3. ⏳ Gestão de Produtos (CRUD completo)
4. ⏳ Financeiro (aprovação de pedidos)

### Fase 2 (Prioridade Média)
5. ⏳ Gestão de Dispositivos
6. ⏳ Gestão de Afiliados
7. ⏳ Mensagens/Notificações

### Fase 3 (Prioridade Baixa)
8. ⏳ Configurações
9. ⏳ Logs de Auditoria
10. ⏳ Relatórios e Analytics

---

## 13. STACK TÉCNICA

- **Frontend:** Astro 5 + Tailwind CSS
- **Backend:** Astro API Routes
- **Banco de Dados:** Turso (SQLite serverless)
- **Autenticação:** JWT + bcrypt
- **Deploy:** Vercel
- **Versionamento:** Git + GitHub

---

**Documento criado em:** 27/05/2026  
**Versão:** 1.0  
**Autor:** Sistema de IA
