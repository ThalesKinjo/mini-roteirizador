<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="aberto" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="$emit('cancelar')" />
        <div class="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
          <h3 class="text-base font-semibold text-gray-800 mb-2">{{ titulo }}</h3>
          <p class="text-sm text-gray-600 mb-6">{{ mensagem }}</p>
          <div class="flex justify-end gap-3">
            <button
              @click="$emit('cancelar')"
              class="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="$emit('confirmar')"
              :class="variante === 'perigo'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'"
              class="px-4 py-2 text-sm rounded transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  aberto: boolean
  titulo: string
  mensagem: string
  variante?: 'perigo' | 'primario'
}>()

defineEmits<{
  confirmar: []
  cancelar: []
}>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
