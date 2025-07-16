<template>
    <transition-group
        name="fade-slide"
        tag="div"
        class="fixed bottom-4 left-1/2 z-50 flex flex-col-reverse items-center"
        :style="{ width: '30vw', transform: 'translateX(-50%)', gap: '0.5rem' }"
    >
        <AlertComponent
            v-for="alert in alerts"
            :key="alert.id"
            :message="alert.message"
            :type="alert.type"
            :visible="alert.visible"
            @close="hideAlert(alert.id)"
            @after-leave="removeAlert(alert.id)"
        />
    </transition-group>
</template>

<script>
import AlertComponent from "./AlertComponent.vue";

export default {
    components: { AlertComponent },
    data() {
        return {
            alerts: [],
            nextId: 1,
        };
    },
    methods: {
        addAlert(message, type = "info") {
            const id = this.nextId++;
            this.alerts.push({ id, message, type, visible: true });

            if (this.alerts.length > 3) {
                this.hideAlert(this.alerts[0].id);
            }

            setTimeout(() => {
                this.hideAlert(id);
            }, 5000);
        },
        hideAlert(id) {
            const alert = this.alerts.find((a) => a.id === id);
            if (alert) alert.visible = false;
        },
        removeAlert(id) {
            this.alerts = this.alerts.filter((a) => a.id !== id);
        },
    },
};
</script>
