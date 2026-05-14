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
        <div v-else class="border border-gray-200 rounded-lg divide-y divide-gray-100">
          <label
            v-for="e in enderecosPaginadosSel"
            :key="e.id"
            class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="e.id"
              v-model="enderecosSelecionados"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="flex-1 text-sm">
              {{ e.rua }}{{ e.numero ? ', ' + e.numero : '' }} — {{ e.cidade }}/{{ e.estado }}
            </span>
            <span :class="e.status === 'em_rota' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                  class="text-xs px-2 py-0.5 rounded-full">
              {{ e.status }}
            </span>
          </label>
        </div>
        <div class="mt-2 flex items-center justify-between text-sm">
          <div class="flex gap-2">
            <button @click="selecionarTodos" class="text-blue-600 hover:text-blue-800">Selecionar todos</button>
            <span class="text-gray-300">|</span>
            <button @click="enderecosSelecionados = []" class="text-gray-500 hover:text-gray-700">Limpar seleção</button>
          </div>
          <div v-if="totalPaginasEndSel > 1" class="flex items-center gap-2 text-gray-500">
            <button @click="paginaEndSel--" :disabled="paginaEndSel === 1" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8249;</button>
            <span>{{ paginaEndSel }} / {{ totalPaginasEndSel }}</span>
            <button @click="paginaEndSel++" :disabled="paginaEndSel === totalPaginasEndSel" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8250;</button>
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
      <div v-else-if="Object.keys(agrupamentos).length === 0" class="text-center py-8 text-gray-400">
        Nenhum endereço atribuído ainda.
      </div>
      <div v-else>
        <div v-if="totalPaginasGrupos > 1" class="mb-3 flex items-center justify-between text-sm text-gray-500">
          <span>{{ gruposArray.length }} veículo(s)</span>
          <div class="flex items-center gap-2">
            <button @click="paginaGrupos--" :disabled="paginaGrupos === 1" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8249;</button>
            <span>{{ paginaGrupos }} / {{ totalPaginasGrupos }}</span>
            <button @click="paginaGrupos++" :disabled="paginaGrupos === totalPaginasGrupos" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8250;</button>
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="[veiculoId, grupo] in gruposPaginados" :key="veiculoId" class="border border-gray-200 rounded-lg overflow-hidden">
            <button
              @click="toggleGrupo(veiculoId)"
              class="w-full bg-blue-50 px-4 py-2.5 flex items-center gap-3 hover:bg-blue-100 transition-colors text-left"
            >
              <span class="text-blue-700 font-medium text-sm">{{ grupo.veiculo.modelo }}</span>
              <span class="text-blue-500 text-sm font-mono">{{ grupo.veiculo.placa }}</span>
              <span v-if="grupo.motorista" class="text-blue-600 text-xs bg-blue-100 px-2 py-0.5 rounded-full">
                {{ grupo.motorista.nome }}
              </span>
              <span class="ml-auto text-xs text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full mr-2">
                {{ grupo.enderecos.length }} endereço(s)
              </span>
              <span class="text-blue-400 text-sm">{{ estaAberto(veiculoId) ? '▲' : '▼' }}</span>
            </button>
            <div v-show="estaAberto(veiculoId)" class="divide-y divide-gray-100">
              <div v-for="(e, i) in grupo.enderecos" :key="e.id" class="px-4 py-2.5 text-sm flex items-center gap-3">
                <span class="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{{ i + 1 }}</span>
                <span class="flex-1 text-gray-700">{{ e.rua }}{{ e.numero ? ', ' + e.numero : '' }}</span>
                <span class="text-xs text-gray-400">{{ e.cidade }}/{{ e.estado }}</span>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { enderecosApi, veiculosApi, motoristasApi, roteirizacaoApi, type Endereco, type Veiculo, type Motorista, type ResultadoRota, type RotaSalva } from '../api';
import MapaRota from '../components/MapaRota.vue';

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

interface Agrupamento {
  veiculo: Veiculo;
  motorista: Motorista | null;
  enderecos: Endereco[];
}
const agrupamentos = ref<Record<string, Agrupamento>>({});
const rotasSalvas = ref<RotaSalva[]>([]);

const paginaEndSel = ref(1);
const endsPorPagina = 8;
const totalPaginasEndSel = computed(() => Math.max(1, Math.ceil(enderecos.value.length / endsPorPagina)));
const enderecosPaginadosSel = computed(() =>
  enderecos.value.slice((paginaEndSel.value - 1) * endsPorPagina, paginaEndSel.value * endsPorPagina)
);

const abertos = ref<string[]>([]);
const toggleGrupo = (id: string) => {
  const idx = abertos.value.indexOf(id);
  if (idx === -1) abertos.value.push(id);
  else abertos.value.splice(idx, 1);
};
const estaAberto = (id: string) => abertos.value.includes(id);

const paginaGrupos = ref(1);
const gruposPorPagina = 5;
const gruposArray = computed(() => Object.entries(agrupamentos.value));
const totalPaginasGrupos = computed(() => Math.max(1, Math.ceil(gruposArray.value.length / gruposPorPagina)));
const gruposPaginados = computed(() =>
  gruposArray.value.slice((paginaGrupos.value - 1) * gruposPorPagina, paginaGrupos.value * gruposPorPagina)
);

const carregar = async () => {
  carregando.value = true;
  try {
    const [resEnd, resVei, resMot] = await Promise.all([enderecosApi.listar(), veiculosApi.listar(), motoristasApi.listar()]);
    enderecos.value = resEnd.data;
    veiculos.value = resVei.data;
    motoristas.value = resMot.data;
    paginaEndSel.value = 1;
  } finally {
    carregando.value = false;
  }
};

const selecionarTodos = () => {
  enderecosSelecionados.value = enderecos.value.map(e => e.id);
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

const atribuir = async () => {
  if (!rotaCalculada.value) return;
  if (!confirm(`Atribuir ${rotaCalculada.value.total_enderecos} endereços a este veículo?`)) return;
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

    // última rota atribuída por veículo para saber o motorista
    const motoristaByVeiculo: Record<string, Motorista | null> = {};
    for (const rota of resRotas.data) {
      if (!motoristaByVeiculo[rota.vehicleId]) {
        motoristaByVeiculo[rota.vehicleId] = rota.motoristaId ? (motoristaMap[rota.motoristaId] ?? null) : null;
      }
    }

    const mapa: Record<string, Agrupamento> = {};
    for (const e of resEnd.data) {
      if (!e.veiculo_id) continue;
      const veiculo = veiculoMap[e.veiculo_id];
      if (!veiculo) continue;
      if (!mapa[e.veiculo_id]) {
        mapa[e.veiculo_id] = { veiculo, motorista: motoristaByVeiculo[e.veiculo_id] ?? null, enderecos: [] };
      }
      mapa[e.veiculo_id].enderecos.push(e);
    }

    agrupamentos.value = mapa;
    paginaGrupos.value = 1;
  } finally {
    carregandoAgrupamentos.value = false;
  }
};

onMounted(() => Promise.all([carregar(), carregarAgrupamentos()]));
</script>
