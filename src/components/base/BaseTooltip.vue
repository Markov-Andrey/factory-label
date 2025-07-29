<template>
    <transition name="fade-tooltip" appear>
        <div
            v-show="visible"
            :id="tooltipId"
            role="tooltip"
            :class="[
        'absolute z-50 px-3 py-1 text-xs text-white bg-gray-600 rounded shadow-lg whitespace-nowrap select-none transition-opacity duration-200',
        placementClass,
      ]"
        >
            {{ text }}
            <div :class="['arrow', arrowPlacementClass]"></div>
        </div>
    </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    text: { type: String, required: true },
    placement: { type: String, default: 'top' },
    tooltipId: { type: String, required: true },
    show: { type: Boolean, default: true },
})

const visible = ref(props.show)

watch(() => props.show, (newVal) => {
    visible.value = newVal
})

const placementClass = computed(() => {
    switch (props.placement) {
        case 'top':
            return 'bottom-full mb-2 left-1/2 -translate-x-1/2'
        case 'bottom':
            return 'top-full mt-2 left-1/2 -translate-x-1/2'
        case 'left':
            return 'right-full mr-2 top-1/2 -translate-y-1/2'
        case 'right':
            return 'left-full ml-2 top-1/2 -translate-y-1/2'
        default:
            return ''
    }
})

const arrowPlacementClass = computed(() => {
    switch (props.placement) {
        case 'top':
            return 'arrow-down'
        case 'bottom':
            return 'arrow-up'
        case 'left':
            return 'arrow-right'
        case 'right':
            return 'arrow-left'
        default:
            return ''
    }
})
</script>

<style scoped>
.fade-tooltip-enter-active,
.fade-tooltip-leave-active {
    transition: opacity .3s ease-in;
}
.fade-tooltip-enter-from,
.fade-tooltip-leave-to {
    opacity: 0;
}
.fade-tooltip-enter-to,
.fade-tooltip-leave-from {
    opacity: 1;
}

.arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
}
.arrow-down {
    top: 100%;
    left: 50%;
    transform: translateX(-50%) rotate(180deg);
    border-width: 0 5px 5px 5px;
    border-color: transparent transparent #4b5563 transparent;
}
.arrow-up {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) rotate(180deg);
    border-width: 5px 5px 0 5px;
    border-color: #4b5563 transparent transparent transparent;
}
.arrow-right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    border-width: 5px 5px 5px 0;
    border-color: transparent #4b5563 transparent transparent;
}
.arrow-left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    border-width: 5px 0 5px 5px;
    border-color: transparent transparent transparent #4b5563;
}
</style>
