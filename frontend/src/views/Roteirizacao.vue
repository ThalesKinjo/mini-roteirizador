<template>
  <div class="space-y-6">
    <!-- Painel de configuração -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Calcular Rota</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Seleção de veículo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Veículo *</label>
          <select v-model="veiculoSelecionado" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Selecione um veículo...</option>
            <option v-for="v in veiculos" :key="v.id" :value="v.id">
              {{ v.modelo }} — {{ v.placa }} ({{ v.capacidade }} kg)
            </option>
          </select>
        </div>

        <!-- Seleção de motorista -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Motorista</label>
          <select v-model="motoristaSelecionado" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sem motorista definido</option>
            <option v-for="m in motoristas" :key="m.id" :value="m.id">
              {{ m.nome }} — {{ m.cpf }}
            </option>
          </select>
        </div>

        <!-- Ações -->
        <div class="flex items-end gap-3 md:col-span-2">
          <button
            @click="calcular"
            :disabled="!veiculoSelecionado || enderecosSelecionados.length === 0 || calculando"
            class="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {{ calculando ? 'Calculando...' : 'Calcular Rota' }}
          </button>
          <button
            @click="atribuir"
            :disabled="!rotaCalculada || atribuindo"
            class="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {{ atribuindo ? 'Atribuindo...' : 'Atribuir Rota' }}
          </button>
        </div>
      </div>

      <!-- Seleção de endereços -->
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Endereços <span class="text-gray-400">({{ enderecosSelecionados.length }} selecionados)</span>
        </label>
        <div v-if="carregando" class="text-center py-6 text-gray-400">Carregando...</div>
        <div v-else-if="enderecos.length === 0" class="text-center py-6 text-gray-400">Nenhum endereço disponível.</div>
        <div v-else class="space-y-2">

          <!-- Accordion: Pendentes -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <button
              @click="abertoPendente = !abertoPendente"
              class="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 hover:bg-yellow-100 transition-colors text-left"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-yellow-800">Pendentes</span>
                <span class="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">{{ enderecosPendentes.length }}</span>
              </div>
              <span class="text-yellow-500 text-sm">{{ abertoPendente ? '▲' : '▼' }}</span>
            </button>
            <div v-show="abertoPendente">
              <div v-if="enderecosPendentes.length === 0" class="px-4 py-4 text-sm text-gray-400 text-center">
                Nenhum endereço pendente.
              </div>
              <div v-else class="divide-y divide-gray-100">
                <label
                  v-for="e in enderecosPendentesPaginados"
                  :key="e.id"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input type="checkbox" :value="e.id" v-model="enderecosSelecionados" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span class="flex-1 text-sm text-gray-700">{{ e.rua }}{{ e.numero ? ', ' + e.numero : '' }} — {{ e.cidade }}/{{ e.estado }}</span>
                </label>
              </div>
              <div class="px-4 py-2 flex items-center justify-between text-sm border-t border-gray-100 bg-gray-50">
                <div class="flex gap-2">
                  <button @click="selecionarGrupo('pendente')" class="text-blue-600 hover:text-blue-800">Selecionar todos</button>
                  <span class="text-gray-300">|</span>
                  <button @click="limparGrupo('pendente')" class="text-gray-500 hover:text-gray-700">Limpar</button>
                </div>
                <div v-if="totalPaginasPendentes > 1" class="flex items-center gap-2 text-gray-500">
                  <button @click="paginaPendente--" :disabled="paginaPendente === 1" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8249;</button>
                  <span>{{ paginaPendente }} / {{ totalPaginasPendentes }}</span>
                  <button @click="paginaPendente++" :disabled="paginaPendente === totalPaginasPendentes" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8250;</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Accordion: Em Rota -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <button
              @click="abertoEmRota = !abertoEmRota"
              class="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 transition-colors text-left"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-green-800">Em Rota</span>
                <span class="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">{{ enderecosEmRota.length }}</span>
              </div>
              <span class="text-green-500 text-sm">{{ abertoEmRota ? '▲' : '▼' }}</span>
            </button>
            <div v-show="abertoEmRota">
              <div v-if="enderecosEmRota.length === 0" class="px-4 py-4 text-sm text-gray-400 text-center">
                Nenhum endereço em rota.
              </div>
              <div v-else class="divide-y divide-gray-100">
                <label
                  v-for="e in enderecosEmRotaPaginados"
                  :key="e.id"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input type="checkbox" :value="e.id" v-model="enderecosSelecionados" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span class="flex-1 text-sm text-gray-700">{{ e.rua }}{{ e.numero ? ', ' + e.numero : '' }} — {{ e.cidade }}/{{ e.estado }}</span>
                </label>
              </div>
              <div class="px-4 py-2 flex items-center justify-between text-sm border-t border-gray-100 bg-gray-50">
                <div class="flex gap-2">
                  <button @click="selecionarGrupo('em_rota')" class="text-blue-600 hover:text-blue-800">Selecionar todos</button>
                  <span class="text-gray-300">|</span>
                  <button @click="limparGrupo('em_rota')" class="text-gray-500 hover:text-gray-700">Limpar</button>
                </div>
                <div v-if="totalPaginasEmRota > 1" class="flex items-center gap-2 text-gray-500">
                  <button @click="paginaEmRota--" :disabled="paginaEmRota === 1" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8249;</button>
                  <span>{{ paginaEmRota }} / {{ totalPaginasEmRota }}</span>
                  <button @click="paginaEmRota++" :disabled="paginaEmRota === totalPaginasEmRota" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8250;</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div v-if="aviso" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm">
        {{ aviso }}
      </div>
      <div v-if="erroCalculo" class="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
        {{ erroCalculo }}
      </div>
      <div v-if="erroAtribuicao" class="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
        {{ erroAtribuicao }}
      </div>
    </div>

    <!-- Resultado da rota calculada -->
    <div v-if="rotaCalculada" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">
        Rota Calculada
        <span class="text-sm font-normal text-gray-500 ml-2">{{ rotaCalculada.total_enderecos }} paradas</span>
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ol class="space-y-2">
          <li
            v-for="(e, i) in rotaCalculada.rota"
            :key="e.id"
            class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <span class="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {{ i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-800 text-sm">{{ e.rua }}{{ e.numero ? ', ' + e.numero : '' }}</p>
              <p class="text-xs text-gray-500">{{ e.cidade }}/{{ e.estado }}{{ e.cep ? ' — CEP: ' + e.cep : '' }}</p>
              <p v-if="e.latitude != null" class="text-xs text-gray-400 font-mono">{{ e.latitude }}, {{ e.longitude }}</p>
            </div>
          </li>
        </ol>
        <MapaRota :rota="rotaCalculada" />
      </div>
    </div>

    <!-- Agrupamentos: endereços por veículo -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Agrupamentos por Veículo</h2>
        <button @click="carregarAgrupamentos" class="text-sm text-blue-600 hover:text-blue-800">Atualizar</button>
      </div>

      <div v-if="carregandoAgrupamentos" class="text-center py-8 text-gray-400">Carregando...</div>
      <div v-else-if="agrupamentos.length === 0" class="text-center py-8 text-gray-400">
        Nenhuma rota atribuída ainda.
      </div>
      <div v-else>
        <div v-if="totalPaginasGrupos > 1" class="mb-3 flex items-center justify-between text-sm text-gray-500">
          <span>{{ agrupamentos.length }} rota(s) atribuída(s)</span>
          <div class="flex items-center gap-2">
            <button @click="paginaGrupos--" :disabled="paginaGrupos === 1" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8249;</button>
            <span>{{ paginaGrupos }} / {{ totalPaginasGrupos }}</span>
            <button @click="paginaGrupos++" :disabled="paginaGrupos === totalPaginasGrupos" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8250;</button>
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="grupo in gruposPaginados" :key="grupo.rota.id" class="border border-gray-200 rounded-lg overflow-hidden">
            <button
              @click="toggleGrupo(grupo.rota.id)"
              class="w-full bg-blue-50 px-4 py-2.5 flex items-center gap-3 hover:bg-blue-100 transition-colors text-left"
            >
              <span class="text-blue-700 font-medium text-sm">{{ grupo.veiculo.modelo }}</span>
              <span class="text-blue-500 text-sm font-mono">{{ grupo.veiculo.placa }}</span>
              <span v-if="grupo.motorista" class="text-blue-600 text-xs bg-blue-100 px-2 py-0.5 rounded-full">
                {{ grupo.motorista.nome }}
              </span>
              <span class="text-xs text-gray-400 ml-1">{{ formatarData(grupo.rota.createdAt) }}</span>
              <span class="ml-auto text-xs text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full mr-2">
                {{ grupo.enderecos.length }} endereço(s)
              </span>
              <span v-if="grupo.rota.distanciaTotalKm > 0" class="text-xs text-gray-400 mr-2">
                {{ grupo.rota.distanciaTotalKm }} km
              </span>
              <span class="text-blue-400 text-sm">{{ estaAberto(grupo.rota.id) ? '▲' : '▼' }}</span>
            </button>
            <div v-if="estaAberto(grupo.rota.id)">
              <div class="divide-y divide-gray-100">
                <div v-for="(e, i) in grupo.enderecos" :key="e.id" class="px-4 py-2.5 text-sm flex items-center gap-3">
                  <span class="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{{ i + 1 }}</span>
                  <span class="flex-1 text-gray-700">{{ e.rua }}{{ e.numero ? ', ' + e.numero : '' }}</span>
                  <span class="text-xs text-gray-400">{{ e.cidade }}/{{ e.estado }}</span>
                </div>
              </div>
              <div v-if="rotaDoGrupo(grupo).total_enderecos > 0" class="p-4 border-t border-gray-100">
                <p class="text-xs font-medium text-gray-500 mb-2">Trajeto</p>
                <MapaRota :rota="rotaDoGrupo(grupo)" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="totalPaginasGrupos > 1" class="mt-3 flex items-center justify-center gap-2 text-sm">
          <button @click="paginaGrupos--" :disabled="paginaGrupos === 1" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8249;</button>
          <span class="text-gray-600">{{ paginaGrupos }} / {{ totalPaginasGrupos }}</span>
          <button @click="paginaGrupos++" :disabled="paginaGrupos === totalPaginasGrupos" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8250;</button>
        </div>
      </div>
    </div>
  </div>

  <ConfirmModal
    :aberto="modalAberto"
    :titulo="modalTitulo"
    :mensagem="modalMensagem"
    :variante="modalVariante"
    @confirmar="onConfirmar"
    @cancelar="modalAberto = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { enderecosApi, veiculosApi, motoristasApi, roteirizacaoApi, type Endereco, type Veiculo, type Motorista, type ResultadoRota, type RotaSalva } from '../api';
