<template>
    <div class="space-y-2 p-4">
        <div class="flex gap-2">
            <BaseInput v-model="widthMM" type="number" label="Ширина (мм):" class="w-32" />
            <BaseInput v-model="heightMM" type="number" label="Высота (мм):" class="w-32" />
        </div>

        <div class="flex gap-2">
            <BaseButton @click="saveCanvas" color="bg-yellow-500" icon="FolderArrowDownIcon">Сохранить шаблон</BaseButton>
            <BaseButton @click="() => $refs.fileInput.click()" color="bg-gray-500" icon="FolderPlusIcon">Загрузить шаблон</BaseButton>
            <input type="file" ref="fileInput" class="hidden" @change="handleLoadFile" accept=".json" />
            <BaseButton @click="addText" color="bg-blue-600" icon="PlusIcon">Добавить текст</BaseButton>
            <BaseButton @click="addSVG" color="bg-green-600" icon="DocumentPlusIcon">Добавить SVG</BaseButton>
            <BaseButton @click="() => $refs.imageInput.click()" color="bg-purple-600" icon="PhotoIcon">
                Добавить изображение
            </BaseButton>
            <input type="file" ref="imageInput" class="hidden" accept="image/*" @change="addImageFromFile" />
        </div>

        <div class="flex gap-2">
            <BaseButton @click="undo" :disabled="!canUndo" tooltip="Отменить" color="bg-blue-600" icon="ArrowUturnLeftIcon" />
            <BaseButton @click="redo" :disabled="!canRedo" tooltip="Вернуть" color="bg-green-600" icon="ArrowUturnRightIcon" />
            <BaseInput
                v-model="fontSize"
                type="number"
                class="w-32"
                @change="updateTextStyle"
            />
            <BaseInput
                v-model="lineHeight"
                type="number"
                step="0.1"
                min="0.5"
                max="3"
                class="w-32"
                @change="updateLineHeight"
            />
            <BaseButton @click="toggleBold" color="bg-gray-700" icon="BoldIcon" />
            <BaseButton icon="Bars3BottomLeftIcon" tooltip="Текст по левому краю" color="bg-green-600" @click="setTextAlign('left')" />
            <BaseButton icon="Bars2Icon" tooltip="Текст по центру" color="bg-green-600" @click="setTextAlign('center')" />
            <BaseButton icon="Bars3BottomRightIcon" tooltip="Текст по правому краю" color="bg-green-600" @click="setTextAlign('right')" />
            <BaseButton icon="Bars4Icon" tooltip="Текст по ширине" color="bg-green-600" @click="setTextAlign('justify')" />
        </div>

        <div class="flex mt-4 gap-4 items-start">
            <!-- Левая часть: Canvas -->
            <div
                class="border border-black overflow-hidden"
                :style="{ width: mmToPx(widthMM) + 'px', height: mmToPx(heightMM) + 'px' }"
            >
                <canvas ref="canvas"></canvas>
            </div>

            <!-- Правая часть: Панель выбранного объекта -->
            <div v-if="selectedObject" class="w-64 space-y-2">
                <label class="block mb-1 font-semibold">ID выбранного объекта:</label>
                <input
                    type="text"
                    v-model="selectedObjectId"
                    @input="updateSelectedObjectId"
                    class="border px-2 py-1 rounded w-full"
                />
                <pre class="bg-gray-100 text-sm p-2 overflow-auto max-h-64">
                  {{ JSON.stringify(selectedObject, null, 2) }}
                </pre>
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
            widthMM: 150,
            heightMM: 100,
            fontSize: 30,
            lineHeight: 1.0,
            isBold: false,
            canUndo: false,
            canRedo: false,
            selectedObject: null,
            selectedObjectId: '',
        };
    },
    mounted() {
        const canvasEl = this.$refs.canvas;
        canvasEl.width = this.mmToPx(this.widthMM);
        canvasEl.height = this.mmToPx(this.heightMM);

        this.canvas = new fabric.Canvas(canvasEl);
        // id-блок
        if (!fabric.Object.prototype.stateProperties) {
            fabric.Object.prototype.stateProperties = [];
        }
        if (!fabric.Object.prototype.stateProperties.includes('id')) {
            fabric.Object.prototype.stateProperties.push('id');
        }
        fabric.Object.prototype.toObject = (function(toObject) {
            return function(propertiesToInclude) {
                const obj = toObject.call(this, propertiesToInclude);
                if (this.id) {
                    obj.id = this.id;
                }

                return obj;
            };
        })(fabric.Object.prototype.toObject);

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

        this.canvas.on('selection:created', this.onSelectionChanged);
        this.canvas.on('selection:updated', this.onSelectionChanged);
        this.canvas.on('selection:cleared', () => {
            this.selectedObject = null;
            this.selectedObjectId = '';
        });
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.undoRedo.pauseRecording();
    },
    methods: {
        onSelectionChanged() {
            const active = this.canvas.getActiveObject();
            if (active) {
                this.selectedObject = active;
                this.selectedObjectId = active.id || '';
            } else {
                this.selectedObject = null;
                this.selectedObjectId = '';
            }
        },
        updateSelectedObjectId() {
            if (this.selectedObject) {
                this.selectedObject.set('id', this.selectedObjectId);
            }
        },
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
            return mm * 4;
        },
        saveCanvas() {
            this._saveCanvasFn?.();
        },
        async addSVG() {
            const { objects, options } = await fabric.loadSVGFromString(getSVG());
            const group = fabric.util.groupSVGElements(objects, options);
            group.set({ left: 150, top: 150, lockScalingFlip: true, lockRotation: true, id: '' });
            this.canvas.add(group);
            this.canvas.requestRenderAll();
        },
        async addImageFromFile(event) {
            const file = event.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async () => {
                const dataUrl = reader.result;

                const img = await fabric.FabricImage.fromURL(dataUrl, {
                    left: 100,
                    top: 100,
                    scaleX: 1,
                    scaleY: 1,
                    id: '',
                });

                this.canvas.add(img);
                this.canvas.setActiveObject(img);
                this.canvas.requestRenderAll();
            };

            reader.readAsDataURL(file);
            event.target.value = null;
        },
        addText() {
            const text = new fabric.Textbox('Новый текст', {
                fontFamily: 'Times New Roman',
                left: 100,
                top: 100,
                fontSize: 30,
                fill: 'black',
                id: '',
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
        updateLineHeight() {
            const active = this.canvas.getActiveObject();
            if (active && active.type === 'textbox') {
                active.set('lineHeight', parseFloat(this.lineHeight));
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
                const mmWidth = w / 4;
                const mmHeight = h / 4;
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
