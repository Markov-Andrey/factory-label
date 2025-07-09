<template>
    <div ref="picker" class="relative inline-block" @mouseenter="show = true" @mouseleave="show = false">
        <!-- Кнопка -->
        <div class="w-8 h-8 border border-gray-400 rounded flex justify-center items-center transition-all">
            <button
                class="w-6 h-6 rounded shadow-sm transition duration-200"
                :class="disabled
                    ? 'bg-gray-200 border-gray-300 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-md'"
                :style="!disabled ? { backgroundColor: modelValue } : {}"
                @click="!disabled && (open = !open)"
                :disabled="disabled"
            />
        </div>

        <!-- Tooltip -->
        <div
            v-if="tooltip && show"
            class="absolute bottom-full mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap select-none z-50"
        >
            {{ tooltip }}
        </div>

        <!-- Модалка -->
        <div
            v-if="open"
            class="absolute z-50 bg-white border rounded shadow p-3 mt-2 w-44"
        >
            <label class="block text-xs text-gray-500">Цвет</label>
            <input
                type="color"
                v-model="color"
                class="w-full h-8 mb-2 cursor-pointer"
                :disabled="disabled"
            />

            <label class="block text-xs text-gray-500">Прозрачность</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="alpha"
                class="w-full"
            />
            <div class="text-right text-xs text-gray-600">
                {{ Math.round(alpha * 100) }}%
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "BaseColorPicker",
    props: {
        modelValue: { type: String, default: "rgba(0,0,0,1)" },
        disabled: Boolean,
        tooltip: { type: String, default: "" },
    },
    data() {
        return {
            open: false,
            color: "#000000",
            alpha: 1,
            show: false,
        };
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(val) {
                const m = /rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)/.exec(val) || [];
                const [r, g, b, a] = m.slice(1).map(Number);
                this.color = this.rgbToHex(r || 0, g || 0, b || 0);
                this.alpha = a ?? 1;
            },
        },
        color: "emit",
        alpha: "emit",
    },
    mounted() {
        document.addEventListener("click", this.onClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener("click", this.onClickOutside);
    },
    methods: {
        emit() {
            const { r, g, b } = this.hexToRgb(this.color);
            this.$emit("update:modelValue", `rgba(${r},${g},${b},${this.alpha})`);
        },
        hexToRgb(hex) {
            const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
            return m
                ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
                : { r: 0, g: 0, b: 0 };
        },
        rgbToHex(r, g, b) {
            return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
        },
        onClickOutside(e) {
            if (this.open && !this.$refs.picker.contains(e.target)) this.open = false;
        },
    },
};
</script>
