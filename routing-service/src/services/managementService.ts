import axios from 'axios'
import { AddressDetail, VehicleDetail } from '../types'

const MANAGEMENT_URL = process.env.MANAGEMENT_SERVICE_URL || 'http://localhost:3001'

export async function getAddressByIds(ids: string[]): Promise<AddressDetail[]> {
  const requests = ids.map(id =>
    axios.get<AddressDetail>(`${MANAGEMENT_URL}/api/v1/enderecos/${id}`)
  )
  const responses = await Promise.all(requests)
  return responses.map(r => r.data)
}

export async function getVehicle(id: string): Promise<VehicleDetail> {
  const response = await axios.get<VehicleDetail>(`${MANAGEMENT_URL}/api/v1/veiculos/${id}`)
  return response.data
}

export async function batchUpdateAddresses(
  addressIds: string[],
  vehicleId: string,
  status: string
): Promise<void> {
  await axios.patch(`${MANAGEMENT_URL}/api/v1/enderecos/batch_update`, {
    addresses: addressIds.map(id => ({
      id,
      veiculo_id: vehicleId,
      status
    }))
  })
}
