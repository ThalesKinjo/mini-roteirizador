import { AddressDetail } from '../types'

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function nearestNeighbor(enderecos: AddressDetail[]): AddressDetail[] {
  if (enderecos.length <= 1) return enderecos
  const unvisited = [...enderecos]
  const rota: AddressDetail[] = [unvisited.shift()!]

  while (unvisited.length > 0) {
    const ultimo = rota[rota.length - 1]
    let menorDist = Infinity
    let idx = 0

    for (let i = 0; i < unvisited.length; i++) {
      const dist = haversineKm(
        ultimo.latitude, ultimo.longitude,
        unvisited[i].latitude, unvisited[i].longitude
      )
      if (dist < menorDist) {
        menorDist = dist
        idx = i
      }
    }

    rota.push(unvisited.splice(idx, 1)[0])
  }

  return rota
}

export function calcularDistanciaTotal(rota: AddressDetail[]): number {
  let total = 0
  for (let i = 1; i < rota.length; i++) {
    total += haversineKm(
      rota[i - 1].latitude, rota[i - 1].longitude,
      rota[i].latitude, rota[i].longitude
    )
  }
  return Math.round(total * 100) / 100
}
