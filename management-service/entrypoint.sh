#!/bin/bash
set -e

rm -f /app/tmp/pids/server.pid

echo "Aguardando banco de dados..."
until bundle exec rake db:version 2>/dev/null; do
  echo "Banco indisponível, aguardando..."
  sleep 2
done

echo "Executando migrations..."
bundle exec rake db:create 2>/dev/null || true
bundle exec rake db:migrate

echo "Executando seeds..."
bundle exec rake db:seed 2>/dev/null || true

exec "$@"
