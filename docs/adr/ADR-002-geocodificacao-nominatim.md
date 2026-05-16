# ADR-002 — Geocodificação via Nominatim (OpenStreetMap)

**Data:** 2026-05  
**Status:** Aceito

## Contexto

O sistema precisa converter endereços textuais em coordenadas geográficas (latitude/longitude) para viabilizar a roteirização. As opções avaliadas foram Google Maps Geocoding API e Nominatim (OpenStreetMap).

## Decisão

Usar a API pública do Nominatim (`nominatim.openstreetmap.org`).

## Razões

- Gratuita e sem necessidade de chave de API
- Suficiente para endereços brasileiros no contexto acadêmico
- Alinhada ao requisito RNF04 (sem dependência de APIs pagas)

## Consequências

- Sem custo operacional
- Sujeita ao rate limit da API pública (1 req/s) — aceitável para o volume do sistema
- Qualidade da geocodificação pode ser inferior à do Google Maps em endereços incompletos ou sem CEP
