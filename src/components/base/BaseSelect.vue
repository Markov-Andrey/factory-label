<template>
    <div class="relative inline-block" @mouseenter="show = true" @mouseleave="show = false">
        <select
            :value="modelValue"
            @change="onChange"
            :disabled="disabled"
            :class="[
        'py-3 px-4 pe-9 block w-full border rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none',
        disabled ? 'bg-gray-200 cursor-not-allowed border-gray-300' : 'border-gray-200'
      ]"
        >
            <option disabled value="">{{ placeholder }}</option>
            <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
        </select>

        <BaseTooltip
            v-if="tooltip && show"
            :text="tooltip"
            tooltip-id="select-tooltip"
            :placement="placement"
        />
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import BaseTooltip from '@/components/base/BaseTooltip.vue'

const props = defineProps({
    options: Array,
    modelValue: { type: [String, Number], default: '' },
    placeholder: { type: String, default: '' },
    tooltip: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    placement: { type: String, default: '' },
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
