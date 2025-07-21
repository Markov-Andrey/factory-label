<template>
    <div @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
        <BaseButton
            @click="showModal = true"
            :color="buttonColor"
            :icon="buttonIcon"
            :disabled="false"
        >
            {{ buttonText }}
        </BaseButton>

        <!-- Tooltip -->
        <BaseTooltip
            v-if="tooltip && showTooltip"
            :text="tooltip"
            :placement="placement"
            tooltip-id="gallery-tooltip"
        />
    </div>

    <!-- Modal -->
    <teleport to="body">
        <div
            v-if="showModal"
            tabindex="-1"
            class="fixed inset-0 z-50 flex justify-center items-center w-full overflow-auto bg-black/30 backdrop-blur-sm"
            @keydown.esc.window="showModal = false"
            @click.self="showModal = false"
        >
            <div class="relative w-full max-w-[90%] max-h-full">
                <div class="bg-white rounded-lg shadow-sm border border-gray-300">
                    <header class="flex items-center justify-between p-4 border-b border-gray-200 rounded-t">
                        <h3 class="text-xl font-semibold text-gray-900">{{ modalTitle }}</h3>
                        <button
                            type="button"
                            class="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto flex justify-center items-center"
                            @click="showModal = false"
                        >
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </header>

                    <main class="overflow-y-auto p-6 max-h-[60vh]">
                        <div v-for="(category, i) in icons" :key="i" class="mb-8">
                            <h4 v-if="category.category" class="text-lg font-semibold mb-4 border-b pb-1">
                                {{ category.name }}
                            </h4>
                            <div
                                v-if="category.items && category.items.length"
                                class="grid grid-cols-6 gap-3"
                            >
                                <div
                                    v-for="(icon, index) in category.items"
                                    :key="index"
                                    class="cursor-pointer flex flex-col items-center p-1 rounded transition hover:bg-gray-100 hover:shadow"
                                    @click="selectIcon(icon)"
                                >
                                    <img :src="icon.path" :alt="icon.name" class="w-16 h-16 object-contain rounded mb-1" />
                                    <span class="text-xs text-center">{{ icon.name }}</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTooltip from '@/components/base/BaseTooltip.vue'

export default {
    name: 'BaseSelectGallery',
    components: {
        BaseButton,
        BaseTooltip,
    },
    props: {
        placement: { type: String, default: 'top' },
        tooltip: { type: String, default: '' },
        buttonText: { type: String, default: '' },
        buttonColor: { type: String, default: 'bg-green-600' },
        buttonIcon: { type: String, default: 'PlusCircleIcon' },
        modalTitle: { type: String, default: 'Добавить иконку' },
        icons: { type: Array, required: true },
    },
    emits: ['icon-selected'],
    data() {
        return {
            showModal: false,
            showTooltip: false,
        }
    },
    watch: {
        showModal(newVal) {
            document.body.classList.toggle('overflow-hidden', newVal)
        },
    },
    methods: {
        selectIcon(icon) {
            this.$emit('icon-selected', icon)
            this.showModal = false
        },
    },
    beforeUnmount() {
        document.body.classList.remove('overflow-hidden')
    },
}
</script>
