// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LabelEditor from '../views/LabelEditor.vue';
import TemplatesView from '../views/TemplatesPage.vue';
import TemplateSinglePage from '../views/TemplateSinglePage.vue';

const routes = [
    { path: '/', name: 'LabelEditor', component: LabelEditor },
    { path: '/templates', name: 'TemplatesView', component: TemplatesView },
    { path: '/templates/:id', name: 'TemplateSinglePage', component: TemplateSinglePage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
