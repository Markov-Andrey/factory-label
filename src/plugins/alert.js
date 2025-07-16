import { createApp } from 'vue';
import AlertManager from '@/components/AlertManager.vue';

let managerApp = null;
let managerInstance = null;

export default {
    install(app) {
        if (!managerApp) {
            const container = document.createElement('div');
            document.body.appendChild(container);

            managerApp = createApp(AlertManager);
            managerInstance = managerApp.mount(container);
        }

        app.config.globalProperties.$alert = (message, type = 'info') => {
            managerInstance.addAlert(message, type);
        };
    },
};
