<template>
    <div>
    <textarea
        v-model="inputValue"
        rows="4"
        placeholder="DataMatrix GS1"
        class="w-full font-mono text-sm mb-2 p-2 border border-gray-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
    ></textarea>

        <div class="preview font-mono bg-gray-100 p-2 break-words mb-4 text-gray-800">
            <strong>Введено:</strong>
            <pre v-html="escapedString"></pre>
        </div>

        <canvas ref="canvas" class="border border-gray-300 block"></canvas>
    </div>
</template>

<script setup>
import {ref, watch, onMounted, computed} from 'vue'
import gs1_128 from 'bwip-js'

const inputValue = ref('')
const canvas = ref(null)

const escapedString = computed(() => {
    if (!inputValue.value) return ''
    const escapeHtml = (str) =>
        str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")

    const escaped = escapeHtml(inputValue.value)
    return `<span class="text-green-700 font-semibold">${escaped.replace(/\x1D/g, '<span class="bg-green-200 text-green-900 font-bold px-1 rounded select-none">&lt;GS&gt;</span>')}</span>`
})

const drawBarcode = (text) => {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    if (!text || text.trim() === '') return
    try {
        gs1_128.toCanvas(canvas.value, {
            bcid: 'datamatrix',
            text: text,
            scale: 5,
            padding: 10,
            includetext: false,
            gs1: true,
        })
    } catch (e) {
        console.error('bwip-js error:', e)
    }
}

watch(inputValue, (val) => {
    drawBarcode(val)
})

onMounted(() => {
    canvas.value.width = 300
    canvas.value.height = 300
})
</script>
