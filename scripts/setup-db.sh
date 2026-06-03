#!/usr/bin/env bash
# ============================================================================
# WORKSHOP Platform - Setup Completo do Banco Turso
# ============================================================================
# Uso:
#   1. Crie um database: turso db create workshop-platform
#   2. Pegue as credenciais: turso db show workshop-platform --url
#                        turso db tokens create workshop-platform
#   3. Configure as envs: export TURSO_DATABASE_URL=libsql://...
#                       export TURSO_AUTH_TOKEN=...
#   4. Rode: bash scripts/setup-db.sh
# ============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [ -z "$TURSO_DATABASE_URL" ]; then
  echo "❌ TURSO_DATABASE_URL não definida."
  echo "   export TURSO_DATABASE_URL=libsql://your-db.turso.io"
  exit 1
fi

if [ -z "$TURSO_AUTH_TOKEN" ]; then
  echo "❌ TURSO_AUTH_TOKEN não definida."
  echo "   export TURSO_AUTH_TOKEN=your-token"
  exit 1
fi

echo "🚀 WORKSHOP Platform - Setup do Banco"
echo "========================================"
echo ""

echo "📦 [1/3] Rodando schema 005_sqlite_unified.sql..."
turso db shell workshop-platform < "$ROOT_DIR/supabase/migrations/005_sqlite_unified.sql" 2>&1 | tail -3 || true
echo "   ✓ Schema aplicado"
echo ""

echo "👤 [2/3] Criando usuário admin (alvarobiano@workshop.com / AeSm1979@#)..."
cd "$FRONTEND_DIR"
npm run db:seed-admin 2>&1 | tail -5
echo ""

echo "📚 [3/3] Criando produto demo (opcional)..."
read -p "   Criar produto demo também? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm run db:seed-demo 2>&1 | tail -5
fi

echo ""
echo "✅ Setup completo!"
echo ""
echo "Próximos passos:"
echo "  1. Configure as envs no Vercel:"
echo "     - TURSO_DATABASE_URL"
echo "     - TURSO_AUTH_TOKEN"
echo "     - JWT_SECRET (gere com: openssl rand -hex 32)"
echo "     - PUBLIC_SITE_URL"
echo "  2. Faça push para GitHub"
echo "  3. Acesse https://seu-dominio.vercel.app/login"
echo "  4. Login: alvarobiano@workshop.com / AeSm1979@#"
echo ""
