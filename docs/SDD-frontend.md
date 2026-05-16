# SDD — Frontend (Mini Roteirizador)

---

## 1. Visão Geral

O frontend é uma Single Page Application (SPA) desenvolvida com Vue 3, responsável por toda a interface do usuário. Consome dados de dois microsserviços via API REST e não possui lógica de negócio própria — apenas apresentação e orquestração de chamadas.

---

## 2. Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Vue 3 | 3.3 | Framework principal (Composition API) |
| TypeScript | 5.2 | Tipagem estática |
| Vite | 5.0 | Bundler e dev server |
| Vue Router | 4.2 | Roteamento client-side |
| Pinia | 2.1 | Gerenciamento de estado global |
| Axios | 1.6 | Chamadas HTTP |
| Leaflet | 1.9 | Mapa interativo |
| Tailwind CSS | 3.3 | Estilização utilitária |

---

## 3. Estrutura de Diretórios

```
src/
├── api/
│   └── index.ts          # Clientes HTTP e interfaces TypeScript
├── components/
│   └── MapaRota.vue       # Componente de mapa com Leaflet
├── router/
│   └── index.ts          # Definição das rotas
├── stores/               # Stores Pinia (estado global)
├── views/
│   ├── Enderecos.vue     # CRUD de endereços
│   ├── Veiculos.vue      # CRUD de veículos
│   ├── Motoristas.vue    # CRUD de motoristas
│   └── Roteirizacao.vue  # Cálculo e atribuição de rotas
├── App.vue               # Layout raiz + navbar
├── main.ts               # Bootstrap da aplicação
└── style.css             # Estilos globais + fixes Leaflet/Tailwind
```

---

## 4. Roteamento

| Rota | Componente | Descrição |
|---|---|---|
| `/` | redirect | Redireciona para `/enderecos` |
| `/enderecos` | Enderecos.vue | Gestão de endereços |
| `/veiculos` | Veiculos.vue | Gestão de veículos |
| `/motoristas` | Motoristas.vue | Gestão de motoristas |
| `/roteirizacao` | Roteirizacao.vue | Cálculo e atribuição de rotas |

Utiliza `createWebHistory` (HTML5 History API). O nginx está configurado para redirecionar todas as rotas para `index.html`.

---

## 5. Camada de API (`src/api/index.ts`)

Dois clientes Axios são instanciados com `baseURL` configurável via variáveis de ambiente:

- `gestaoHttp` → `management-service` (porta 3001)
- `roteirizacaoHttp` → `routing-service` (porta 4000)

### Interfaces exportadas

```
Endereco        — id, rua, numero, cidade, estado, cep, latitude, longitude, status, veiculo_id
Veiculo         — id, placa, modelo, capacidade
Motorista       — id, nome, cpf
ResultadoRota   — veiculo_id, rota[], total_enderecos, aviso?
RotaSalva       — id, vehicleId, motoristaId, addressIds[], status, distanciaTotalKm, createdAt
```

### APIs exportadas

- `enderecosApi` — listar, buscar, criar, atualizar, deletar
- `veiculosApi` — listar, criar, atualizar, deletar
- `motoristasApi` — listar, criar, atualizar, deletar
- `roteirizacaoApi` — calcular, atribuir, listarRotas

---

## 6. Componentes e Views

### 6.1 Enderecos.vue

**Responsabilidades:**
- Formulário de criação/edição com campos: rua, número, estado (dropdown IBGE), cidade (dropdown IBGE dependente do estado), CEP
- Geocodificação automática via Nominatim ao submeter — bloqueia o cadastro se não encontrar coordenadas
- Tabela paginada (10/página) exibindo lat/lng e status de cada endereço
- Edição inline: ao clicar em "Editar", o formulário é preenchido com os dados do registro

**Estado local:**
- `enderecos` — lista completa
- `form` — dados do formulário
- `editandoId` — ID do registro em edição (null = modo criação)
- `paginaAtual`, `enderecosPaginados` — controle de paginação
- `geocodificando`, `salvando`, `carregando` — estados de loading
- `erro` — mensagem de erro inline
- `estados`, `cidades` — dados do IBGE

