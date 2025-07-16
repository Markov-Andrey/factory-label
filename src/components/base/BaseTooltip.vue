<template>
    <div
        :id="tooltipId"
        role="tooltip"
        :class="[
      'absolute z-50 px-3 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap select-none transition-opacity duration-200',
      placementClass,
    ]"
    >
        {{ text }}
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    text: { type: String, required: true },
    placement: { type: String, default: 'top' },
    tooltipId: { type: String, required: true },
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
</script>
