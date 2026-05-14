<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">{{ editandoId ? 'Editar Veículo' : 'Novo Veículo' }}</h2>
      <form @submit.prevent="salvar" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
          <input v-model="form.placa" type="text" required placeholder="ABC-1234" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
          <input v-model="form.modelo" type="text" required placeholder="Fiat Fiorino" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Capacidade (kg) *</label>
          <input v-model.number="form.capacidade" type="number" required min="1" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div v-if="erro" class="md:col-span-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {{ erro }}
        </div>
        <div class="md:col-span-3 flex gap-2">
          <button type="submit" :disabled="salvando" class="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {{ salvando ? 'Salvando...' : (editandoId ? 'Atualizar' : 'Criar') }}
          </button>
          <button v-if="editandoId" type="button" @click="cancelar" class="bg-gray-200 text-gray-700 px-5 py-2 rounded hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Veículos <span class="text-gray-400 text-sm">({{ veiculos.length }})</span></h2>
        <button @click="carregar" class="text-sm text-blue-600 hover:text-blue-800">Atualizar</button>
      </div>

      <div v-if="carregando" class="text-center py-10 text-gray-400">Carregando...</div>
      <div v-else-if="veiculos.length === 0" class="text-center py-10 text-gray-400">Nenhum veículo cadastrado.</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="v in veiculosPaginados" :key="v.id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold text-gray-800">{{ v.modelo }}</p>
              <p class="text-sm text-gray-500 mt-1">Placa: <span class="font-mono font-medium text-gray-700">{{ v.placa }}</span></p>
              <p class="text-sm text-gray-500">Capacidade: <span class="font-medium text-gray-700">{{ v.capacidade }} kg</span></p>
            </div>
            <div class="flex gap-2 text-sm">
              <button @click="editar(v)" class="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
              <button @click="deletar(v.id)" class="text-red-500 hover:text-red-700 font-medium">Excluir</button>
            </div>
          </div>
        </div>
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
import { veiculosApi, type Veiculo } from '../api';

const veiculos = ref<Veiculo[]>([]);
const paginaAtual = ref(1);
const itensPorPagina = 9;
const totalPaginas = computed(() => Math.max(1, Math.ceil(veiculos.value.length / itensPorPagina)));
const veiculosPaginados = computed(() =>
  veiculos.value.slice((paginaAtual.value - 1) * itensPorPagina, paginaAtual.value * itensPorPagina)
);

const carregando = ref(false);
const salvando = ref(false);
const editandoId = ref<string | null>(null);
const erro = ref<string | null>(null);

const formVazio = () => ({ placa: '', modelo: '', capacidade: 0 });
const form = ref(formVazio());

const carregar = async () => {
  carregando.value = true;
  try {
    const res = await veiculosApi.listar();
    veiculos.value = res.data;
    paginaAtual.value = 1;
  } finally {
    carregando.value = false;
  }
};

const salvar = async () => {
  erro.value = null;
  salvando.value = true;
  try {
    if (editandoId.value) {
      await veiculosApi.atualizar(editandoId.value, form.value);
    } else {
      await veiculosApi.criar(form.value);
    }
    cancelar();
    await carregar();
  } catch (e: any) {
    const data = e?.response?.data;
    erro.value = data?.errors?.join(', ') || data?.error || 'Erro ao salvar veículo.';
  } finally {
    salvando.value = false;
  }
};

const editar = (v: Veiculo) => {
  editandoId.value = v.id;
  form.value = { placa: v.placa, modelo: v.modelo, capacidade: v.capacidade };
};

const cancelar = () => {
  editandoId.value = null;
  form.value = formVazio();
  erro.value = null;
};

const deletar = async (id: string) => {
  if (!confirm('Excluir este veículo?')) return;
  await veiculosApi.deletar(id);
  await carregar();
};

onMounted(carregar);
</script>
