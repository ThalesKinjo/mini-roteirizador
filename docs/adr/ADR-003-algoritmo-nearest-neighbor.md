# ADR-003 — Algoritmo de Roteirização: Nearest Neighbor com Haversine

**Data:** 2026-05  
**Status:** Aceito

## Contexto

O problema de roteirização de entregas é uma variação do Travelling Salesman Problem (TSP), que é NP-difícil. Para o escopo do sistema, é necessário um algoritmo que produza rotas razoáveis com baixa complexidade de implementação e tempo de resposta rápido.

## Decisão

Usar o algoritmo do vizinho mais próximo (Nearest Neighbor) com distância Haversine entre coordenadas geográficas.

- **Nearest Neighbor**: heurística gulosa — a partir do primeiro endereço, sempre visita o mais próximo ainda não visitado
- **Haversine**: fórmula que calcula a distância geodésica entre dois pontos na superfície da Terra a partir de latitude/longitude

## Razões

- Implementação simples e direta (O(n²))
- Tempo de resposta instantâneo para o volume esperado de endereços
- Não requer dependências externas para o cálculo
- Produz resultados aceitáveis para distribuições de pontos típicas de rotas urbanas

## Consequências

- Não garante a rota ótima global (pode ser até 25% pior que o ótimo em casos adversos)
- O trajeto exibido no mapa usa OSRM para respeitar o traçado real das ruas, independente da ordem calculada pelo Haversine
- Para volumes maiores ou requisitos de otimização rigorosos, seria necessário migrar para algoritmos como 2-opt ou solvers de VRP
