<template>
  <div class="w-full rounded-lg overflow-hidden relative" style="height: 400px;">
    <div ref="mapEl" class="w-full h-full"></div>
    <div v-if="carregandoRota" class="absolute inset-0 bg-white/70 flex items-center justify-center text-sm text-gray-500">
      Calculando trajeto pelas ruas...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import type { ResultadoRota } from '../api'

const props = defineProps<{ rota: ResultadoRota }>()

const mapEl = ref<HTMLElement | null>(null)
const carregandoRota = ref(false)
let mapa: L.Map | null = null

async function buscarTrajeto(coords: [number, number][]): Promise<[number, number][]> {
  const waypoints = coords.map(([lat, lon]) => `${lon},${lat}`).join(';')
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
    )
    const data = await res.json()
    if (data.code === 'Ok' && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon])
    }
  } catch {
    // fallback para linha reta
  }
  return coords
}

async function renderizar() {
  if (!mapEl.value || !props.rota.rota.length) return

  const coords: [number, number][] = props.rota.rota.map(e => [
    parseFloat(String(e.latitude)),
    parseFloat(String(e.longitude))
  ])

  if (mapa) { mapa.remove(); mapa = null }

  mapa = L.map(mapEl.value)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
  }).addTo(mapa)

  // Marcadores numerados
  coords.forEach((coord, i) => {
    const endereco = props.rota.rota[i]
    const icone = L.divIcon({
      html: `<div style="background:#2563eb;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.35)">${i + 1}</div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
    L.marker(coord, { icon: icone })
      .bindPopup(`<b>${i + 1}. ${endereco.rua}${endereco.numero ? ', ' + endereco.numero : ''}</b><br>${endereco.cidade}/${endereco.estado}`)
      .addTo(mapa!)
  })

  mapa.fitBounds(L.latLngBounds(coords), { padding: [40, 40] })

  // Busca trajeto real pelas ruas
  carregandoRota.value = true
  const trajeto = await buscarTrajeto(coords)
  carregandoRota.value = false

  if (mapa) {
    L.polyline(trajeto, { color: '#2563eb', weight: 4, opacity: 0.85 }).addTo(mapa)
    if (trajeto.length > coords.length) {
      mapa.fitBounds(L.latLngBounds(trajeto), { padding: [40, 40] })
    }
  }
}

onMounted(async () => {
  await nextTick()
  renderizar()
})

watch(() => props.rota, async () => {
  await nextTick()
  renderizar()
}, { deep: true })

onUnmounted(() => { mapa?.remove(); mapa = null })
</script>
