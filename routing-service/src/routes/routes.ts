import { Router, Request, Response } from 'express'
import { AppDataSource } from '../db/dataSource'
import { Route } from '../entities/Route'
import { getAddressByIds, getVehicle, batchUpdateAddresses } from '../services/managementService'
import { nearestNeighbor, calcularDistanciaTotal } from '../services/routeService'
import { RouteCalculationRequest, RouteAssignmentRequest } from '../types'

const router = Router()

router.post('/calcular', async (req: Request, res: Response) => {
  try {
    const { veiculo_id, endereco_ids }: RouteCalculationRequest = req.body

    if (!veiculo_id || !endereco_ids?.length) {
      return res.status(400).json({ error: 'veiculo_id e endereco_ids são obrigatórios' })
    }

    const [veiculo, enderecos] = await Promise.all([
      getVehicle(veiculo_id),
      getAddressByIds(endereco_ids)
    ])

    const comCoordenadas = enderecos.filter(e => e.latitude != null && e.longitude != null)

    let aviso: string | undefined
    if (enderecos.length > comCoordenadas.length) {
      aviso = `${enderecos.length - comCoordenadas.length} endereço(s) sem coordenadas foram ignorados na roteirização.`
    }

    const paraRoteirizar = comCoordenadas.slice(0, veiculo.capacidade)
    if (comCoordenadas.length > veiculo.capacidade) {
      aviso = `Capacidade do veículo (${veiculo.capacidade}) excedida. Roteirizando os primeiros ${veiculo.capacidade} endereços.`
    }

    const rota = nearestNeighbor(paraRoteirizar)

    res.json({
      veiculo_id,
      rota,
      total_enderecos: rota.length,
      ...(aviso && { aviso })
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao calcular rota' })
  }
})

router.post('/atribuir', async (req: Request, res: Response) => {
  try {
    const { veiculo_id, endereco_ids, motorista_id }: RouteAssignmentRequest = req.body

    if (!veiculo_id || !endereco_ids?.length) {
      return res.status(400).json({ error: 'veiculo_id e endereco_ids são obrigatórios' })
    }

    const [veiculo, enderecos] = await Promise.all([
      getVehicle(veiculo_id),
      getAddressByIds(endereco_ids)
    ])

    const comCoordenadas = enderecos.filter(e => e.latitude != null && e.longitude != null)
    const paraAtribuir = comCoordenadas.slice(0, veiculo.capacidade)
    const rotaOrdenada = nearestNeighbor(paraAtribuir)

    await batchUpdateAddresses(rotaOrdenada.map(e => e.id), veiculo_id, 'em_rota')

    const routeRepo = AppDataSource.getRepository(Route)
    const rota = routeRepo.create({
      vehicleId: veiculo_id,
      motoristaId: motorista_id ?? null,
      addressIds: rotaOrdenada.map(e => e.id),
      status: 'atribuida',
      distanciaTotalKm: calcularDistanciaTotal(rotaOrdenada)
    })
    await routeRepo.save(rota)

    res.json({ message: 'Rota atribuída com sucesso', rota_id: rota.id })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao atribuir rota' })
  }
})

router.get('/', async (_req: Request, res: Response) => {
  try {
    const routeRepo = AppDataSource.getRepository(Route)
    const rotas = await routeRepo.find({ order: { createdAt: 'DESC' } })
    res.json(rotas)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao buscar rotas' })
  }
})

export default router
