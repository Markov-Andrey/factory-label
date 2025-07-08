<template>
    <div class="space-y-2 p-4">
        <div class="flex gap-2">
            <BaseInput v-model="widthMM" type="number" label="Ширина (мм):" class="w-32" />
            <BaseInput v-model="heightMM" type="number" label="Высота (мм):" class="w-32" />
        </div>

        <div class="flex gap-2">
            <BaseButton @click="saveCanvas(this.canvas, widthMM, heightMM)" color="bg-yellow-500" icon="FolderArrowDownIcon">Сохранить шаблон</BaseButton>
            <BaseButton @click="() => $refs.fileInput.click()" color="bg-gray-500" icon="FolderPlusIcon">Загрузить шаблон</BaseButton>
            <input type="file" ref="fileInput" class="hidden" @change="handleLoadFile" accept=".json" />
            <BaseButton @click="addText(this.canvas);" color="bg-blue-600" icon="PlusIcon">Добавить текст</BaseButton>
            <BaseButton @click="addSVG(this.canvas, '/asset/my-svg.svg');" color="bg-green-600" icon="DocumentPlusIcon">Добавить SVG</BaseButton>
            <BaseButton @click="() => $refs.imageInput.click()" color="bg-purple-600" icon="PhotoIcon">
                Добавить изображение
            </BaseButton>
            <input @change="addImageFromFile" type="file" ref="imageInput" class="hidden" accept="image/*" />
        </div>

        <div class="flex gap-2">
            <BaseButton @click="() => { undo(); this.canUpd(); }" :disabled="!canUndo" icon="ArrowUturnLeftIcon" tooltip="Отменить" color="bg-blue-600" />
            <BaseButton @click="() => { redo(); this.canUpd(); }" :disabled="!canRedo" icon="ArrowUturnRightIcon" tooltip="Вернуть" color="bg-green-600" />
            <BaseInput @change="updateFontSize(this.canvas, this.fontSize)" v-model="fontSize" type="number" min="1" max="100" step="1" class="w-32" />
            <BaseInput @change="updateLineHeight(this.canvas, this.lineHeight)" v-model="lineHeight" type="number" step="0.01" min="0.3" max="3" class="w-32" />
            <BaseButton @click="toggleBold(this.canvas)" color="bg-gray-700" icon="BoldIcon" tooltip="Полужирный" />
            <BaseButton @click="toggleItalic(this.canvas)" color="bg-gray-700" icon="ItalicIcon" tooltip="Курсив" />
            <BaseButton @click="setTextAlign(this.canvas,'left')" icon="Bars3BottomLeftIcon" tooltip="Текст по левому краю" color="bg-green-600" />
            <BaseButton @click="setTextAlign(this.canvas,'center')" icon="Bars2Icon" tooltip="Текст по центру" color="bg-green-600" />
            <BaseButton @click="setTextAlign(this.canvas,'right')" icon="Bars3BottomRightIcon" tooltip="Текст по правому краю" color="bg-green-600" />
            <BaseButton @click="setTextAlign(this.canvas,'justify')" icon="Bars4Icon" tooltip="Текст по ширине" color="bg-green-600" />
            <BaseColorPicker tooltip="Фон текста" @update:modelValue="color => onColorChange(color, this.canvas, 'backgroundColor')" />
            <BaseColorPicker tooltip="Цвет текста" @update:modelValue="color => onColorChange(color, this.canvas, 'fill')" />
            <BaseSelect tooltip="Шрифт текста" @change="val => setTextFont(this.canvas, val)" :options="['Arial', 'Times New Roman', 'Verdana', 'Helvetica', 'Georgia', 'Courier New', 'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Lucida Sans Unicode' ]"/>
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
import {computed, ref} from 'vue';
import * as fabric from 'fabric';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import {
    addText,
    addSVG,
    setTextAlign,
    toggleBold,
    toggleItalic,
    updateFontSize,
    updateLineHeight,
    onColorChange,
    setTextFont
} from '@/utils/fabricHelpers.js';
import { saveCanvas, loadCanvas } from '@/utils/fabricSaveLoad.js';
import { registerKeyboardShortcuts } from '@/utils/keyboardListeners.js';
import {initRecording, undo, redo, record, canUndo, canRedo} from '@/utils/fabricHistory.js'
import BaseColorPicker from "@/components/base/BaseColorPicker.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";

export default {
    components: {BaseSelect, BaseColorPicker, BaseButton, BaseInput },
    data() {
        return {
            zoom: 4,
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

        initRecording(this.canvas, () => {
            this.canUpd();
        });
        record();
        this.canUpd(); // запуск истории

        // поддержка id и остальные настройки
        if (!fabric.Object.prototype.stateProperties) {
            fabric.Object.prototype.stateProperties = [];
        }
        if (!fabric.Object.prototype.stateProperties.includes('id')) {
            fabric.Object.prototype.stateProperties.push('id');
        }

        fabric.Object.prototype.toObject = (function(toObject) {
            return function(propertiesToInclude) {
                const obj = toObject.call(this, propertiesToInclude);
                if (this.id) obj.id = this.id;
                return obj;
            };
        })(fabric.Object.prototype.toObject);

        this.unregister = registerKeyboardShortcuts(this.canvas);

        this.canvas.on('selection:created', this.onSelectionChanged);
        this.canvas.on('selection:updated', this.onSelectionChanged);
        this.canvas.on('selection:cleared', () => {
            this.selectedObject = null;
            this.selectedObjectId = '';
        });
    },
    beforeDestroy() {
        this.unregister();
    },
    methods: {
        setTextFont, addText, addSVG, setTextAlign, toggleBold, toggleItalic, updateFontSize, updateLineHeight,
        saveCanvas, loadCanvas, registerKeyboardShortcuts,
        undo, redo, onColorChange,

        onSelectionChanged() {
            const active = this.canvas.getActiveObject();
            this.selectedObject = active || null;
            this.selectedObjectId = active?.id || '';
        },

        updateSelectedObjectId() {
            if (this.selectedObject) {
                this.selectedObject.set('id', this.selectedObjectId);
            }
        },

        mmToPx(mm) { return mm * this.zoom; },

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

        async handleLoadFile(e) {
            const file = e.target.files?.[0];
            if (!file) return;
            const { widthPx, heightPx } = await loadCanvas(
                this.canvas,
                file,
                this.$refs.canvas,
                this.mmToPx
            );

            this.widthMM = widthPx / this.zoom;
            this.heightMM = heightPx / this.zoom;

            e.target.value = null;
        },
        canUpd() {
            this.canUndo = canUndo();
            this.canRedo = canRedo();
        },
    },
};
</script>

<style scoped></style>
