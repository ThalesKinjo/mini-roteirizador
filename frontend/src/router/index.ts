import { createRouter, createWebHistory } from 'vue-router';
import Enderecos from '../views/Enderecos.vue';
import Veiculos from '../views/Veiculos.vue';
import Roteirizacao from '../views/Roteirizacao.vue';
import Motoristas from '../views/Motoristas.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/enderecos' },
    { path: '/enderecos', component: Enderecos },
    { path: '/veiculos', component: Veiculos },
    { path: '/motoristas', component: Motoristas },
    { path: '/roteirizacao', component: Roteirizacao },
  ],
});

export default router;
