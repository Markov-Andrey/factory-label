<template>
    <div class="relative inline-block" @mouseenter="show = true" @mouseleave="show = false">
        <select
            :value="modelValue"
            @change="onChange"
            :title="tooltip"
            :disabled="disabled"
            :class="[
              'py-3 px-4 pe-9 block w-full border rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none',
              disabled ? 'bg-gray-200 cursor-not-allowed border-gray-300' : 'border-gray-200'
            ]"
        >
            <option disabled value="">{{ placeholder }}</option>
            <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
        </select>
        <div
            v-if="tooltip && show"
            class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap select-none z-50"
        >
            {{ tooltip }}
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
    options: Array,
    modelValue: { type: [String, Number], default: '' },
    placeholder: { type: String, default: '' },
    tooltip: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])
const show = ref(false)

function onChange(e) {
    if (!props.disabled) {
        const val = e.target.value
        emit('update:modelValue', val)
        emit('change', val)
    }
}
</script>
