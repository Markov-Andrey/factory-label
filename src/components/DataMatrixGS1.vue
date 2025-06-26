<template>
    <div>
        <textarea v-model="inputValue" rows="4" placeholder="DataMatrix GS1"></textarea>
        <div class="preview">
            <strong>Введено:</strong>
            <pre v-html="escapedString"></pre>
        </div>
        <canvas ref="canvas"></canvas>
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
    return `<span class="green">${escaped.replace(/\x1D/g, '<span class="gs">&lt;GS&gt;</span>')}</span>`
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

<style scoped>
textarea {
    width: 100%;
    font-family: monospace;
    font-size: 14px;
    margin-bottom: 8px;
    box-sizing: border-box;
    padding: 6px;
}

canvas {
    border: 1px solid #ccc;
    margin-top: 10px;
    display: block;
}

.preview {
    font-family: monospace;
    background: #f7f7f7;
    padding: 5px;
    white-space: pre-wrap;
    word-break: break-all;
    margin-bottom: 10px;
    color: #333;
}

.green {
    color: #2e7d32;
    font-weight: 600;
}

.gs {
    background-color: #c8e6c9;
    color: #1b5e20;
    font-weight: bold;
    padding: 0 3px;
    border-radius: 3px;
    user-select: none;
}
</style>