import MapaRota from '../components/MapaRota.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const enderecos = ref<Endereco[]>([]);
const veiculos = ref<Veiculo[]>([]);
const motoristas = ref<Motorista[]>([]);
const veiculoSelecionado = ref('');
const motoristaSelecionado = ref('');
const enderecosSelecionados = ref<string[]>([]);
const rotaCalculada = ref<ResultadoRota | null>(null);
const aviso = ref('');

const carregando = ref(false);
const calculando = ref(false);
const atribuindo = ref(false);
const carregandoAgrupamentos = ref(false);
const erroCalculo = ref<string | null>(null);
const erroAtribuicao = ref<string | null>(null);

interface AgrupamentoRota {
  rota: RotaSalva;
  veiculo: Veiculo;
  motorista: Motorista | null;
  enderecos: Endereco[];
}
const agrupamentos = ref<AgrupamentoRota[]>([]);

const abertoPendente = ref(true);
const abertoEmRota = ref(false);

const endsPorPagina = 8;

const enderecosPendentes = computed(() => enderecos.value.filter(e => e.status === 'pendente'));
const enderecosEmRota = computed(() => enderecos.value.filter(e => e.status === 'em_rota'));

const paginaPendente = ref(1);
const totalPaginasPendentes = computed(() => Math.max(1, Math.ceil(enderecosPendentes.value.length / endsPorPagina)));
const enderecosPendentesPaginados = computed(() =>
  enderecosPendentes.value.slice((paginaPendente.value - 1) * endsPorPagina, paginaPendente.value * endsPorPagina)
);

