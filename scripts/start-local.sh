#!/usr/bin/env bash
# ============================================================================
# WORKSHOP Platform - Start Local
# ============================================================================
# Este script:
#   1. Inicializa o banco SQLite local (se necessário)
#   2. Inicia o servidor de desenvolvimento
#   3. Abre o navegador
# ============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$ROOT_DIR/frontend"

cd "$FRONTEND_DIR"

if [ ! -f "$FRONTEND_DIR/local.db" ] || [ ! -s "$FRONTEND_DIR/local.db" ]; then
  echo "🔧 Inicializando banco local pela primeira vez..."
  npm run db:init-local
  echo ""
fi

echo "🚀 Iniciando WORKSHOP Platform em http://localhost:4321"
echo ""
echo "   Login admin: alvarobiano@workshop.com"
echo "   Senha: AeSm1979@#"
echo ""
echo "   Páginas úteis:"
echo "   - Home:        http://localhost:4321"
echo "   - Login:       http://localhost:4321/login"
echo "   - Admin:       http://localhost:4321/admin (após login)"
echo "   - Produto:     http://localhost:4321/produto/workshop-transformacao-financeira"
echo "   - Health:      http://localhost:4321/api/health"
echo ""
echo "🛑 Para parar: Ctrl+C"
echo ""

open_browser() {
  sleep 3
  if command -v open &> /dev/null; then
    open "http://localhost:4321" 2>/dev/null
  elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:4321" 2>/dev/null
  fi
}

open_browser &

npm run dev
