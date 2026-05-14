#!/bin/bash
set -e

rm -f /app/tmp/pids/server.pid

echo "Aguardando banco de dados..."
until bundle exec rails db:version 2>/dev/null; do
  echo "Banco indisponível, aguardando..."
  sleep 2
done

echo "Executando migrations..."
bundle exec rails db:create 2>/dev/null || true
bundle exec rails db:migrate

echo "Executando seeds..."
bundle exec rails db:seed 2>/dev/null || true

exec "$@"