const paginaEmRota = ref(1);
const totalPaginasEmRota = computed(() => Math.max(1, Math.ceil(enderecosEmRota.value.length / endsPorPagina)));
const enderecosEmRotaPaginados = computed(() =>
  enderecosEmRota.value.slice((paginaEmRota.value - 1) * endsPorPagina, paginaEmRota.value * endsPorPagina)
);

const selecionarGrupo = (status: string) => {
  const ids = enderecos.value.filter(e => e.status === status).map(e => e.id);
  const novos = ids.filter(id => !enderecosSelecionados.value.includes(id));
  enderecosSelecionados.value = [...enderecosSelecionados.value, ...novos];
};

const limparGrupo = (status: string) => {
  const ids = enderecos.value.filter(e => e.status === status).map(e => e.id);
  enderecosSelecionados.value = enderecosSelecionados.value.filter(id => !ids.includes(id));
};

const abertos = ref<string[]>([]);
const toggleGrupo = (id: string) => {
  const idx = abertos.value.indexOf(id);
  if (idx === -1) abertos.value.push(id);
  else abertos.value.splice(idx, 1);
};
const estaAberto = (id: string) => abertos.value.includes(id);

const paginaGrupos = ref(1);
const gruposPorPagina = 5;
const totalPaginasGrupos = computed(() => Math.max(1, Math.ceil(agrupamentos.value.length / gruposPorPagina)));
const gruposPaginados = computed(() =>
  agrupamentos.value.slice((paginaGrupos.value - 1) * gruposPorPagina, paginaGrupos.value * gruposPorPagina)
);

