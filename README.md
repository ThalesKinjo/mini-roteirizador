# Mini Roteirizador

Sistema de roteirização de entregas com arquitetura de microsserviços.

## Serviços

| Serviço | Tecnologia | Porta |
|---|---|---|
| `management-service` | Ruby on Rails 7 + PostgreSQL | 3001 |
| `routing-service` | Node.js + Express + TypeScript + PostgreSQL | 4000 |
| `frontend` | Vue 3 + Vite + Tailwind CSS | 80 |

## Como rodar

### Com Docker (recomendado)

```bash
docker-compose up --build
```

Acesse: [http://localhost](http://localhost)

> O management-service fica em `localhost:3001` e o routing-service em `localhost:4000`.
> O frontend (nginx) serve a aplicação Vue na porta 80.

### Sem Docker

**management-service**
```bash
cd management-service
bundle install
rails db:create db:migrate db:seed
rails server -p 3001
```

**routing-service**
```bash
cd routing-service
npm install
npm run dev
```

**frontend**
```bash
cd frontend
npm install
npm run dev
```

## Testes

### routing-service (Jest — sem dependências externas)

```bash
cd routing-service
npm install
npm test
```

Cobre as funções puras de roteirização (`haversineKm`, `nearestNeighbor`, `calcularDistanciaTotal`) e os endpoints HTTP com mocks do banco e do management-service.

### management-service (RSpec — requer PostgreSQL)

Com Docker em execução:

```bash
docker-compose exec management-service bash -c "rails db:test:prepare && bundle exec rspec"
```

Sem Docker (com PostgreSQL local configurado via `DATABASE_URL`):

```bash
cd management-service
bundle install
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gestao_development rails db:test:prepare
bundle exec rspec
```

Cobre validações e associações dos modelos `Address`, `Vehicle` e `Driver`.

## Variáveis de ambiente

### management-service
| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | — | URL de conexão com PostgreSQL |
| `RAILS_ENV` | `development` | Ambiente Rails |

### routing-service
| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | — | URL de conexão com PostgreSQL |
| `MANAGEMENT_SERVICE_URL` | `http://localhost:3001` | URL do management-service |
| `PORT` | `4000` | Porta do serviço |

### frontend
| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_MS_GESTAO_URL` | `http://localhost:3001` | URL do management-service |
| `VITE_MS_ROTEIRIZACAO_URL` | `http://localhost:4000` | URL do routing-service |

## API

### management-service (`/api/v1`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/enderecos` | Listar endereços |
| POST | `/enderecos` | Criar endereço |
| PATCH | `/enderecos/:id` | Atualizar endereço |
| DELETE | `/enderecos/:id` | Excluir endereço |
| PATCH | `/enderecos/batch_update` | Atualizar múltiplos endereços |
| GET | `/veiculos` | Listar veículos |
| POST | `/veiculos` | Criar veículo |
| GET | `/motoristas` | Listar motoristas |
| POST | `/motoristas` | Criar motorista |

### routing-service

| Método | Rota | Descrição |
|---|---|---|
| POST | `/rotas/calcular` | Calcular rota otimizada (nearest neighbor + Haversine) |
| POST | `/rotas/atribuir` | Atribuir rota e persistir no banco |
| GET | `/health` | Health check |
