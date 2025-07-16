<template>
    <transition
        name="fade-slide"
        @before-leave="beforeLeave"
        @leave="leave"
        @after-leave="$emit('after-leave')"
    >
        <div v-if="visible" ref="alert" class="w-full overflow-hidden rounded shadow-lg">
            <div
                :class="['flex items-center p-4 border-t-4', alertClasses[type] || alertClasses.info]"
                role="alert"
            >
                <SvgInfo />
                <div class="ms-3 text-sm font-medium flex-1">{{ message }}</div>
                <button
                    type="button"
                    class="ms-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8"
                    :class="closeButtonClasses[type] || closeButtonClasses.info"
                    @click="$emit('close')"
                >
                    <span class="sr-only">Dismiss</span>
                    <SvgCross />
                </button>
            </div>
        </div>
    </transition>
</template>

<script>
import SvgInfo from "@/components/SvgInfo.vue";
import SvgCross from "@/components/SvgCross.vue";

export default {
    name: "AlertComponent",
    components: { SvgCross, SvgInfo },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        type: {
            type: String,
            default: "info",
            validator(val) {
                return ["info", "success", "error", "warning", "dark"].includes(val);
            },
        },
        message: {
            type: String,
            required: true,
        },
    },
    methods: {
        beforeLeave(el) {
            el.style.height = el.scrollHeight + "px";
            el.style.opacity = 1;
            el.style.transform = "translateY(0)";
            el.style.transition = "height 0.5s ease, opacity 0.5s ease, transform 0.5s ease";
        },
        leave(el, done) {
            requestAnimationFrame(() => {
                el.style.height = 0;
                el.style.opacity = 0;
                el.style.transform = "translateY(-20px)";
            });
            setTimeout(done, 500);
        },
    },
    data() {
        return {
            alertClasses: {
                info: "text-sky-700 border-sky-700 bg-sky-100",
                success: "text-green-700 border-green-700 bg-green-50",
                error: "text-red-700 border-red-700 bg-red-50",
                warning: "text-yellow-500 border-yellow-500 bg-yellow-50",
            },
            closeButtonClasses: {
                info: "bg-gray-500 text-sky-400 hover:bg-gray-600",
                success: "bg-gray-500 text-green-400 hover:bg-gray-600",
                error: "bg-gray-500 text-red-400 hover:bg-gray-600",
                warning: "bg-gray-500 text-yellow-300 hover:bg-gray-600",
            },
        };
    },
};
</script>

<style scoped>
.fade-slide-enter-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
}
.fade-slide-enter-to {
    opacity: 1;
    transform: translateY(0);
}
</style>
