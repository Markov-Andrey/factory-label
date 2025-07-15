<template>
    <div class="relative inline-block">
        <button
                :class="[
        'group relative inline-flex items-center justify-center gap-2 rounded py-1 px-4 overflow-hidden',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
                :disabled="disabled"
                @mouseenter="show = true"
                @mouseleave="show = false"
                @click="handleClick"
                ref="buttonEl"
        >
      <span
              :class="[
          'absolute inset-0 transition duration-150 z-0',
          color,
          !disabled ? 'group-hover:brightness-85' : '',
        ]"
              aria-hidden="true"
      ></span>
            <span :class="['relative z-10 flex items-center gap-2', textColor]">
        <component
                v-if="IconComponent"
                :is="IconComponent"
                class="w-5 h-5 flex-shrink-0"
                aria-hidden="true"
        />
        <slot/>
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

<script>
import * as heroicons from '@heroicons/vue/24/solid'

export default {
    props: {
        color: {
            type: String,
            default: 'bg-blue-600',
        },
        textColor: {
            type: String,
            default: 'text-white',
        },
        icon: {
            type: String,
            default: null,
        },
        tooltip: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            show: false,
            tooltipStyles: {
                left: '50%',
                transform: 'translateX(-50%)',
            },
        }
    },

    computed: {
        IconComponent() {
            return this.icon ? heroicons[this.icon] : null
        },
    },

    watch: {
        show(val) {
            this.$nextTick(() => {
                if (val && this.tooltipEl && this.buttonEl) {
                    const t = this.tooltipEl.getBoundingClientRect()
                    const b = this.buttonEl.getBoundingClientRect()
                    const w = window.innerWidth
                    let left = b.left + b.width / 2
                    const m = 8
                    if (left + t.width / 2 + m > w) left = w - t.width / 2 - m
                    if (left - t.width / 2 - m < 0) left = t.width / 2 + m
                    const offsetX = left - (b.left + b.width / 2)
                    this.tooltipStyles.left = '50%'
                    this.tooltipStyles.transform = `translateX(calc(-50% + ${offsetX}px))`
                }
            })
        },
    },

    methods: {
        handleClick(e) {
            if (this.disabled) {
                e.preventDefault()
                e.stopImmediatePropagation()
            }
        },
    },

    mounted() {
        this.tooltipEl = this.$refs.tooltipEl
        this.buttonEl = this.$refs.buttonEl
    },
}
</script>
