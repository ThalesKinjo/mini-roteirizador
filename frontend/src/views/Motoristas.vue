<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">{{ editandoId ? 'Editar Motorista' : 'Novo Motorista' }}</h2>
      <form @submit.prevent="salvar" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input v-model="form.nome" type="text" required placeholder="Nome completo" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
          <input
            v-model="form.cpf"
            type="text"
            required
            placeholder="000.000.000-00"
            maxlength="14"
            @input="mascararCpf"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div v-if="erro" class="md:col-span-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {{ erro }}
        </div>
        <div class="md:col-span-2 flex gap-2">
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
        <h2 class="text-lg font-semibold">Motoristas <span class="text-gray-400 text-sm">({{ motoristas.length }})</span></h2>
        <button @click="carregar" class="text-sm text-blue-600 hover:text-blue-800">Atualizar</button>
      </div>

      <div v-if="carregando" class="text-center py-10 text-gray-400">Carregando...</div>
      <div v-else-if="motoristas.length === 0" class="text-center py-10 text-gray-400">Nenhum motorista cadastrado.</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">CPF</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="m in motoristasPaginados" :key="m.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-gray-800">{{ m.nome }}</td>
              <td class="px-4 py-3 font-mono text-gray-600">{{ m.cpf }}</td>
              <td class="px-4 py-3 space-x-3">
                <button @click="editar(m)" class="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                <button @click="deletar(m.id)" class="text-red-500 hover:text-red-700 font-medium">Excluir</button>
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
import { motoristasApi, type Motorista } from '../api';

const motoristas = ref<Motorista[]>([]);
const paginaAtual = ref(1);
const itensPorPagina = 10;
const totalPaginas = computed(() => Math.max(1, Math.ceil(motoristas.value.length / itensPorPagina)));
const motoristasPaginados = computed(() =>
  motoristas.value.slice((paginaAtual.value - 1) * itensPorPagina, paginaAtual.value * itensPorPagina)
);

const carregando = ref(false);
const salvando = ref(false);
const editandoId = ref<string | null>(null);
const erro = ref<string | null>(null);

const formVazio = () => ({ nome: '', cpf: '' });
const form = ref(formVazio());

const mascararCpf = (e: Event) => {
  let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  form.value.cpf = v;
};

const carregar = async () => {
  carregando.value = true;
  try {
    motoristas.value = (await motoristasApi.listar()).data;
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
      await motoristasApi.atualizar(editandoId.value, form.value);
    } else {
      await motoristasApi.criar(form.value);
    }
    cancelar();
    await carregar();
  } catch (e: any) {
    const data = e?.response?.data;
    erro.value = data?.errors?.join(', ') || data?.error || 'Erro ao salvar motorista.';
  } finally {
    salvando.value = false;
  }
};

const editar = (m: Motorista) => {
  editandoId.value = m.id;
  form.value = { nome: m.nome, cpf: m.cpf };
};

const cancelar = () => {
  editandoId.value = null;
  form.value = formVazio();
  erro.value = null;
};

const deletar = async (id: string) => {
  if (!confirm('Excluir este motorista?')) return;
  await motoristasApi.deletar(id);
  await carregar();
};

onMounted(carregar);
</script>
