import axios from 'axios';

const gestaoHttp = axios.create({
  baseURL: import.meta.env.VITE_MS_GESTAO_URL || 'http://localhost:3001',
});

const roteirizacaoHttp = axios.create({
  baseURL: import.meta.env.VITE_MS_ROTEIRIZACAO_URL || 'http://localhost:4000',
});

export interface Endereco {
  id: string;
  rua: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  veiculo_id: string | null;
}

export interface Veiculo {
  id: string;
  placa: string;
  capacidade: number;
  modelo: string;
}

export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
}

export interface ResultadoRota {
  veiculo_id: string;
  rota: Endereco[];
  total_enderecos: number;
  aviso?: string;
}

export const enderecosApi = {
  listar: () => gestaoHttp.get<Endereco[]>('/api/v1/enderecos'),
  buscar: (id: string) => gestaoHttp.get<Endereco>(`/api/v1/enderecos/${id}`),
  criar: (data: Omit<Endereco, 'id' | 'status' | 'veiculo_id'>) =>
    gestaoHttp.post<Endereco>('/api/v1/enderecos', { endereco: data }),
  atualizar: (id: string, data: Partial<Endereco>) =>
    gestaoHttp.patch<Endereco>(`/api/v1/enderecos/${id}`, { endereco: data }),
  deletar: (id: string) => gestaoHttp.delete(`/api/v1/enderecos/${id}`),
};

export const veiculosApi = {
  listar: () => gestaoHttp.get<Veiculo[]>('/api/v1/veiculos'),
  criar: (data: Omit<Veiculo, 'id'>) =>
    gestaoHttp.post<Veiculo>('/api/v1/veiculos', { veiculo: data }),
  atualizar: (id: string, data: Partial<Veiculo>) =>
    gestaoHttp.patch<Veiculo>(`/api/v1/veiculos/${id}`, { veiculo: data }),
  deletar: (id: string) => gestaoHttp.delete(`/api/v1/veiculos/${id}`),
};

export const motoristasApi = {
  listar: () => gestaoHttp.get<Motorista[]>('/api/v1/motoristas'),
  criar: (data: Omit<Motorista, 'id'>) =>
    gestaoHttp.post<Motorista>('/api/v1/motoristas', { motorista: data }),
  atualizar: (id: string, data: Partial<Motorista>) =>
    gestaoHttp.patch<Motorista>(`/api/v1/motoristas/${id}`, { motorista: data }),
  deletar: (id: string) => gestaoHttp.delete(`/api/v1/motoristas/${id}`),
};

export interface RotaSalva {
  id: string;
  vehicleId: string;
  motoristaId: string | null;
  addressIds: string[];
  status: string;
  distanciaTotalKm: number;
  createdAt: string;
}

export const roteirizacaoApi = {
  calcular: (veiculo_id: string, endereco_ids: string[]) =>
    roteirizacaoHttp.post<ResultadoRota>('/rotas/calcular', { veiculo_id, endereco_ids }),
  atribuir: (veiculo_id: string, endereco_ids: string[], motorista_id?: string) =>
    roteirizacaoHttp.post('/rotas/atribuir', { veiculo_id, endereco_ids, motorista_id }),
  listarRotas: () =>
    roteirizacaoHttp.get<RotaSalva[]>('/rotas'),
};
