# Mini Roteirizador — Especificação do Sistema

## 1. Visão Geral

O Mini Roteirizador é um sistema web de roteirização de entregas composto por microsserviços. Seu objetivo é permitir o cadastro de endereços e veículos, calcular a rota de entrega mais eficiente entre os endereços selecionados e atribuir essa rota a um veículo, exibindo o trajeto real em um mapa interativo.

---

## 2. Atores

| Ator | Descrição |
|---|---|
| Operador logístico | Usuário que cadastra endereços, veículos e gerencia as rotas de entrega |

---

## 3. Requisitos Funcionais

### 3.1 Endereços

| ID | Requisito |
|---|---|
| RF01 | O sistema deve permitir cadastrar um endereço informando rua, número, estado, cidade e CEP |
| RF02 | Ao cadastrar um endereço, o sistema deve buscar automaticamente as coordenadas geográficas (latitude e longitude) via API do Nominatim (OpenStreetMap) |
| RF03 | O cadastro deve ser bloqueado caso as coordenadas não sejam encontradas |
| RF04 | O sistema deve permitir editar e excluir endereços cadastrados |
| RF05 | O sistema deve listar todos os endereços com paginação (10 por página) |
| RF06 | Cada endereço deve exibir seu status: `pendente`, `em_rota` ou `entregue` |

### 3.2 Veículos

| ID | Requisito |
|---|---|
| RF07 | O sistema deve permitir cadastrar um veículo informando placa, modelo e capacidade (kg) |
| RF08 | O sistema deve permitir editar e excluir veículos cadastrados |
| RF09 | O sistema deve listar todos os veículos com paginação (9 por página) |

### 3.3 Roteirização

| ID | Requisito |
|---|---|
| RF10 | O sistema deve permitir selecionar um veículo e um conjunto de endereços para calcular uma rota |
| RF11 | O cálculo da rota deve utilizar o algoritmo do vizinho mais próximo com distância Haversine |
| RF12 | Endereços sem coordenadas devem ser ignorados na roteirização |
| RF13 | A quantidade de endereços roteirizados não deve exceder a capacidade do veículo |
| RF14 | O sistema deve exibir a rota calculada como uma lista ordenada de paradas |
| RF15 | O sistema deve exibir a rota calculada em um mapa interativo com marcadores numerados e trajeto real pelas ruas (via OSRM) |
| RF16 | O operador deve poder atribuir a rota calculada ao veículo selecionado |
| RF17 | Ao atribuir a rota, o status dos endereços envolvidos deve ser atualizado para `em_rota` |
| RF18 | O sistema deve exibir os agrupamentos de endereços por veículo com paginação e painel recolhível (accordion) |

### 3.4 Motoristas

| ID | Requisito |
|---|---|
| RF19 | O sistema deve permitir cadastrar motoristas informando nome e CPF (formato `000.000.000-00`) |
| RF20 | O sistema deve permitir editar e excluir motoristas cadastrados |

---

## 4. Requisitos Não-Funcionais

| ID | Requisito |
|---|---|
| RNF01 | A comunicação entre serviços deve ser feita via API REST com respostas em JSON |
| RNF02 | O sistema deve ser executado via Docker Compose com todos os serviços orquestrados |
| RNF03 | Coordenadas geográficas são obrigatórias para que um endereço participe da roteirização |
| RNF04 | O sistema não deve depender de APIs pagas ou chaves de API externas |
| RNF05 | O frontend deve ser responsivo e funcionar nos principais navegadores modernos |
| RNF06 | Erros retornados pela API devem ser exibidos ao usuário no formulário correspondente |

---

## 5. Arquitetura

O sistema é composto por 4 serviços:

```
┌─────────────────────────────────────────────────────────────┐
│                        Navegador                            │
│                  frontend (Vue 3 + Tailwind)                │
│                        porta 80                             │
└────────────────────┬────────────────┬───────────────────────┘
                     │                │
          ┌──────────▼──────┐  ┌──────▼──────────┐
          │ management-     │  │ routing-        │
          │ service         │  │ service         │
          │ Rails 7 + PG    │  │ Node + TypeORM  │
          │ porta 3001      │  │ porta 4000      │
          └──────────┬──────┘  └──────┬──────────┘
                     │                │
          ┌──────────▼──────┐  ┌──────▼──────────┐
          │ postgres-gestao │  │ postgres-routing│
          │ porta interna   │  │ porta interna   │
          └─────────────────┘  └─────────────────┘
```

