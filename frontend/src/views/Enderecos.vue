<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">{{ editandoId ? 'Editar Endereço' : 'Novo Endereço' }}</h2>
      <form @submit.prevent="salvar" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
          <input v-model="form.rua" type="text" required class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
          <input v-model="form.numero" type="text" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
          <select v-model="form.estado" required @change="onEstadoChange" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Selecione o estado...</option>
            <option v-for="e in estados" :key="e.sigla" :value="e.sigla">{{ e.nome }} ({{ e.sigla }})</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
          <select v-model="form.cidade" required :disabled="!form.estado || carregandoCidades" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
            <option value="">{{ carregandoCidades ? 'Carregando cidades...' : 'Selecione a cidade...' }}</option>
            <option v-for="c in cidades" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <input v-model="form.cep" type="text" placeholder="00000-000" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div v-if="erro" class="md:col-span-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {{ erro }}
        </div>
        <div class="md:col-span-2 flex gap-2 items-center">
          <button type="submit" :disabled="salvando || geocodificando" class="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {{ geocodificando ? 'Buscando coordenadas...' : salvando ? 'Salvando...' : (editandoId ? 'Atualizar' : 'Criar') }}
          </button>
          <button v-if="editandoId" type="button" @click="cancelar" class="bg-gray-200 text-gray-700 px-5 py-2 rounded hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Endereços <span class="text-gray-400 text-sm">({{ enderecos.length }})</span></h2>
        <button @click="carregar" class="text-sm text-blue-600 hover:text-blue-800">Atualizar</button>
      </div>

      <div v-if="carregando" class="text-center py-10 text-gray-400">Carregando...</div>
      <div v-else-if="enderecos.length === 0" class="text-center py-10 text-gray-400">Nenhum endereço cadastrado.</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Cidade/UF</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">CEP</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Lat / Long</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="e in enderecosPaginados" :key="e.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ e.rua }}{{ e.numero ? ', ' + e.numero : '' }}</td>
              <td class="px-4 py-3">{{ e.cidade }} / {{ e.estado }}</td>
              <td class="px-4 py-3 text-gray-500">{{ e.cep || '-' }}</td>
              <td class="px-4 py-3 text-gray-500 font-mono text-xs">
                {{ e.latitude != null ? e.latitude : '-' }}, {{ e.longitude != null ? e.longitude : '-' }}
              </td>
              <td class="px-4 py-3">
                <span :class="statusClasse(e.status)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ e.status }}
                </span>
              </td>
              <td class="px-4 py-3 space-x-3">
                <button @click="editar(e)" class="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                <button @click="deletar(e.id)" class="text-red-500 hover:text-red-700 font-medium">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPaginas > 1" class="mt-4 flex items-center justify-center gap-2 text-sm">
        <button @click="paginaAtual--" :disabled="paginaAtual === 1" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8249;</button>
        <span class="text-gray-600">{{ paginaAtual }} / {{ totalPaginas }}</span>
        <button @click="paginaAtual++" :disabled="paginaAtual === totalPaginas" class="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">&#8250;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { enderecosApi, type Endereco } from '../api';

interface Estado { sigla: string; nome: string }

const enderecos = ref<Endereco[]>([]);
const paginaAtual = ref(1);
const itensPorPagina = 10;
const totalPaginas = computed(() => Math.max(1, Math.ceil(enderecos.value.length / itensPorPagina)));
const enderecosPaginados = computed(() =>
  enderecos.value.slice((paginaAtual.value - 1) * itensPorPagina, paginaAtual.value * itensPorPagina)
);

const estados = ref<Estado[]>([]);
const cidades = ref<string[]>([]);
const carregando = ref(false);
const carregandoCidades = ref(false);
const salvando = ref(false);
const geocodificando = ref(false);
const editandoId = ref<string | null>(null);
const erro = ref<string | null>(null);

const formVazio = () => ({
  rua: '', numero: '', cidade: '', estado: '', cep: '',
  latitude: null as number | null, longitude: null as number | null,
});
const form = ref(formVazio());

const statusClasse = (status: string) =>
  status === 'em_rota' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700';

const carregarEstados = async () => {
  const res = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
  estados.value = res.data.map((e: { sigla: string; nome: string }) => ({ sigla: e.sigla, nome: e.nome }));
};

const carregarCidades = async (uf: string) => {
  carregandoCidades.value = true;
  cidades.value = [];
  try {
    const res = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
    cidades.value = res.data.map((c: { nome: string }) => c.nome);
  } finally {
    carregandoCidades.value = false;
  }
};

const onEstadoChange = () => {
  form.value.cidade = '';
  if (form.value.estado) carregarCidades(form.value.estado);
};

const buscarCoordenadas = async (): Promise<boolean> => {
  geocodificando.value = true;
  try {
    const query = [form.value.numero, form.value.rua, form.value.cidade, form.value.estado, 'Brasil']
      .filter(Boolean).join(', ');
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', limit: 1, addressdetails: 1 },
      headers: { 'Accept-Language': 'pt-BR' },
    });
    if (res.data.length > 0) {
      form.value.latitude = parseFloat(res.data[0].lat);
      form.value.longitude = parseFloat(res.data[0].lon);
      return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    geocodificando.value = false;
  }
};

const carregar = async () => {
  carregando.value = true;
  try {
    enderecos.value = (await enderecosApi.listar()).data;
    paginaAtual.value = 1;
  } finally {
    carregando.value = false;
  }
};

const salvar = async () => {
  erro.value = null;
  if (form.value.rua && form.value.cidade && form.value.estado) {
    const encontrou = await buscarCoordenadas();
    if (!encontrou) {
      erro.value = 'Não foi possível encontrar as coordenadas para este endereço. Verifique os dados e tente novamente.';
      return;
    }
  }
  salvando.value = true;
  try {
    if (editandoId.value) {
      await enderecosApi.atualizar(editandoId.value, form.value);
    } else {
      await enderecosApi.criar(form.value as Omit<Endereco, 'id' | 'status' | 'veiculo_id'>);
    }
    cancelar();
    await carregar();
  } catch (e: any) {
    const data = e?.response?.data;
    erro.value = data?.errors?.join(', ') || data?.error || 'Erro ao salvar endereço.';
  } finally {
    salvando.value = false;
  }
};

const editar = async (e: Endereco) => {
  editandoId.value = e.id;
  form.value = { rua: e.rua, numero: e.numero, cidade: e.cidade, estado: e.estado, cep: e.cep, latitude: e.latitude, longitude: e.longitude };
  if (e.estado) await carregarCidades(e.estado);
};

const cancelar = () => {
  editandoId.value = null;
  form.value = formVazio();
  cidades.value = [];
  erro.value = null;
};

const deletar = async (id: string) => {
  if (!confirm('Excluir este endereço?')) return;
  await enderecosApi.deletar(id);
  await carregar();
};

onMounted(() => Promise.all([carregar(), carregarEstados()]));
</script>
