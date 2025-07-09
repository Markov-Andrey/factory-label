<template>
    <div class="max-w-xl mx-auto p-4 space-y-4">
        <h2 class="text-lg font-semibold">Генератор штрихкодов</h2>

        <input
            v-model="barcodeData"
            class="w-full border rounded px-3 py-2 text-sm"
            placeholder="Данные: 123456789012"
        />

        <select v-model="barcodeFormat" class="w-full border rounded px-3 py-2 text-sm">
            <option v-for="(value, label) in formats" :key="value" :value="value">
                {{ label }}
            </option>
        </select>

        <div class="grid grid-cols-3 gap-2 text-xs">
            <input type="number" v-model.number="settings.width" class="border rounded px-2 py-1" placeholder="Ширина" />
            <input type="number" v-model.number="settings.height" class="border rounded px-2 py-1" placeholder="Высота" />
            <label class="flex items-center">
                <input type="checkbox" v-model="settings.displayValue" class="mr-2" />
                Текст
            </label>
        </div>

        <div class="border p-4 bg-gray-50 rounded text-center">
            <svg ref="barcodeSvg" />
            <p v-if="hasError" class="text-red-600 text-sm mt-2">Неверный формат...</p>
        </div>
    </div>
</template>

<script>
import JsBarcode from 'jsbarcode'
import formats from '@/utils/barcodeFormats'

export default {
    name: 'BarcodeGenerator',
    data: () => ({
        barcodeData: '123456',
        barcodeFormat: 'CODE128',
        settings: {
            width: 2,
            height: 80,
            displayValue: true,
        },
        formats,
        hasError: false,
    }),
    watch: {
        barcodeData: 'generate',
        barcodeFormat: 'generate',
        settings: { handler: 'generate', deep: true },
    },
    mounted() {
        this.generate()
    },
    methods: {
        generate() {
            const svg = this.$refs.barcodeSvg
            this.hasError = false

            if (!svg || !this.barcodeData.trim()) {
                svg.innerHTML = ''
                return
            }

            svg.innerHTML = ''

            try {
                JsBarcode(svg, this.barcodeData.trim(), {
                    format: this.barcodeFormat,
                    ...this.settings,
                })
            } catch {
                this.hasError = true
            }
        },
    },
}
</script>
