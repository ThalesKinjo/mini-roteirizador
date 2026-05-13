import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  enderecosApi,
  veiculosApi,
  motoristasApi,
  type Endereco,
  type Veiculo,
  type Motorista,
  type ResultadoRota,
} from '../api';

export const useAppStore = defineStore('app', () => {
  const enderecos = ref<Endereco[]>([]);
  const veiculos = ref<Veiculo[]>([]);
  const motoristas = ref<Motorista[]>([]);
  const rotaCalculada = ref<ResultadoRota | null>(null);

  const carregandoEnderecos = ref(false);
  const carregandoVeiculos = ref(false);
  const carregandoMotoristas = ref(false);

  async function fetchEnderecos() {
    carregandoEnderecos.value = true;
    try {
      enderecos.value = (await enderecosApi.listar()).data;
    } finally {
      carregandoEnderecos.value = false;
    }
  }

  async function fetchVeiculos() {
    carregandoVeiculos.value = true;
    try {
      veiculos.value = (await veiculosApi.listar()).data;
    } finally {
      carregandoVeiculos.value = false;
    }
  }

  async function fetchMotoristas() {
    carregandoMotoristas.value = true;
    try {
      motoristas.value = (await motoristasApi.listar()).data;
    } finally {
      carregandoMotoristas.value = false;
    }
  }

  function setRotaCalculada(rota: ResultadoRota | null) {
    rotaCalculada.value = rota;
  }

  return {
    enderecos,
    veiculos,
    motoristas,
    rotaCalculada,
    carregandoEnderecos,
    carregandoVeiculos,
    carregandoMotoristas,
    fetchEnderecos,
    fetchVeiculos,
    fetchMotoristas,
    setRotaCalculada,
  };
});