| Serviço | Tecnologia | Responsabilidade |
|---|---|---|
| `frontend` | Vue 3, Tailwind, Leaflet, Pinia | Interface do usuário |
| `management-service` | Ruby on Rails 7, PostgreSQL | CRUD de endereços, veículos e motoristas |
| `routing-service` | Node.js, Express, TypeScript, TypeORM, PostgreSQL | Cálculo e persistência de rotas |
| `postgres-gestao` | PostgreSQL 15 | Banco do management-service |
| `postgres-routing` | PostgreSQL 15 | Banco do routing-service |

---

## 6. Fluxos Principais

### 6.1 Cadastrar endereço
1. Operador preenche rua, estado, cidade e opcionalmente número e CEP
2. Ao submeter, o sistema consulta o Nominatim com os dados informados
3. Se coordenadas forem encontradas, o endereço é salvo com `status: pendente`
4. Se não forem encontradas, o cadastro é bloqueado com mensagem de erro

### 6.2 Calcular e atribuir rota
1. Operador acessa a tela de Roteirização
2. Seleciona um veículo e marca os endereços desejados
3. Clica em **Calcular Rota**
4. O frontend envia `veiculo_id` e `endereco_ids` ao routing-service
5. O routing-service busca os dados no management-service, filtra endereços com coordenadas e aplica o algoritmo nearest neighbor
6. A rota ordenada é retornada e exibida como lista e mapa
7. Operador clica em **Atribuir Rota**
8. O routing-service persiste a rota e atualiza o status dos endereços para `em_rota`

---

## 7. Contratos de API

### management-service (porta 3001)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/enderecos` | Lista todos os endereços |
| POST | `/api/v1/enderecos` | Cria um endereço — body: `{ endereco: { rua, numero, cidade, estado, cep, latitude, longitude } }` |
| PATCH | `/api/v1/enderecos/:id` | Atualiza um endereço |
| DELETE | `/api/v1/enderecos/:id` | Remove um endereço |
| PATCH | `/api/v1/enderecos/batch_update` | Atualiza status/veículo em lote — body: `{ addresses: [{ id, veiculo_id, status }] }` |
| GET | `/api/v1/veiculos` | Lista todos os veículos |
| POST | `/api/v1/veiculos` | Cria um veículo — body: `{ veiculo: { placa, modelo, capacidade } }` |
| PATCH | `/api/v1/veiculos/:id` | Atualiza um veículo |
| DELETE | `/api/v1/veiculos/:id` | Remove um veículo |
| GET | `/api/v1/motoristas` | Lista todos os motoristas |
| POST | `/api/v1/motoristas` | Cria um motorista — body: `{ motorista: { nome, cpf } }` |
| PATCH | `/api/v1/motoristas/:id` | Atualiza um motorista |
| DELETE | `/api/v1/motoristas/:id` | Remove um motorista |
| GET | `/health` | Health check |

### routing-service (porta 4000)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/rotas/calcular` | Calcula rota — body: `{ veiculo_id, endereco_ids[] }` — retorna `{ veiculo_id, rota[], total_enderecos, aviso? }` |
| POST | `/rotas/atribuir` | Persiste rota e atualiza status — body: `{ veiculo_id, endereco_ids[] }` |
| GET | `/health` | Health check |

---

## 8. Regras de Negócio

| ID | Regra |
|---|---|
| RN01 | Um endereço só participa da roteirização se possuir latitude e longitude |
| RN02 | A quantidade de endereços em uma rota não pode exceder a capacidade do veículo |
| RN03 | O CPF do motorista deve estar no formato `000.000.000-00` e ser único |
| RN04 | A placa do veículo deve ser única no sistema |
| RN05 | O status de um endereço só é alterado para `em_rota` após a atribuição de rota |
| RN06 | Ao excluir um veículo, os endereços associados têm o `veiculo_id` removido (nullify) |
