<template>
    <div class="relative inline-block" @mouseenter="show = true" @mouseleave="show = false">
        <button
                :class="[
        'group relative inline-flex items-center justify-center gap-2 rounded overflow-hidden cursor-pointer',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        sizeClasses.padding,
      ]"
                :disabled="disabled"
                @click="handleClick"
                ref="buttonEl"
        >
      <span
              :class="[
          'absolute inset-0 transition duration-150 z-0',
          color,
          !disabled ? 'group-hover:brightness-90' : '',
        ]"
              aria-hidden="true"
      ></span>

            <span :class="['relative z-10 flex items-center gap-2', textColor, sizeClasses.textSize]">
        <component
                v-if="IconComponent"
                :is="IconComponent"
                :class="[sizeClasses.iconSize, 'flex-shrink-0']"
                aria-hidden="true"
        />
        <slot />
      </span>
        </button>

        <BaseTooltip v-if="tooltip && show" :text="tooltip" :tooltipId="tooltipId" :placement="placement" />
    </div>
</template>

<script>
import * as heroicons from '@heroicons/vue/24/solid'
import BaseTooltip from '@/components/base/BaseTooltip.vue'

export default {
    components: { BaseTooltip },
    props: {
        color: { type: String, default: 'bg-blue-600' },
        textColor: { type: String, default: 'text-white' },
        icon: { type: String, default: null },
        tooltip: { type: String, default: '' },
        placement: { type: String, default: 'top' },
        disabled: { type: Boolean, default: false },
        size: { type: String, default: 'md' }, // новый проп
    },
    data() {
        return {
            show: false,
            tooltipId: `tooltip-${Math.random().toString(36).substring(2, 9)}`,
        }
    },
    computed: {
        IconComponent() {
            return this.icon ? heroicons[this.icon] : null
        },
        sizeClasses() {
            switch (this.size) {
                case 'sm':
                    return {
                        padding: 'py-0.5 px-2',
                        iconSize: 'w-3 h-3',
                        textSize: 'text-xs',
                    }
                case 'lg':
                    return {
                        padding: 'py-2 px-6',
                        iconSize: 'w-6 h-6',
                        textSize: 'text-lg',
                    }
                default:
                    return {
                        padding: 'py-1 px-4',
                        iconSize: 'w-5 h-5',
                        textSize: 'text-sm',
                    }
            }
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
}
</script>
