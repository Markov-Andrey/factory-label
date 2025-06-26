<template>
    <div class="relative inline-block">
        <button
            :class="[
        'flex items-center justify-center gap-2 rounded py-1 px-4 text-white transition-colors duration-200',
        colorClass,
        props.disabled ? 'opacity-50 cursor-default' : 'hover:brightness-90 cursor-pointer'
      ]"
            :disabled="props.disabled"
            @mouseenter="show = true"
            @mouseleave="show = false"
            @click="handleClick"
        >
            <component
                v-if="IconComponent"
                :is="IconComponent"
                class="w-5 h-5 flex-shrink-0"
                aria-hidden="true"
            />
            <slot />
        </button>

        <div
            v-if="tooltip && show"
            class="absolute bottom-full mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap select-none z-50"
        >
            {{ tooltip }}
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import * as heroicons from '@heroicons/vue/24/outline'

const props = defineProps({
    color: { type: String, default: 'green' },
    icon: { type: String, default: null },
    tooltip: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
})

const colorClass = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    gray: 'bg-gray-600',
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
}[props.color] ?? 'bg-blue-600'

const IconComponent = props.icon ? heroicons[props.icon] : null
const show = ref(false)

function handleClick(event) {
    if (props.disabled) {
        event.preventDefault()
        event.stopImmediatePropagation()
    }
}
</script>
