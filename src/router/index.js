// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LabelEditor from '../views/LabelEditor.vue';

const routes = [
    { path: '/', name: 'LabelEditor', component: LabelEditor },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
