<template>
    <label class="flex flex-col text-sm font-medium text-gray-700">
        <span v-if="label">{{ label }}</span>
        <input
            :type="type"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            :class="`mt-1 rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring ${className}`"
            v-bind="$attrs"
        />
    </label>
</template>

<script setup>
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
})

const emit = defineEmits(['update:modelValue'])
</script>
