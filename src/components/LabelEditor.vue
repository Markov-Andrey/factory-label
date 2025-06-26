<template>
    <div class="space-y-4 p-4">
        <div class="flex items-center gap-2">
            <BaseInput v-model="widthMM" type="number" label="Ширина (мм):" className="w-32" />
            <BaseInput v-model="heightMM" type="number" label="Высота (мм):" className="w-32" />
        </div>

        <div class="flex gap-2">
            <BaseButton @click="addText" color="blue" icon="PlusIcon">Добавить текст</BaseButton>
            <BaseButton @click="addSVG" color="green" icon="DocumentPlusIcon">Добавить SVG</BaseButton>
            <BaseButton @click="saveCanvas" color="yellow" icon="FolderArrowDownIcon">Сохранить шаблон</BaseButton>
            <BaseButton @click="triggerLoad" color="gray" icon="FolderPlusIcon">Загрузить шаблон</BaseButton>
        </div>

        <input
            type="file"
            ref="fileInput"
            class="hidden"
            @change="loadCanvas"
            accept=".json"
        />

        <div
            class="block border border-black mt-4"
            :style="{
        width: mmToPx(widthMM) + 'px',
        height: mmToPx(heightMM) + 'px',
        overflow: 'hidden',
      }"
        >
            <canvas ref="canvas"></canvas>
        </div>
    </div>
</template>


<script>
import * as fabric from 'fabric';
import { getSVG } from './svgString.js';
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";

export default {
    components: {
        BaseButton,
        BaseInput,
    },
    data() {
        return {
            widthMM: 210,
            heightMM: 297,
        };
    },
    mounted() {
        const widthPx = this.mmToPx(this.widthMM);
        const heightPx = this.mmToPx(this.heightMM);

        const canvasEl = this.$refs.canvas;
        canvasEl.width = widthPx;
        canvasEl.height = heightPx;
        this.canvas = new fabric.Canvas(canvasEl);

        window.addEventListener('keydown', this.handleKeyDown);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
    },
    methods: {
        mmToPx(mm) {
            return mm*3;
        },
        handleKeyDown(event) {
            if (event.key === 'Delete' || event.keyCode === 46) {
                const activeObjects = this.canvas.getActiveObjects();
                if (activeObjects.length) {
                    activeObjects.forEach(obj => {
                        this.canvas.remove(obj);
                    });
                    this.canvas.discardActiveObject();
                    this.canvas.requestRenderAll();
                }
            }
        },
        async addSVG() {
            const { objects, options } = await fabric.loadSVGFromString(getSVG());
            const group = fabric.util.groupSVGElements(objects, options);
            group.set({
                left: 150,
                top: 150,
                lockScalingFlip: 1,
                lockRotation: 1
            });
            this.canvas.add(group);
            this.canvas.requestRenderAll();
        },
        addText() {
            const text = new fabric.Textbox('Новый текст', {
                left: 100,
                top: 100,
                fontSize: 30,
                fill: 'black',
                lockScalingFlip: 1,
                lockRotation: 1
            });
            this.canvas.add(text);
            this.canvas.setActiveObject(text);
            this.canvas.requestRenderAll();
        },
        saveCanvas() {
            const json = this.canvas.toJSON();
            json.custom = {
                widthMM: this.widthMM,
                heightMM: this.heightMM,
            };
            const jsonString = JSON.stringify(json, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'canvas.json';
            a.click();
            URL.revokeObjectURL(url);
        },
        triggerLoad() {
            this.$refs.fileInput.click();
        },
        loadCanvas(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    this.canvas.clear();
                    if (json.custom && json.custom.widthMM && json.custom.heightMM) {
                        this.widthMM = json.custom.widthMM;
                        this.heightMM = json.custom.heightMM;

                        const widthPx = this.mmToPx(this.widthMM);
                        const heightPx = this.mmToPx(this.heightMM);

                        this.$nextTick(() => {
                            const canvasEl = this.$refs.canvas;
                            canvasEl.width = widthPx;
                            canvasEl.height = heightPx;

                            this.canvas.setWidth(widthPx);
                            this.canvas.setHeight(heightPx);

                            this.canvas.calcOffset();
                            this.canvas.requestRenderAll();
                        });
                    }
                    this.canvas.loadFromJSON(json, () => {
                        this.canvas.requestRenderAll();
                    });
                } catch (err) {
                    alert('Ошибка загрузки: ' + err.message);
                }
            };
            reader.readAsText(file);
            event.target.value = null;
        }
    }
};
</script>
<style scoped>
</style>