const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const carregar = async () => {
  carregando.value = true;
  try {
    const [resEnd, resVei, resMot] = await Promise.all([enderecosApi.listar(), veiculosApi.listar(), motoristasApi.listar()]);
    enderecos.value = resEnd.data;
    veiculos.value = resVei.data;
    motoristas.value = resMot.data;
    paginaPendente.value = 1;
    paginaEmRota.value = 1;
  } finally {
    carregando.value = false;
  }
};

const calcular = async () => {
  calculando.value = true;
  aviso.value = '';
  rotaCalculada.value = null;
  erroCalculo.value = null;
  try {
    const res = await roteirizacaoApi.calcular(veiculoSelecionado.value, enderecosSelecionados.value);
    rotaCalculada.value = res.data;
    if (res.data.aviso) aviso.value = res.data.aviso;
  } catch (e: any) {
    const data = e?.response?.data;
    erroCalculo.value = data?.error || 'Erro ao calcular rota.';
  } finally {
    calculando.value = false;
  }
};

const modalAberto = ref(false);
const modalTitulo = ref('');
const modalMensagem = ref('');
const modalVariante = ref<'perigo' | 'primario'>('primario');
let acaoPendente: (() => Promise<void>) | null = null;

const onConfirmar = async () => {
  modalAberto.value = false;
  await acaoPendente?.();
  acaoPendente = null;
};

const atribuir = () => {
  if (!rotaCalculada.value) return;
  modalTitulo.value = 'Atribuir rota';
  modalMensagem.value = `Confirma a atribuição de ${rotaCalculada.value.total_enderecos} endereço(s) a este veículo?`;
  modalVariante.value = 'primario';
  acaoPendente = async () => {
    atribuindo.value = true;
    erroAtribuicao.value = null;
    try {
      await roteirizacaoApi.atribuir(veiculoSelecionado.value, enderecosSelecionados.value, motoristaSelecionado.value || undefined);
      rotaCalculada.value = null;
      enderecosSelecionados.value = [];
      motoristaSelecionado.value = '';
      await Promise.all([carregar(), carregarAgrupamentos()]);
    } catch (e: any) {
      const data = e?.response?.data;
      erroAtribuicao.value = data?.error || 'Erro ao atribuir rota.';
    } finally {
      atribuindo.value = false;
    }
  };
  modalAberto.value = true;
};

const rotaDoGrupo = (grupo: AgrupamentoRota): ResultadoRota => {
  const comCoordenadas = grupo.enderecos.filter(e => e.latitude != null && e.longitude != null);
  return { veiculo_id: grupo.veiculo.id, rota: comCoordenadas, total_enderecos: comCoordenadas.length };
};

const carregarAgrupamentos = async () => {
  carregandoAgrupamentos.value = true;
  try {
    const [resEnd, resVei, resMot, resRotas] = await Promise.all([
      enderecosApi.listar(),
      veiculosApi.listar(),
      motoristasApi.listar(),
      roteirizacaoApi.listarRotas(),
    ]);

    const veiculoMap = Object.fromEntries(resVei.data.map(v => [v.id, v]));
    const motoristaMap = Object.fromEntries(resMot.data.map(m => [m.id, m]));
    const enderecoMap = Object.fromEntries(resEnd.data.map(e => [e.id, e]));

    agrupamentos.value = resRotas.data
      .filter(r => veiculoMap[r.vehicleId])
      .map(r => ({
        rota: r,
        veiculo: veiculoMap[r.vehicleId],
        motorista: r.motoristaId ? (motoristaMap[r.motoristaId] ?? null) : null,
        enderecos: r.addressIds.map(id => enderecoMap[id]).filter(Boolean) as Endereco[],
      }));

    paginaGrupos.value = 1;
  } finally {
    carregandoAgrupamentos.value = false;
  }
};

onMounted(() => Promise.all([carregar(), carregarAgrupamentos()]));
</script>
