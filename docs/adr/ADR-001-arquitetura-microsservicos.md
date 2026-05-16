# ADR-001 — Arquitetura de Microsserviços

**Data:** 2026-05  
**Status:** Aceito

## Contexto

O sistema precisa separar responsabilidades entre gerenciamento de dados (endereços, veículos, motoristas) e cálculo/persistência de rotas, pois são domínios distintos com tecnologias mais adequadas para cada função.

## Decisão

Dividir o backend em dois serviços independentes:

- **management-service** (Rails 7): CRUD de entidades de negócio, geocodificação via Nominatim
- **routing-service** (Node.js + TypeScript): cálculo de rotas e persistência de roteiros

Cada serviço possui seu próprio banco PostgreSQL. O frontend se comunica diretamente com ambos via REST.

## Consequências

- Separação clara de responsabilidades entre domínio de gestão e domínio de roteirização
- Cada serviço pode evoluir e escalar de forma independente
- Adiciona complexidade operacional (dois bancos, dois serviços, CORS, Docker Compose)
