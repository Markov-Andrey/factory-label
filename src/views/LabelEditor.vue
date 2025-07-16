<template>
    <div class="relative">
        <!-- Верхняя строка -->
        <header class="fixed top-0 left-0 right-[450px] h-auto min-h-12 px-4 py-2 bg-gray-100 border-b border-gray-300 z-30 flex items-center justify-center">
            <div class="flex flex-wrap gap-2 items-center justify-center">
                <BaseInput :disabled="isTextboxSelected" @change="updateFontSize(this.canvas, this.fontSize)" tooltip="Размер шрифта" placement="bottom" v-model="fontSize" type="number" min="1" max="100" step="1" class="w-32" />
                <BaseInput :disabled="isTextboxSelected" @change="updateLineHeight(this.canvas, this.lineHeight)" tooltip="Межстрочный интервал" placement="bottom" v-model="lineHeight" type="number" step="0.01" min="0.3" max="3" class="w-32" />
                <BaseButton :disabled="isTextboxSelected" @click="toggleBold(this.canvas)" color="bg-gray-700" icon="BoldIcon" tooltip="Полужирный (Ctrl+B)" placement="bottom" />
                <BaseButton :disabled="isTextboxSelected" @click="toggleItalic(this.canvas)" color="bg-gray-700" icon="ItalicIcon" tooltip="Курсив (Ctrl+I)" placement="bottom" />
                <BaseButton :disabled="isTextboxSelected" @click="setTextAlign(this.canvas,'left')" icon="Bars3BottomLeftIcon" tooltip="Текст по левому краю (Ctrl+L)" placement="bottom" color="bg-green-600" />
                <BaseButton :disabled="isTextboxSelected" @click="setTextAlign(this.canvas,'center')" icon="Bars2Icon" tooltip="Текст по центру (Ctrl+E)" placement="bottom" color="bg-green-600" />
                <BaseButton :disabled="isTextboxSelected" @click="setTextAlign(this.canvas,'right')" icon="Bars3BottomRightIcon" tooltip="Текст по правому краю (Ctrl+R)" placement="bottom" color="bg-green-600" />
                <BaseButton :disabled="isTextboxSelected" @click="setTextAlign(this.canvas,'justify')" icon="Bars4Icon" tooltip="Текст по ширине (Ctrl+J)" placement="bottom" color="bg-green-600" />
                <BaseColorPicker :disabled="isTextboxSelected" tooltip="Фон текста" placement="bottom" v-model="backgroundColor" @update:modelValue="color => onColorChange(color, this.canvas, 'backgroundColor')" />
                <BaseColorPicker :disabled="isTextboxSelected" tooltip="Цвет текста" placement="bottom" v-model="fontColor" @update:modelValue="color => onColorChange(color, this.canvas, 'fill')" />
                <BaseSelect :disabled="isTextboxSelected" tooltip="Шрифт текста" placement="bottom" v-model="fontFamily" @change="val => setTextFont(this.canvas, val)" :options="['Arial', 'Times New Roman', 'Verdana', 'Helvetica', 'Georgia', 'Courier New', 'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Lucida Sans Unicode' ]"/>
            </div>
        </header>

        <!-- Правая панель -->
        <aside class="fixed top-0 right-0 w-[450px] h-full bg-gray-200 border-l border-gray-300 p-4 overflow-auto z-20">
            <div class="flex justify-between items-center px-4 py-2 rounded-t">
                <div class="flex items-center gap-2">
                    <span class="text-gray-600 font-medium">Шаблон:</span>
                    <span class="font-semibold text-gray-900">{{ name }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-gray-600 font-medium">Тег:</span>
                    <span class="font-semibold text-gray-900">{{ tags }}</span>
                </div>
            </div>

            <details class="group border border-gray-300 rounded">
                <summary class="flex justify-between items-center cursor-pointer px-3 py-2 bg-gray-600 text-white rounded group-open:rounded-b-none">
                    <span class="font-semibold">Размеры</span>
                    <SvgArrow/>
                </summary>
                <div class="bg-white border-t border-gray-300 p-2 max-h-[200px] overflow-y-auto space-y-1">
                    <div class="flex gap-2">
                        <BaseInput v-model="widthMM" type="number" label="Ширина (мм):" class="w-32" />
                        <BaseInput v-model="heightMM" type="number" label="Высота (мм):" class="w-32" />
                    </div>
                </div>
            </details>
            <!-- Аккордеон: Слои -->
            <details class="group border border-gray-300 rounded">
                <summary class="flex justify-between items-center cursor-pointer px-3 py-2 bg-gray-600 text-white rounded group-open:rounded-b-none">
                    <span class="font-semibold">Слои</span>
                    <SvgArrow/>
                </summary>
                <div class="bg-white border-t border-gray-300 p-2 max-h-[200px] overflow-y-auto space-y-1">
                    <div
                        v-for="(layer, i) in layers"
                        :key="i"
                        class="flex justify-between items-center bg-gray-50 p-2 rounded shadow hover:bg-gray-100 cursor-pointer"
                        @click="onLayerClick(this.canvas, $event, layer.index)"
                    >
                        <div class="flex items-center gap-2">
                            <span class="font-mono text-gray-500">#{{ layer.index }}</span>
                            <span class="font-semibold capitalize">{{ layer.type }}</span>
                        </div>
                        <div class="flex gap-2">
                            <BaseButton
                                color="bg-gray-500"
                                :icon="layer.visible ? 'EyeIcon' : 'EyeSlashIcon'"
                                @click.prevent="toggleVisibility(layer.index)"
                            />
                            <BaseButton
                                color="bg-gray-500"
                                :icon="layer.selectable ? 'LockOpenIcon' : 'LockClosedIcon'"
                                @click.prevent="toggleSelectable(layer.index)"
                            />
                        </div>
                    </div>
                </div>
            </details>

            <!-- Аккордеон: Карта ключей -->
            <details class="group border border-gray-300 rounded">
                <summary class="flex justify-between items-center cursor-pointer px-3 py-2 bg-gray-600 text-white rounded group-open:rounded-b-none">
                    <span class="font-semibold">Карта ключей</span>
                    <SvgArrow/>
                </summary>
                <div class="bg-white border-t border-gray-300 p-2">
                    <KeyMapComponent :meta="canvasMeta()" :onCopy="copyToClipboard" />
                </div>
            </details>

            <!-- Аккордеон: Текущий объект -->
            <details
                :open="!!selectedObject"
                :class="[ 'group', { 'opacity-50 pointer-events-none': !selectedObject } ]"
            >
                <summary class="flex justify-between items-center cursor-pointer px-3 py-2 bg-gray-600 text-white rounded group-open:rounded-b-none">
                    <span class="font-semibold">Текущий объект</span>
                    <SvgArrow />
                </summary>
                <div class="bg-white border-t border-gray-300 p-2 space-y-2">
                    <label class="block font-semibold">ID выбранного объекта:</label>
                    <input
                        type="text"
                        v-model="selectedObjectId"
                        @input="updateSelectedObjectId"
                        :disabled="!selectedObject"
                        class="w-full border px-2 py-1 rounded"
                    />
                    <pre
                        class="bg-gray-100 text-xs p-2 overflow-auto max-h-64 border rounded"
                    >
                          {{ JSON.stringify(selectedObject, null, 2) }}
                        </pre>
                </div>
            </details>
        </aside>

        <!-- Инструменты слева -->
        <div class="fixed left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded shadow-floating shadow z-40">
            <div class="grid grid-cols-1 gap-1">
                <BaseButton tooltip="Сохранить (Ctrl+S)" placement="right" @click="saveCanvas(this.canvas, widthMM, heightMM, this.$route.params.id)" color="bg-gray-600" icon="CloudArrowUpIcon"/>
                <BaseButton tooltip="Выйти" placement="right" @click="exit" color="bg-gray-600" icon="ArrowLeftEndOnRectangleIcon"/>
                <hr class="m-1 border-t-2 border-gray-400">
                <BaseButton @click="undo(); this.canUpd()" :disabled="!canUndo" icon="ArrowUturnLeftIcon" tooltip="Отменить (Ctrl+Z)" placement="right" color="bg-gray-600" />
                <BaseButton @click="redo(); this.canUpd()" :disabled="!canRedo" icon="ArrowUturnRightIcon" tooltip="Вернуть (Ctrl+Y)" placement="right" color="bg-gray-600" />
                <hr class="m-1 border-t-2 border-gray-400">
                <BaseButton tooltip="Добавить текст" placement="right" @click="addText(this.canvas);" color="bg-gray-600" icon="ItalicIcon"/>
                <BaseButton tooltip="Добавить рамку" placement="right" @click="addRect(this.canvas);" color="bg-gray-600" icon="Squares2X2Icon"/>
                <SelectGalleryIcons tooltip="Добавить QR" placement="right" button-color="bg-gray-600" button-icon="QrCodeIcon" modal-title="Выберите код" :icons="fabricIconsBarcodes()" @icon-selected="icon => addImage(this.canvas, icon.path, icon.meta, icon.meta_type)" />
                <SelectGalleryIcons tooltip="Добавить символ" placement="right" button-color="bg-gray-600" button-icon="AtSymbolIcon" modal-title="Выберите символ" :icons="fabricIconsSpecial()" @icon-selected="icon => addImage(this.canvas, icon.path, icon.meta, icon.meta_type)" />
                <BaseButton tooltip="Добавить изображение" placement="right" @click="() => $refs.imageInput.click()" color="bg-gray-600" icon="PhotoIcon"/>
                <input @change="addImageFromFile" type="file" ref="imageInput" class="hidden" accept="image/*" />
            </div>
        </div>

        <!-- Основное рабочее пространство -->
        <main class="pt-[120px] ml-10 mr-[450px] flex justify-center items-start">
            <div class="border border-black">
                <div :style="{ width: mmToPx(widthMM) + 'px', height: mmToPx(heightMM) + 'px' }" >
                    <canvas ref="canvas"></canvas>
                </div>
            </div>
        </main>

    </div>
</template>

<script>
import * as fabric from 'fabric';
import axios from "axios";
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import KeyMapComponent from '@/components/KeyMapComponent.vue';
import {
    addText, addImage, addRect, toggleBold, toggleItalic, updateFontSize, updateLineHeight, setTextAlign, onColorChange, setTextFont, onLayerClick, toggleProperty,
} from '@/utils/fabricHelpers.js';
import { saveCanvas, loadCanvas } from '@/utils/fabricSaveLoad.js';
import { registerKeyboardShortcuts } from '@/utils/keyboardListeners.js';
import {initRecording, undo, redo, record, canUndo, canRedo} from '@/utils/fabricHistory.js'
import BaseColorPicker from "@/components/base/BaseColorPicker.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import SelectGalleryIcons from "@/components/base/SelectGalleryIcons.vue";
import {fabricIconsSpecial} from "@/utils/fabricIconsSpecial.js";
import {fabricIconsBarcodes} from "@/utils/fabricIconsBarcodes.js";
import SvgArrow from "@/components/SvgArrow.vue";

export default {
    components: {SvgArrow, SelectGalleryIcons, BaseSelect, BaseColorPicker, BaseButton, BaseInput, KeyMapComponent },
    data() {
        return {
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            name: '',
            tags: '',
            zoom: 4,
            widthMM: 100,
            heightMM: 60,
            fontSize: 30,
            lineHeight: 1.0,
            isBold: false,
            canUndo: false,
            canRedo: false,
            selectedObject: null,
            selectedObjectId: '',
            isTextboxSelected: true,
            backgroundColor: '#fff',
            fontColor: '#000000',
            fontFamily: 'Times New Roman',
            layers: [],
        };
    },
    mounted() {
        const canvasEl = this.$refs.canvas;
        canvasEl.width = this.mmToPx(this.widthMM);
        canvasEl.height = this.mmToPx(this.heightMM);

        this.canvas = new fabric.Canvas(canvasEl);

        initRecording(this.canvas, () => {
            this.canUpd();
            this.updateLayers();
        });
        record();
        this.canUpd(); // запуск истории

        const c = this.canvas;
        const unregister = registerKeyboardShortcuts(
            c,
            () => { undo(); this.canUpd(); },
            () => { redo(); this.canUpd(); },
            () => toggleBold(c),
            () => toggleItalic(c),
            () => setTextAlign(c, 'left'),
            () => setTextAlign(c, 'center'),
            () => setTextAlign(c, 'right'),
            () => setTextAlign(c, 'justify'),
            () => saveCanvas(c, this.widthMM, this.heightMM, this.$route.params.id)
        );

        this.canvas.on('selection:created', this.onSelectionChanged);
        this.canvas.on('selection:updated', this.onSelectionChanged);
        this.canvas.on('selection:cleared', () => {
            this.onSelectionChanged();
            this.selectedObject = null;
            this.selectedObjectId = '';
        });
        this.handleLoadTemplate(this.$route.params.id);
    },
    beforeDestroy() {
        this.unregister();
    },
    methods: {
        setTextFont, addText, addRect, addImage, setTextAlign, toggleBold, toggleItalic, updateFontSize, updateLineHeight,
        saveCanvas, loadCanvas, registerKeyboardShortcuts,
        fabricIconsSpecial, fabricIconsBarcodes,
        undo, redo, onColorChange, onLayerClick, toggleProperty,

        exit() { this.$router.push('/'); },
        toggleVisibility(index) {
            toggleProperty(this.canvas, index, 'visible'); this.updateLayers();
        },
        toggleSelectable(index) {
            toggleProperty(this.canvas, index, 'selectable'); this.updateLayers();
        },
        updateLayers() {
            this.layers = this.canvas.getObjects().map((obj, i) => ({
                type: obj.type,
                visible: obj.visible !== false,
                selectable: obj.selectable !== false,
                index: i,
            }));
        },
        onSelectionChanged() {
            this.canvasMeta();
            const active = this.canvas.getActiveObject();
            this.selectedObject = active || null;
            this.selectedObjectId = active?.id || '';
            this.isTextboxSelected = !(active && active.isType('textbox'));
            if (active) {
                this.fontSize = active.fontSize;
                this.lineHeight = active.lineHeight;
                this.backgroundColor = active.backgroundColor;
                this.fontColor = active.fill;
                this.fontFamily = active.fontFamily;
            }
        },
        canvasMeta() {
            if (!this.canvas) return [];
            const json = this.canvas.toJSON();
            if (!json.objects) return [];
            return json.objects
                .filter(obj => obj.meta !== undefined && obj.id && obj.id.trim() !== '')
                .map(obj => ({
                    meta: obj.meta,
                    id: obj.id || '',
                }));
        },
        copyToClipboard() {
            navigator.clipboard.writeText(JSON.stringify(
                Object.fromEntries(this.canvasMeta().map(item => [item.id || '', item.meta || ''])), null, 2
            ));
        },
        updateSelectedObjectId() {
            if (this.selectedObject) this.selectedObject.set('id', this.selectedObjectId);
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

        async handleLoadTemplate(id) {
            try {
                const { data } = await axios.get(`${this.apiBaseUrl}/api/templates/${id}`);
                this.name = data.name || '';
                this.tags = data.tags || '';
                if (!data || !data.template) {
                    return;
                }
                const templateJson = JSON.parse(data.template);
                const { widthPx, heightPx } = await loadCanvas(
                    this.canvas,
                    templateJson,
                    this.$refs.canvas,
                    this.mmToPx
                );
                this.widthMM = widthPx / this.zoom;
                this.heightMM = heightPx / this.zoom;
            } catch (error) {
                console.error('Ошибка при загрузке шаблона:', error);
            }
        },
        canUpd() {
            this.canUndo = canUndo();
            this.canRedo = canRedo();
        },
    },
};
</script>

<style scoped>
.tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
    transform: rotate(45deg);
    z-index: -1;
}
</style>
