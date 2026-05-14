<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-blue-700 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-xl font-bold tracking-tight">Mini Roteirizador</h1>
        <div class="flex gap-2">
          <router-link
            to="/enderecos"
            class="px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
            active-class="bg-blue-900"
          >
            Endereços
          </router-link>
          <router-link
            to="/veiculos"
            class="px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
            active-class="bg-blue-900"
          >
            Veículos
          </router-link>
          <router-link
            to="/motoristas"
            class="px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
            active-class="bg-blue-900"
          >
            Motoristas
          </router-link>
          <router-link
            to="/roteirizacao"
            class="px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
            active-class="bg-blue-900"
          >
            Roteirização
          </router-link>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
