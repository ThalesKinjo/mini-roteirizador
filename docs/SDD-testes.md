# SDD — Testes (Mini Roteirizador)

---

## 1. Visão Geral

A estratégia de testes cobre os dois microsserviços backend com testes unitários. O foco está nas camadas com lógica própria: funções de cálculo de rota e validações de domínio. O frontend não possui lógica de negócio própria (apenas orquestração de chamadas e apresentação), portanto não foi incluído na suite.

---

## 2. Escopo

| Serviço | Framework | Tipo | Arquivos |
|---|---|---|---|
| `routing-service` | Jest + ts-jest + Supertest | Unitário + HTTP | `routeService.spec.ts`, `routes.spec.ts` |
| `management-service` | RSpec + Shoulda-Matchers + FactoryBot | Unitário (modelo) | `address_spec.rb`, `vehicle_spec.rb`, `driver_spec.rb` |

Testes E2E foram descartados por exigirem toda a infraestrutura Docker no ar (banco, múltiplos serviços), tornando a execução lenta e frágil para o contexto do projeto.

---

## 3. routing-service

### 3.1 Dependências adicionadas

| Pacote | Função |
|---|---|
| `jest` | Runner de testes |
| `ts-jest` | Compilador TypeScript para Jest |
| `supertest` | Requisições HTTP em memória |
| `@types/jest` | Tipagem do Jest |
| `@types/supertest` | Tipagem do Supertest |

### 3.2 Configuração

- `tsconfig.test.json` — estende o `tsconfig.json` base removendo a restrição de `rootDir`, permitindo que o compilador resolva imports entre `src/` e arquivos de teste
- `src/jest.setup.ts` — importa `reflect-metadata` antes de qualquer módulo, necessário para os decorators do TypeORM (`@Entity`, `@Column`, etc.) funcionarem durante os testes
- `src/app.ts` — o app Express foi extraído de `index.ts` para um arquivo separado, permitindo que o Supertest importe o app sem inicializar a conexão com o banco

### 3.3 `src/services/routeService.spec.ts`

Testa as três funções puras do serviço de roteirização. Por serem funções sem dependências externas, não exigem nenhum mock.

**`haversineKm`**

| Caso | O que verifica |
|---|---|
| Mesmo ponto | Retorna exatamente 0 |
| SP → RJ | Distância dentro da faixa esperada (~357 km) |
| Simetria | `dist(A,B) === dist(B,A)` |
| Pontos distintos | Retorna valor positivo |

**`nearestNeighbor`**

| Caso | O que verifica |
|---|---|
| Array vazio | Retorna `[]` |
| Um elemento | Retorna o próprio elemento |
| Múltiplos elementos | Preserva todos os endereços na rota |
| Ponto de partida | Sempre começa pelo primeiro elemento da lista original |
| Ordenação | Visita o vizinho mais próximo a cada passo (verificado com pontos de distâncias conhecidas) |
| Imutabilidade | Não modifica o array original |

**`calcularDistanciaTotal`**

| Caso | O que verifica |
|---|---|
| Rota vazia | Retorna 0 |
| Um ponto | Retorna 0 |
| Dois pontos | Equivale a `haversineKm` dos dois pontos |
| Três pontos | Soma das distâncias entre pontos consecutivos |
| Arredondamento | Resultado com no máximo 2 casas decimais |

### 3.4 `src/routes/routes.spec.ts`

Testa os endpoints HTTP usando Supertest. Dois módulos são mockados via `jest.mock`:

- **`../services/managementService`** — evita chamadas HTTP reais ao management-service
- **`../db/dataSource`** — evita conexão com o PostgreSQL; o repositório TypeORM é substituído por um objeto com `create`, `save` e `find` mockados

**`POST /rotas/calcular`**

| Caso | Status esperado |
|---|---|
| `veiculo_id` ausente | 400 |
| `endereco_ids` ausente | 400 |
| `endereco_ids` vazio | 400 |
| Requisição válida | 200 com `rota`, `veiculo_id`, `total_enderecos` |
| Capacidade do veículo excedida | 200 com rota truncada e campo `aviso` |
| Endereços sem coordenadas | 200 com endereços filtrados e campo `aviso` |
| management-service indisponível | 500 com mensagem de erro |