**Fluxo de geocodificação:**
1. Usuário preenche rua, cidade e estado
2. Ao submeter, `buscarCoordenadas()` monta query e chama Nominatim
3. Se encontrar: preenche `latitude` e `longitude` no form e prossegue com o save
4. Se não encontrar: exibe erro e interrompe o cadastro

---

### 6.2 Veiculos.vue

**Responsabilidades:**
- Formulário com placa, modelo e capacidade (kg)
- Grid de cards paginado (9/página, 3 colunas em desktop)
- Edição e exclusão por card

**Estado local:**
- `veiculos`, `form`, `editandoId`, `paginaAtual`, `veiculosPaginados`, `salvando`, `carregando`, `erro`

---

### 6.3 Motoristas.vue

**Responsabilidades:**
- Formulário com nome e CPF
- Máscara de CPF aplicada em tempo real no input (`000.000.000-00`)
- Tabela paginada (10/página) com nome e CPF
- Edição e exclusão por linha

**Estado local:**
- `motoristas`, `form`, `editandoId`, `paginaAtual`, `motoristasPaginados`, `salvando`, `carregando`, `erro`

---

### 6.4 Roteirizacao.vue

É a view mais complexa, composta por três seções:

**Seção 1 — Configuração da rota**
- Dropdown de veículo
- Dropdown de motorista (opcional)
- Lista de endereços com checkbox e paginação (8/página)
- Botões "Calcular Rota" e "Atribuir Rota"
- Banners de aviso e erro

**Seção 2 — Resultado (visível após calcular)**
- Lista ordenada de paradas com numeração
- Componente `MapaRota` lado a lado com a lista

**Seção 3 — Agrupamentos por veículo**
- Accordion: cada veículo é um painel recolhível mostrando modelo, placa, nome do motorista (badge) e contagem de endereços
- Paginação (5 grupos/página)
- Botão "Atualizar" para recarregar

**Estado local:**
- `enderecos`, `veiculos`, `motoristas` — dados carregados
- `veiculoSelecionado`, `motoristaSelecionado`, `enderecosSelecionados` — seleções do usuário
- `rotaCalculada` — resultado do cálculo
- `agrupamentos` — mapa `veiculoId → { veiculo, motorista, enderecos[] }`
- `rotasSalvas` — rotas persistidas no routing-service
- `abertos` — IDs dos acordeões abertos
- Paginações: `paginaEndSel`, `paginaGrupos`

---

### 6.5 MapaRota.vue

**Responsabilidades:**
- Renderiza um mapa Leaflet com os pontos da rota calculada
- Exibe marcadores numerados (círculos azuis) com popup de endereço
- Busca o trajeto real pelas ruas via OSRM e desenha uma polilinha azul
- Fallback para linha reta se o OSRM falhar

**Props:** `rota: ResultadoRota`

**Ciclo de vida:**
- `onMounted` + `nextTick` → inicializa o mapa após o DOM estar pronto
- `watch(rota)` → re-renderiza quando a rota mudar
- `onUnmounted` → destrói o mapa para evitar memory leak

**Conversão de coordenadas:**
- Leaflet usa `[lat, lon]`
- OSRM usa `lon,lat` na URL e retorna `[lon, lat]` no GeoJSON
- A conversão é feita explicitamente em `buscarTrajeto()`

---

## 7. Decisões de Design

**CSS Leaflet vs. Tailwind:** O Tailwind CSS preflight define `img { display: block; max-width: 100% }`, o que quebra os tiles do Leaflet. A solução foi importar o CSS do Leaflet antes do Tailwind em `main.ts` e adicionar regras de override em `style.css`.

**Paginação local:** Todos os dados são carregados de uma vez e a paginação é feita no frontend com `computed` + `slice`. Adequado para o volume de dados do sistema.

**Geocodificação no frontend:** A chamada ao Nominatim é feita diretamente pelo browser (não passa pelo backend), o que evita expor a API pelo servidor e simplifica a arquitetura.

**Motorista opcional na roteirização:** O campo de motorista não é obrigatório para calcular nem atribuir a rota, preservando compatibilidade com rotas já existentes no banco.
