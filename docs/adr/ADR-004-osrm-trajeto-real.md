# ADR-004 — Exibição de Trajeto Real via OSRM

**Data:** 2026-05  
**Status:** Aceito

## Contexto

Após calcular a ordem de paradas, o sistema precisa exibir o trajeto real pelas ruas no mapa. Traçar linhas retas entre coordenadas seria impreciso e não representaria o percurso real do motorista.

## Decisão

Usar a API pública do OSRM (`router.project-osrm.org`) para obter a geometria do trajeto real entre os pontos da rota calculada.

## Razões

- Gratuita e sem necessidade de chave de API
- Baseada em dados do OpenStreetMap, consistente com o Nominatim já utilizado
- Retorna a polyline do trajeto real pelas vias, compatível com Leaflet
- Alinhada ao requisito RNF04 (sem dependência de APIs pagas)

## Consequências

- Sem custo operacional
- Depende de conectividade externa durante o uso (não funciona offline)
- Sujeita à disponibilidade da API pública do OSRM
