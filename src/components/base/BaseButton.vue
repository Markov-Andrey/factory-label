<template>
    <button
        :class="[
      'flex items-center gap-2 rounded py-1 px-4 text-white transition-colors duration-200',
      colorClass,
    ]"
    >
        <component
            v-if="IconComponent"
            :is="IconComponent"
            class="w-5 h-5 flex-shrink-0"
            aria-hidden="true"
        />
        <span class="flex-1 flex items-center">
      <slot />
    </span>
    </button>
</template>

<script setup>
import * as heroicons from '@heroicons/vue/24/outline'

const props = defineProps({
    color: {
        type: String,
        default: 'green',
    },
    icon: {
        type: String,
        default: null,
    }
})

const colorClass = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    gray: 'bg-gray-600 hover:bg-gray-700',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    red: 'bg-red-600 hover:bg-red-700',
}[props.color] ?? 'bg-blue-600 hover:bg-blue-700'

const IconComponent = props.icon ? heroicons[props.icon] : null
</script>