**`POST /rotas/atribuir`**

| Caso | Status esperado |
|---|---|
| `veiculo_id` ausente | 400 |
| `endereco_ids` ausente | 400 |
| Requisição válida | 200 com `message` e `rota_id` |
| Verifica chamada ao `batchUpdateAddresses` | Chamado uma vez com os IDs corretos, `veiculo_id` e status `em_rota` |
| management-service indisponível | 500 |

**`GET /health`**

| Caso | Status esperado |
|---|---|
| Sempre | 200 com `{ status: 'ok' }` |

---

## 4. management-service

### 4.1 Dependências adicionadas

| Gem | Função |
|---|---|
| `rspec-rails` | Framework de testes para Rails |
| `factory_bot_rails` | Criação de objetos de teste com dados válidos |
| `shoulda-matchers` | Matchers declarativos para validações e associações ActiveRecord |

### 4.2 Configuração

- `spec/spec_helper.rb` — configuração base do RSpec (`verify_partial_doubles`, `include_chain_clauses`)
- `spec/rails_helper.rb` — carrega o ambiente Rails no modo `test`, habilita `use_transactional_fixtures` (cada exemplo roda em uma transação revertida ao final) e integra o Shoulda-Matchers
- `spec/support/factory_bot.rb` — inclui `FactoryBot::Syntax::Methods` nos exemplos para uso sem prefixo (`build`, `create` em vez de `FactoryBot.build`, `FactoryBot.create`)

### 4.3 Factories

| Factory | Atributos notáveis |
|---|---|
| `:vehicle` | `placa` com sequence (`ABC-0001`, `ABC-0002`…) para garantir unicidade entre exemplos |
| `:address` | Coordenadas fixas válidas (`-20.4697`, `-54.6201`); `vehicle: nil` |
| `:driver` | `cpf` com sequence no formato `000.456.789-00` para garantir unicidade e formato válido |

### 4.4 `spec/models/address_spec.rb`

| Grupo | O que verifica |
|---|---|
| Validações de presença | `rua`, `cidade`, `estado`, `latitude`, `longitude` |
| Validações de numericalidade | `latitude` e `longitude` devem ser números |
| Validação de inclusão | `status` aceita apenas `pendente`, `em_rota`, `entregue` |
| Associação | `belongs_to :vehicle` com `optional: true` |
| Status padrão | `nil` é convertido para `"pendente"` pelo `before_validation` |
| Campos opcionais | `numero` e `cep` nulos são convertidos para `""` |
| Serialização | `as_json` expõe `veiculo_id` e oculta `vehicle_id` |

### 4.5 `spec/models/vehicle_spec.rb`

| Grupo | O que verifica |
|---|---|
| Validações de presença | `placa`, `modelo`, `capacidade` |
| Unicidade | `placa` única (testado com `create` + tentativa de duplicata) |
| Numericalidade | `capacidade` deve ser inteiro maior que 0; rejeita 0, negativos e decimais |
| Associação | `has_many :addresses` com `dependent: :nullify` |

### 4.6 `spec/models/driver_spec.rb`

| Grupo | O que verifica |
|---|---|
| Validações de presença | `nome` e `cpf` |
| Unicidade | `cpf` único com `.ignoring_case_sensitivity` (CPF não contém letras, portanto case-sensitivity não se aplica) |
| Formato do CPF | Aceita `000.000.000-00`; rejeita sem formatação, com formatação parcial, com separadores errados e incompleto |
| Unicidade manual | `create` + `build` com mesmo CPF confirma mensagem de erro |

---

## 5. Como executar

### routing-service

```bash
cd routing-service
npm install
npm test
```

### management-service

Com Docker em execução:

```bash
docker-compose exec management-service bash -c \
  "bundle exec rails db:create RAILS_ENV=test 2>/dev/null; \
   bundle exec rails db:migrate RAILS_ENV=test && \
   bundle exec rspec"
```
