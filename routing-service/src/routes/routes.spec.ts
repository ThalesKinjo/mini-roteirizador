import request from 'supertest'
import app from '../app'
import * as managementService from '../services/managementService'
import { AppDataSource } from '../db/dataSource'
import { AddressDetail, VehicleDetail } from '../types'

jest.mock('../services/managementService')
jest.mock('../db/dataSource', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}))

const mockGetVehicle = managementService.getVehicle as jest.MockedFunction<typeof managementService.getVehicle>
const mockGetAddressByIds = managementService.getAddressByIds as jest.MockedFunction<typeof managementService.getAddressByIds>
const mockBatchUpdate = managementService.batchUpdateAddresses as jest.MockedFunction<typeof managementService.batchUpdateAddresses>
const mockGetRepository = AppDataSource.getRepository as jest.MockedFunction<typeof AppDataSource.getRepository>

const veiculo: VehicleDetail = { id: 'v1', placa: 'ABC-1234', capacidade: 10, modelo: 'Fiorino' }

const endereco = (id: string, latOffset = 0): AddressDetail => ({
  id,
  rua: 'Rua A',
  numero: '1',
  cidade: 'Campo Grande',
  estado: 'MS',
  cep: '79000-000',
  latitude: -20.46 + latOffset,
  longitude: -54.62 + latOffset,
  status: 'pendente',
  veiculo_id: null,
})

const fakeRepo = () => ({
  create: jest.fn().mockReturnValue({ id: 'rota-123' }),
  save: jest.fn().mockResolvedValue({ id: 'rota-123' }),
  find: jest.fn().mockResolvedValue([]),
})

describe('POST /rotas/calcular', () => {
  it('retorna 400 quando veiculo_id está ausente', async () => {
    const res = await request(app).post('/rotas/calcular').send({ endereco_ids: ['e1'] })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('retorna 400 quando endereco_ids está ausente', async () => {
    const res = await request(app).post('/rotas/calcular').send({ veiculo_id: 'v1' })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando endereco_ids está vazio', async () => {
    const res = await request(app).post('/rotas/calcular').send({ veiculo_id: 'v1', endereco_ids: [] })
    expect(res.status).toBe(400)
  })

  it('calcula e retorna rota com sucesso', async () => {
    mockGetVehicle.mockResolvedValue(veiculo)
    mockGetAddressByIds.mockResolvedValue([endereco('e1', 0), endereco('e2', 0.01)])

    const res = await request(app).post('/rotas/calcular').send({ veiculo_id: 'v1', endereco_ids: ['e1', 'e2'] })

    expect(res.status).toBe(200)
    expect(res.body.veiculo_id).toBe('v1')
    expect(res.body.rota).toHaveLength(2)
    expect(res.body.total_enderecos).toBe(2)
    expect(res.body.aviso).toBeUndefined()
  })

  it('emite aviso e trunca quando capacidade do veículo é excedida', async () => {
    mockGetVehicle.mockResolvedValue({ ...veiculo, capacidade: 1 })
    mockGetAddressByIds.mockResolvedValue([endereco('e1', 0), endereco('e2', 0.01)])

    const res = await request(app).post('/rotas/calcular').send({ veiculo_id: 'v1', endereco_ids: ['e1', 'e2'] })

    expect(res.status).toBe(200)
    expect(res.body.rota).toHaveLength(1)
    expect(res.body.aviso).toContain('Capacidade')
  })

  it('ignora endereços sem coordenadas e emite aviso', async () => {
    mockGetVehicle.mockResolvedValue(veiculo)
    const semCoordenadas = { ...endereco('e2', 0.01), latitude: null as any, longitude: null as any }
    mockGetAddressByIds.mockResolvedValue([endereco('e1', 0), semCoordenadas])

    const res = await request(app).post('/rotas/calcular').send({ veiculo_id: 'v1', endereco_ids: ['e1', 'e2'] })

    expect(res.status).toBe(200)
    expect(res.body.rota).toHaveLength(1)
    expect(res.body.aviso).toContain('sem coordenadas')
  })

  it('retorna 500 quando o management-service falha', async () => {
    mockGetVehicle.mockRejectedValue(new Error('Connection refused'))

    const res = await request(app).post('/rotas/calcular').send({ veiculo_id: 'v1', endereco_ids: ['e1'] })

    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Connection refused')
  })
})

describe('POST /rotas/atribuir', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetRepository.mockReturnValue(fakeRepo() as any)
    mockBatchUpdate.mockResolvedValue(undefined)
  })

  it('retorna 400 quando veiculo_id está ausente', async () => {
    const res = await request(app).post('/rotas/atribuir').send({ endereco_ids: ['e1'] })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando endereco_ids está ausente', async () => {
    const res = await request(app).post('/rotas/atribuir').send({ veiculo_id: 'v1' })
    expect(res.status).toBe(400)
  })

  it('atribui rota com sucesso e persiste no banco', async () => {
    mockGetVehicle.mockResolvedValue(veiculo)
    mockGetAddressByIds.mockResolvedValue([endereco('e1', 0), endereco('e2', 0.01)])

    const res = await request(app).post('/rotas/atribuir').send({ veiculo_id: 'v1', endereco_ids: ['e1', 'e2'] })

    expect(res.status).toBe(200)
    expect(res.body.message).toContain('sucesso')
    expect(res.body.rota_id).toBeDefined()
  })

  it('chama batchUpdateAddresses com status em_rota', async () => {
    mockGetVehicle.mockResolvedValue(veiculo)
    mockGetAddressByIds.mockResolvedValue([endereco('e1', 0), endereco('e2', 0.01)])

    await request(app).post('/rotas/atribuir').send({ veiculo_id: 'v1', endereco_ids: ['e1', 'e2'] })

    expect(mockBatchUpdate).toHaveBeenCalledTimes(1)
    const [ids, veiculoId, status] = mockBatchUpdate.mock.calls[0]
    expect(ids).toHaveLength(2)
    expect(veiculoId).toBe('v1')
    expect(status).toBe('em_rota')
  })

  it('retorna 500 quando o management-service falha ao atribuir', async () => {
    mockGetVehicle.mockRejectedValue(new Error('Serviço indisponível'))

    const res = await request(app).post('/rotas/atribuir').send({ veiculo_id: 'v1', endereco_ids: ['e1'] })

    expect(res.status).toBe(500)
    expect(res.body.error).toBeDefined()
  })
})

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
