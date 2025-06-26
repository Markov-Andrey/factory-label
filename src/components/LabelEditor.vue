<template>
    <div class="space-y-2 p-4">
        <div class="flex gap-2">
            <BaseInput v-model="widthMM" type="number" label="Ширина (мм):" class="w-32" />
            <BaseInput v-model="heightMM" type="number" label="Высота (мм):" class="w-32" />
        </div>

        <div class="flex gap-2">
            <BaseButton @click="addText" color="bg-blue-600" icon="PlusIcon">Добавить текст</BaseButton>
            <BaseButton @click="addSVG" color="bg-green-600" icon="DocumentPlusIcon">Добавить SVG</BaseButton>
            <BaseButton @click="saveCanvas" color="bg-yellow-500" icon="FolderArrowDownIcon">Сохранить шаблон</BaseButton>
            <BaseButton @click="() => $refs.fileInput.click()" color="bg-gray-500" icon="FolderPlusIcon">Загрузить шаблон</BaseButton>
            <input type="file" ref="fileInput" class="hidden" @change="handleLoadFile" accept=".json" />
        </div>

        <div class="flex gap-2">
            <BaseButton @click="undo" :disabled="!canUndo" tooltip="Отменить" color="bg-blue-600" icon="ArrowUturnLeftIcon" />
            <BaseButton @click="redo" :disabled="!canRedo" tooltip="Вернуть" color="bg-green-600" icon="ArrowUturnRightIcon" />
            <select v-model.number="fontSize" @change="updateTextStyle" class="border rounded px-2 py-1 text-sm">
                <option v-for="size in [8,10,12,14,16,18,24,30,36,48,60,72]" :key="size" :value="size">
                    {{ size }}
                </option>
            </select>
            <BaseButton
                @click="toggleBold"
                color="bg-gray-700"
                icon="BoldIcon"
            ></BaseButton>
            <BaseButton icon="Bars3BottomLeftIcon" tooltip="Текст по левому краю" color="bg-green-600" @click="setTextAlign('left')" />
            <BaseButton icon="Bars2Icon" tooltip="Текст по центру" color="bg-green-600" @click="setTextAlign('center')" />
            <BaseButton icon="Bars3BottomRightIcon" tooltip="Текст по правому краю" color="bg-green-600" @click="setTextAlign('right')" />
            <BaseButton icon="Bars4Icon" tooltip="Текст по ширине" color="bg-green-600" @click="setTextAlign('justify')" />
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
import { ref } from 'vue';
import * as fabric from 'fabric';
import { getSVG } from './svgString.js';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import { useDeleteObjects } from '@/composables/useDeleteObjects.js';
import { useCanvasSaveLoad } from '@/composables/useCanvasSaveLoad.js';
import { useUndoRedo } from '@/composables/useUndoRedo.js';

export default {
    components: { BaseButton, BaseInput },
    data() {
        return {
            widthMM: 210,
            heightMM: 297,
            fontSize: 30,
            isBold: false,
            canUndo: false,
            canRedo: false,
        };
    },
    mounted() {
        const canvasEl = this.$refs.canvas;
        canvasEl.width = this.mmToPx(this.widthMM);
        canvasEl.height = this.mmToPx(this.heightMM);

        this.canvas = new fabric.Canvas(canvasEl);

        const { saveCanvas, loadCanvas } = useCanvasSaveLoad(
            { value: this.canvas },
            () => this.widthMM,
            () => this.heightMM,
            this.mmToPx
        );
        this._saveCanvasFn = saveCanvas;
        this._loadCanvasFn = loadCanvas;

        const { handleKeyDown } = useDeleteObjects(this.canvas);
        this.handleKeyDown = handleKeyDown;
        window.addEventListener('keydown', this.handleKeyDown);

        this.canvasRef = ref(this.canvas);
        this.undoRedo = useUndoRedo(this.canvasRef);
        this.updateUndoRedoFlags();

        this.$watch(() => [
            this.undoRedo.canUndo.value,
            this.undoRedo.canRedo.value,
        ], this.updateUndoRedoFlags);

        this.undoRedo.resumeRecording();
        this.undoRedo.recordState();
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.undoRedo.pauseRecording();
    },
    methods: {
        setTextAlign(alignment) {
            const activeObj = this.canvas.getActiveObject();
            if (activeObj && activeObj.isType('textbox')) {
                activeObj.set('textAlign', alignment);
                this.canvas.requestRenderAll();
            }
        },
        updateUndoRedoFlags() {
            this.canUndo = this.undoRedo.canUndo.value;
            this.canRedo = this.undoRedo.canRedo.value;
        },
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

            // Подгружаем стили для UI
            this.fontSize = text.fontSize;
            this.isBold = text.fontWeight === 'bold';
        },
        updateTextStyle() {
            const active = this.canvas.getActiveObject();
            if (active && active.type === 'textbox') {
                active.set('fontSize', this.fontSize);
                this.canvas.requestRenderAll();
            }
        },
        toggleBold() {
            const active = this.canvas.getActiveObject();
            if (active && active.type === 'textbox') {
                const newWeight = active.fontWeight === 'bold' ? 'normal' : 'bold';
                active.set('fontWeight', newWeight);
                this.isBold = newWeight === 'bold';
                this.canvas.requestRenderAll();
            }
        },
        handleLoadFile(e) {
            const file = e.target.files?.[0];
            if (!file) return;

            this._loadCanvasFn(file, (w, h) => {
                const mmWidth = w / 3;
                const mmHeight = h / 3;
                this.widthMM = mmWidth;
                this.heightMM = mmHeight;

                const canvasEl = this.$refs.canvas;
                canvasEl.width = w;
                canvasEl.height = h;
                this.canvas.setWidth(w);
                this.canvas.setHeight(h);
                this.canvas.calcOffset();
                this.canvas.requestRenderAll();

                // Сброс истории
                this.undoRedo.history.value = [];
                this.undoRedo.historyIndex.value = -1;
                this.undoRedo.recordState();
            });

            e.target.value = null;
        },
        undo() {
            this.undoRedo.undo();
        },
        redo() {
            this.undoRedo.redo();
        },
    },
};
</script>

<style scoped></style>
