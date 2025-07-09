import './assets/main.css'
import 'flowbite';

import { createApp } from 'vue';
import App from './App.vue';
import { initFabricGlobalProps } from '@/utils/fabricSetup';
initFabricGlobalProps();

createApp(App).mount('#app')