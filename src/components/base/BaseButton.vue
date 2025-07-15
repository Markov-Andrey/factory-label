<template>
    <div class="relative inline-block">
        <button
                :class="[
        'group relative inline-flex items-center justify-center gap-2 rounded py-1 px-4 overflow-hidden',
        props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
                :disabled="props.disabled"
                @mouseenter="show = true"
                @mouseleave="show = false"
                @click="handleClick"
                ref="buttonEl"
        >
      <span
              :class="[
          'absolute inset-0 transition duration-150 z-0',
          props.color,
          !props.disabled ? 'group-hover:brightness-85' : '',
        ]"
              aria-hidden="true"
      ></span>
            <span :class="['relative z-10 flex items-center gap-2', props.textColor]">
        <component
                v-if="IconComponent"
                :is="IconComponent"
                class="w-5 h-5 flex-shrink-0"
                aria-hidden="true"
        />
        <slot />
      </span>
        </button>

        <div
                v-if="tooltip && show"
                ref="tooltipEl"
                class="absolute bottom-full mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap select-none z-50"
                :style="tooltipStyles"
        >
            {{ tooltip }}
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue'
import * as heroicons from '@heroicons/vue/24/solid'

const props = defineProps({
    color: { type: String, default: 'bg-blue-600' },
    textColor: { type: String, default: 'text-white' },
    icon: { type: String, default: null },
    tooltip: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
})

const IconComponent = computed(() => (props.icon ? heroicons[props.icon] : null))
const show = ref(false)
const tooltipEl = ref(null)
const buttonEl = ref(null)
const tooltipStyles = reactive({ left: '50%', transform: 'translateX(-50%)' })

watch(show, async (val) => {
    if (val) {
        await nextTick()
        if (!tooltipEl.value || !buttonEl.value) return
        const t = tooltipEl.value.getBoundingClientRect()
        const b = buttonEl.value.getBoundingClientRect()
        const w = window.innerWidth
        let left = b.left + b.width / 2
        const m = 8
        if (left + t.width / 2 + m > w) left = w - t.width / 2 - m
        if (left - t.width / 2 - m < 0) left = t.width / 2 + m
        const offsetX = left - (b.left + b.width / 2)
        tooltipStyles.left = '50%'
        tooltipStyles.transform = `translateX(calc(-50% + ${offsetX}px))`
    }
})

function handleClick(e) {
    if (props.disabled) {
        e.preventDefault()
        e.stopImmediatePropagation()
    }
}
</script>
