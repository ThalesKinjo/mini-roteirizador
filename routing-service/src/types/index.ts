export interface AddressDetail {
  id: string
  rua: string
  numero: string
  cidade: string
  estado: string
  cep: string
  latitude: number
  longitude: number
  status: 'pendente' | 'em_rota' | 'entregue'
  veiculo_id: string | null
}

export interface VehicleDetail {
  id: string
  placa: string
  capacidade: number
  modelo: string
}

export interface RouteCalculationRequest {
  veiculo_id: string
  endereco_ids: string[]
}

export interface RouteAssignmentRequest {
  veiculo_id: string
  endereco_ids: string[]
  motorista_id?: string
}

export interface RouteCalculationResult {
  veiculo_id: string
  rota: AddressDetail[]
  total_enderecos: number
  aviso?: string
}
