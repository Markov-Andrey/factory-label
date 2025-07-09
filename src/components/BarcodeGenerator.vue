<template>
    <div class="max-w-xl mx-auto p-4 space-y-4">
        <h2 class="text-lg font-semibold">Генератор штрихкодов</h2>

        <select
            :value="barcodeFormat"
            @change="onFormatChange($event)"
            class="w-full border rounded px-3 py-2 text-sm"
        >
            <option
                v-for="(obj, label) in formats"
                :key="label"
                :value="obj.format"
            >
                {{ label }}
            </option>
        </select>

        <input
            v-model="barcodeData"
            class="w-full border rounded px-3 py-2 text-sm"
            readonly
        />

        <div class="border p-4 bg-gray-50 rounded text-center">
            <svg ref="barcodeSvg" />
            <p v-if="hasError" class="text-red-600 text-sm mt-2">Неверный формат...</p>
        </div>

        <button @click="downloadAllSVGs" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Скачать все SVG
        </button>
    </div>
</template>

<script>
import JsBarcode from 'jsbarcode'
import formats from '@/utils/barcodeFormats'

export default {
    name: 'BarcodeGenerator',
    data: () => ({
        barcodeData: '',
        barcodeFormat: '',
        formats,
        hasError: false,
    }),
    mounted() {
        // Инициализация первым форматом
        const first = Object.values(this.formats)[0]
        this.barcodeFormat = first.format
        this.barcodeData = first.example
        this.generate()
    },
    methods: {
        onFormatChange(event) {
            const selectedFormat = event.target.value
            const entry = Object.entries(this.formats).find(([, obj]) => obj.format === selectedFormat)

            if (entry) {
                this.barcodeFormat = entry[1].format
                this.barcodeData = entry[1].example
                this.generate()
            }
        },
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
                    width: 2,
                    height: 80,
                    displayValue: true,
                })
            } catch {
                this.hasError = true
            }
        },
        async downloadAllSVGs() {
            for (const [label, obj] of Object.entries(this.formats)) {
                const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

                try {
                    JsBarcode(tempSvg, obj.example, {
                        format: obj.format,
                        width: 2,
                        height: 80,
                        background: '',
                        displayValue: true,
                    });

                    const serializer = new XMLSerializer();
                    const svgString = serializer.serializeToString(tempSvg);
                    const blob = new Blob([svgString], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${obj.format}.svg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    // Пауза 200 мс между скачиваниями
                    await new Promise(resolve => setTimeout(resolve, 200));

                } catch (e) {
                    console.warn(`Ошибка при генерации ${obj.format}:`, e);
                }
            }
        },
    },
}
</script>
