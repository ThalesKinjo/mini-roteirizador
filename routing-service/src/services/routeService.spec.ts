import { haversineKm, nearestNeighbor, calcularDistanciaTotal } from './routeService'
import { AddressDetail } from '../types'

const addr = (id: string, lat: number, lon: number): AddressDetail => ({
  id,
  rua: 'Rua Teste',
  numero: '1',
  cidade: 'Campo Grande',
  estado: 'MS',
  cep: '79000-000',
  latitude: lat,
  longitude: lon,
  status: 'pendente',
  veiculo_id: null,
})

describe('haversineKm', () => {
  it('retorna 0 para o mesmo ponto', () => {
    expect(haversineKm(-20.4697, -54.6201, -20.4697, -54.6201)).toBe(0)
  })

  it('calcula distância aproximada entre São Paulo e Rio de Janeiro (~357 km)', () => {
    const dist = haversineKm(-23.5505, -46.6333, -22.9068, -43.1729)
    expect(dist).toBeGreaterThan(340)
    expect(dist).toBeLessThan(370)
  })

  it('é simétrica: dist(A→B) === dist(B→A)', () => {
    const d1 = haversineKm(-20.4697, -54.6201, -15.7801, -47.9292)
    const d2 = haversineKm(-15.7801, -47.9292, -20.4697, -54.6201)
    expect(d1).toBeCloseTo(d2, 10)
  })

  it('retorna valor positivo para pontos distintos', () => {
    expect(haversineKm(-20.4697, -54.6201, -21.0, -55.0)).toBeGreaterThan(0)
  })
})

describe('nearestNeighbor', () => {
  it('retorna array vazio para entrada vazia', () => {
    expect(nearestNeighbor([])).toEqual([])
  })

  it('retorna o único elemento quando há apenas um endereço', () => {
    const a = addr('a', -20.0, -54.0)
    expect(nearestNeighbor([a])).toEqual([a])
  })

  it('preserva todos os endereços na rota', () => {
    const enderecos = [
      addr('a', -20.0, -54.0),
      addr('b', -21.0, -55.0),
      addr('c', -19.0, -53.0),
      addr('d', -22.0, -56.0),
    ]
    const result = nearestNeighbor(enderecos)
    expect(result).toHaveLength(4)
    expect(result.map(r => r.id).sort()).toEqual(['a', 'b', 'c', 'd'])
  })

  it('começa sempre pelo primeiro elemento da lista original', () => {
    const enderecos = [
      addr('primeiro', -20.0, -54.0),
      addr('b', -21.0, -55.0),
      addr('c', -19.0, -53.0),
    ]
    const result = nearestNeighbor(enderecos)
    expect(result[0].id).toBe('primeiro')
  })

  it('visita o vizinho mais próximo a cada passo', () => {
    // A = origem
    // B = muito próximo de A (~1.5 km)
    // C = longe de A (~280 km)
    const a = addr('A', -20.00, -54.00)
    const b = addr('B', -20.01, -54.01)
    const c = addr('C', -22.50, -56.50)

    // Partindo de A: B é o mais próximo → depois C
    const result = nearestNeighbor([a, c, b])
    expect(result[0].id).toBe('A')
    expect(result[1].id).toBe('B')
    expect(result[2].id).toBe('C')
  })

  it('não modifica o array original', () => {
    const enderecos = [addr('a', -20.0, -54.0), addr('b', -21.0, -55.0)]
    const copia = [...enderecos]
    nearestNeighbor(enderecos)
    expect(enderecos).toEqual(copia)
  })
})

describe('calcularDistanciaTotal', () => {
  it('retorna 0 para rota vazia', () => {
    expect(calcularDistanciaTotal([])).toBe(0)
  })

  it('retorna 0 para rota com um único ponto', () => {
    expect(calcularDistanciaTotal([addr('a', -20.0, -54.0)])).toBe(0)
  })

  it('retorna a distância entre dois pontos', () => {
    const a = addr('a', -20.4697, -54.6201)
    const b = addr('b', -22.9068, -43.1729)
    const expected = Math.round(haversineKm(a.latitude, a.longitude, b.latitude, b.longitude) * 100) / 100
    expect(calcularDistanciaTotal([a, b])).toBe(expected)
  })

  it('soma as distâncias entre pontos consecutivos', () => {
    const a = addr('a', -20.0, -54.0)
    const b = addr('b', -21.0, -55.0)
    const c = addr('c', -22.0, -56.0)
    const expected = Math.round(
      (haversineKm(-20, -54, -21, -55) + haversineKm(-21, -55, -22, -56)) * 100
    ) / 100
    expect(calcularDistanciaTotal([a, b, c])).toBe(expected)
  })

  it('retorna resultado arredondado em 2 casas decimais', () => {
    const a = addr('a', -20.123456, -54.654321)
    const b = addr('b', -21.987654, -55.123456)
    const result = calcularDistanciaTotal([a, b])
    expect(result).toBe(Math.round(result * 100) / 100)
  })
})
