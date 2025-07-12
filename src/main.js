import './assets/main.css'
import 'flowbite';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initFabricGlobalProps } from '@/utils/fabricSetup';
initFabricGlobalProps();

createApp(App).use(router).mount('#app')