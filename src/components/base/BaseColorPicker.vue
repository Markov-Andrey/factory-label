<template>
    <div class="relative inline-block" @mouseenter="show = true" @mouseleave="show = false">
        <input
            type="color"
            class="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
            :value="validColor"
            :disabled="disabled"
            @input="onInput"
            title="Choose your color"
        />
        <div
            v-if="tooltip && show"
            class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap select-none z-50"
        >
            {{ tooltip }}
        </div>
    </div>
</template>

<script>
export default {
    name: "BaseColorPicker",
    props: {
        tooltip: {
            type: String,
            default: "",
        },
        modelValue: {
            type: String,
            default: "",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            show: false,
        };
    },
    computed: {
        validColor() { // исключение под warning, пустое значение
            return /^#([0-9a-fA-F]{6})$/.test(this.modelValue) ? this.modelValue : '#000000';
        },
    },
    methods: {
        onInput(event) {
            this.$emit("update:modelValue", event.target.value);
        },
    },
};
</script>
