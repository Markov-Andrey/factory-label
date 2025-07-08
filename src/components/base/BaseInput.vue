<template>
    <label
        class="relative flex flex-col text-sm font-medium text-gray-700"
        @mouseenter="show = true"
        @mouseleave="show = false"
    >
        <span v-if="label">{{ label }}</span>
        <input
            :type="type"
            :value="modelValue"
            @input="handleInput"
            :step="step"
            :disabled="$attrs.disabled"
            :class="[
                `mt-1 rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring ${className}`,
                $attrs.disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'
            ]"
            v-bind="$attrs"
        />
        <div
            v-if="tooltip && show"
            class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap select-none z-50"
        >
            {{ tooltip }}
        </div>
    </label>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    modelValue: [String, Number],
    type: {
        type: String,
        default: 'text',
    },
    label: {
        type: String,
        default: '',
    },
    className: {
        type: String,
        default: '',
    },
    step: {
        type: [String, Number],
        default: undefined,
    },
    tooltip: {
        type: String,
        default: '',
    }
})

const emit = defineEmits(['update:modelValue'])
const show = ref(false)

function handleInput(event) {
    let value = event.target.value

    if (props.type === 'number') {
        value = value === '' ? '' : parseFloat(value)
    }

    emit('update:modelValue', value)
}
</script>
