import './assets/main.css'
import 'flowbite';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import AlertPlugin from './plugins/alert';
import { initFabricGlobalProps } from '@/utils/fabricSetup';
initFabricGlobalProps();

const app = createApp(App);
app.use(router);
app.use(AlertPlugin);
app.mount('#app');