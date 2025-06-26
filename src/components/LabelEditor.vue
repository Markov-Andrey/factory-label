<template>
    <div class="space-y-2 p-4">
        <div class="flex gap-2">
            <BaseInput v-model="widthMM" type="number" label="Ширина (мм):" class="w-32" />
            <BaseInput v-model="heightMM" type="number" label="Высота (мм):" class="w-32" />
        </div>
        <div class="flex gap-2">
            <BaseButton @click="addText" color="blue" icon="PlusIcon">Добавить текст</BaseButton>
            <BaseButton @click="addSVG" color="green" icon="DocumentPlusIcon">Добавить SVG</BaseButton>
            <BaseButton @click="saveCanvas" color="yellow" icon="FolderArrowDownIcon">Сохранить шаблон</BaseButton>
            <BaseButton @click="() => $refs.fileInput.click()" color="gray" icon="FolderPlusIcon">Загрузить шаблон</BaseButton>
            <input type="file" ref="fileInput" class="hidden" @change="handleLoadFile" accept=".json" />
        </div>
        <div class="flex gap-2">
            <BaseButton @click="undo" :disabled="!canUndo" tooltip="Отменить" color="blue" icon="ArrowUturnLeftIcon"></BaseButton>
            <BaseButton @click="redo" :disabled="!canRedo" tooltip="Вернуть" color="green" icon="ArrowUturnRightIcon"></BaseButton>
        </div>
        <div>
            <div
                class="block border border-black mt-4 overflow-hidden"
                :style="{ width: mmToPx(widthMM) + 'px', height: mmToPx(heightMM) + 'px' }"
            >
                <canvas ref="canvas"></canvas>
            </div>
        </div>
    </div>
</template>

<script>
import * as fabric from 'fabric';
import { getSVG } from './svgString.js';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import { useDeleteObjects } from '@/composables/useDeleteObjects.js';
import { useCanvasSaveLoad } from '@/composables/useCanvasSaveLoad.js';

export default {
    components: { BaseButton, BaseInput },
    data() {
        return {
            widthMM: 210,
            heightMM: 297,
            history: [],
            historyIndex: -1,
            isUndoRedoRunning: false,
        };
    },
    computed: {
        canUndo() {
            return this.historyIndex > 0;
        },
        canRedo() {
            return this.historyIndex < this.history.length - 1;
        }
    },
    mounted() {
        const canvasEl = this.$refs.canvas;
        canvasEl.width = this.mmToPx(this.widthMM);
        canvasEl.height = this.mmToPx(this.heightMM);

        this.canvas = new fabric.Canvas(canvasEl);

        const { saveCanvas, loadCanvas } = useCanvasSaveLoad(
            { value: this.canvas },
            { value: this.widthMM },
            { value: this.heightMM },
            this.mmToPx
        );
        this._saveCanvasFn = saveCanvas;
        this._loadCanvasFn = loadCanvas;

        const { handleKeyDown } = useDeleteObjects(this.canvas);
        this.handleKeyDown = handleKeyDown;
        window.addEventListener('keydown', this.handleKeyDown);

        this.resumeRecording(); // Подключаем обработчики
        this.recordState(); // Первое состояние
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.pauseRecording();
    },
    methods: {
        mmToPx(mm) {
            return mm * 3;
        },
        saveCanvas() {
            this._saveCanvasFn?.();
        },
        async addSVG() {
            const { objects, options } = await fabric.loadSVGFromString(getSVG());
            const group = fabric.util.groupSVGElements(objects, options);
            group.set({ left: 150, top: 150, lockScalingFlip: true, lockRotation: true });
            this.canvas.add(group);
            this.canvas.requestRenderAll();
        },
        addText() {
            const text = new fabric.Textbox('Новый текст', {
                left: 100,
                top: 100,
                fontSize: 30,
                fill: 'black',
            });
            this.canvas.add(text);
            this.canvas.setActiveObject(text);
            this.canvas.requestRenderAll();
        },
        handleLoadFile(e) {
            const file = e.target.files?.[0];
            if (!file) return;

            this._loadCanvasFn(file, (w, h) => {
                const canvasEl = this.$refs.canvas;
                canvasEl.width = w;
                canvasEl.height = h;
                this.canvas.setWidth(w);
                this.canvas.setHeight(h);
                this.canvas.calcOffset();
                this.canvas.requestRenderAll();

                this.history = [];
                this.historyIndex = -1;
                this.recordState();
            });

            e.target.value = null;
        },

        recordState() {
            if (this.isUndoRedoRunning) return;

            const json = this.canvas.toJSON();

            // Избегаем дублирующих записей
            const last = this.history[this.historyIndex];
            if (last && JSON.stringify(last) === JSON.stringify(json)) return;

            // Удаляем "будущее", если откат был
            if (this.historyIndex < this.history.length - 1) {
                this.history.splice(this.historyIndex + 1);
            }

            this.history.push(json);

            if (this.history.length > 50) {
                this.history.shift();
                this.historyIndex = this.history.length - 1;
            } else {
                this.historyIndex = this.history.length - 1;
            }
        },

        pauseRecording() {
            this.canvas.off('object:added', this.recordState);
            this.canvas.off('object:modified', this.recordState);
            this.canvas.off('object:removed', this.recordState);
        },

        resumeRecording() {
            this.canvas.on('object:added', this.recordState);
            this.canvas.on('object:modified', this.recordState);
            this.canvas.on('object:removed', this.recordState);
        },

        undo() {
            if (!this.canUndo) return;

            this.isUndoRedoRunning = true;
            this.pauseRecording();
            this.historyIndex--;

            const prevState = this.history[this.historyIndex];
            this.canvas.loadFromJSON(prevState, () => {
                this.canvas.requestRenderAll();
                setTimeout(() => {
                    this.isUndoRedoRunning = false;
                    this.resumeRecording();
                }, 0);
            });
        },

        redo() {
            if (!this.canRedo) return;

            this.isUndoRedoRunning = true;
            this.pauseRecording();
            this.historyIndex++;

            const nextState = this.history[this.historyIndex];
            this.canvas.loadFromJSON(nextState, () => {
                this.canvas.requestRenderAll();
                setTimeout(() => {
                    this.isUndoRedoRunning = false;
                    this.resumeRecording();
                }, 0);
            });
        },
    }
};
</script>

<style scoped></style>
