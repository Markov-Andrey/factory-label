<template>
    <div class="relative">
        <!-- Верхняя строка -->
        <header class="fixed top-0 left-0 right-[450px] h-auto min-h-12 px-4 py-2 bg-gray-100 border-b border-gray-300 z-30 flex items-center justify-center">
            <div v-if="!isTextboxSelected">
                <div class="flex flex-wrap gap-2 items-center justify-center">
                    <BaseSelect tooltip="Шрифт текста" placement="bottom" v-model="fontFamily" @change="val => setTextFont(this.canvas, val)" :options="fontOptions"/>
                    <BaseInput @change="updateFontSize(this.canvas, this.fontSize)" tooltip="Размер шрифта" placement="bottom" v-model="fontSize" type="number" min="1" max="100" step="1" class="w-32" />
                    <BaseInput @change="updateLineHeight(this.canvas, this.lineHeight)" tooltip="Межстрочный интервал" placement="bottom" v-model="lineHeight" type="number" step="0.01" min="0.3" max="3" class="w-32" />
                    <BaseButton @click="toggleBold(this.canvas)" color="bg-mascot" icon="BoldIcon" tooltip="Полужирный (Ctrl+B)" placement="bottom" />
                    <BaseButton @click="toggleItalic(this.canvas)" color="bg-mascot" icon="ItalicIcon" tooltip="Курсив (Ctrl+I)" placement="bottom" />
                    <BaseButton @click="setTextAlign(this.canvas,'left')" icon="Bars3BottomLeftIcon" tooltip="Текст по левому краю (Ctrl+L)" placement="bottom" color="bg-mascot" />
                    <BaseButton @click="setTextAlign(this.canvas,'center')" icon="Bars2Icon" tooltip="Текст по центру (Ctrl+E)" placement="bottom" color="bg-mascot" />
                    <BaseButton @click="setTextAlign(this.canvas,'right')" icon="Bars3BottomRightIcon" tooltip="Текст по правому краю (Ctrl+R)" placement="bottom" color="bg-mascot" />
                    <BaseButton @click="setTextAlign(this.canvas,'justify')" icon="Bars4Icon" tooltip="Текст по ширине (Ctrl+J)" placement="bottom" color="bg-mascot" />
                    <BaseColorPicker tooltip="Фон текста" placement="bottom" v-model="backgroundColor" @update:modelValue="color => onColorChange(color, this.canvas, 'backgroundColor')" />
                    <BaseColorPicker tooltip="Цвет текста" placement="bottom" v-model="fontColor" @update:modelValue="color => onColorChange(color, this.canvas, 'fill')" />
                    <BaseButton @click="clearTextStyles(this.canvas)" icon="BackspaceIcon" tooltip="Очистить стили (Ctrl+Space)" placement="bottom" color="bg-mascot" />
                </div>
            </div>
        </header>

        <!-- Правая панель -->
        <aside class="fixed top-0 right-0 w-[450px] h-full bg-gray-200 border-l border-gray-300 py-4 pl-4 pr-2 overflow-auto z-20 scroll-all">
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
                <summary class="flex justify-between items-center cursor-pointer px-3 py-2 bg-mascot text-white rounded group-open:rounded-b-none">
                    <span class="font-semibold">Размеры шаблона</span>
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
                <summary class="flex justify-between items-center cursor-pointer px-3 py-2 bg-mascot text-white rounded group-open:rounded-b-none">
                    <span class="font-semibold">Слои</span>
                    <SvgArrow/>
                </summary>
                <div class="bg-white border-t border-gray-300 p-2 max-h-[200px] overflow-y-auto space-y-1">
                    <div
                        v-for="(layer, i) in layers" :key="i"
                        class="flex justify-between items-center bg-gray-100 p-2 rounded shadow transition hover:bg-gray-200 cursor-pointer"
                        @click="onLayerClick(this.canvas, $event, layer.index)"
                    >
                        <div class="flex items-center gap-2">
                            <span class="font-mono text-gray-500">#{{ layer.index }}</span>
                            <span class="font-semibold capitalize">{{ layer.type }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="grid">
                                <BaseButton
                                    size="sm"
                                    color="bg-mascot"
                                    icon="ChevronUpIcon"
                                    tooltip="Слой вверх"
                                    placement="left"
                                    @click.prevent="handleChangeLayer(layer.index, 'up')"
                                />
                                <BaseButton
                                    size="sm"
                                    color="bg-mascot"
                                    icon="ChevronDownIcon"
                                    tooltip="Слой вниз"
                                    placement="left"
                                    @click.prevent="handleChangeLayer(layer.index, 'down')"
                                />
                            </div>
                            <BaseButton
                                color="bg-mascot"
                                tooltip="Видимость слоя"
                                placement="left"
                                :icon="layer.visible ? 'EyeIcon' : 'EyeSlashIcon'"
                                @click.prevent="toggleVisibility(layer.index)"
                            />
                            <BaseButton
                                color="bg-danger"
                                tooltip="Блокировка слоя"
                                placement="left"
                                :icon="layer.selectable ? 'LockOpenIcon' : 'LockClosedIcon'"
                                @click.prevent="toggleSelectable(layer.index)"
                            />
                        </div>
                    </div>
                </div>
            </details>

            <!-- Аккордеон: Карта ключей -->
            <details class="group border border-gray-300 rounded">
                <summary class="flex justify-between items-center cursor-pointer px-3 py-2 bg-mascot text-white rounded group-open:rounded-b-none">
                    <span class="font-semibold">Карта ключей</span>
                    <SvgArrow/>
                </summary>
                <div class="bg-white border-t border-gray-300 p-2">
                    <KeyMapComponent v-if="canvasMeta().length" :meta="canvasMeta()" :onCopy="copyToClipboard" />
                    <div class="flex items-center justify-center" v-else>Нет ключей</div>
                </div>
            </details>

            <!-- Аккордеон: Текущий объект -->
            <details class="group" >
                <summary class="flex justify-between items-center cursor-pointer px-3 py-2 bg-mascot text-white rounded group-open:rounded-b-none">
                    <span class="font-semibold">Текущий объект</span>
                    <SvgArrow />
                </summary>
                <div class="bg-white border-t border-gray-300 p-2 space-y-2">
                    <div v-if="selectedObject">
                        <label class="block font-semibold">ID выбранного объекта:</label>
                        <input
                            type="text"
                            v-model="selectedObjectId"
                            @input="updateSelectedObjectId"
                            :disabled="!selectedObject"
                            class="w-full border px-2 py-1 rounded"
                        />
                    </div>
                    <div v-if="selectedObject">
                        <label class="block font-semibold">Положение:</label>
                        <div class="flex gap-6">
                            <div class="flex gap-2 justify-center items-center">
                                <label class="block font-semibold">X:</label>
                                <input
                                    v-if="selectedObject"
                                    type="number"
                                    :value="selectedObject.left"
                                    @input="(e) => moveObject(this.canvas, Number(e.target.value), 'x')"
                                    class="w-full border px-2 py-1 rounded"
                                />
                            </div>
                            <div class="flex gap-2 justify-center items-center">
                                <label class="block font-semibold">Y:</label>
                                <input
                                    v-if="selectedObject"
                                    type="number"
                                    :value="selectedObject.top"
                                    @input="(e) => moveObject(this.canvas, Number(e.target.value), 'y')"
                                    class="w-full border px-2 py-1 rounded"
                                />
                            </div>
                            <div class="flex gap-2 justify-center items-center">
                                <label class="block font-semibold">Угол:</label>
                                <input
                                    v-if="selectedObject"
                                    type="number"
                                    :value="selectedObject.angle"
                                    @input="(e) => rotateObject(this.canvas, Number(e.target.value))"
                                    class="w-full border px-2 py-1 rounded"
                                />
                            </div>
                        </div>
                    </div>
                    <label class="block font-semibold">Инфо:</label>
                    <pre class="bg-gray-100 text-xs p-2 overflow-auto max-h-64 border rounded" >
                        {{ JSON.stringify(selectedObject, null, 2)
                        .replace(/[{}"]/g, '') }}
                    </pre>
                </div>
            </details>
        </aside>

        <!-- Инструменты слева -->
        <div class="fixed left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded shadow-floating shadow z-40">
            <div class="grid grid-cols-1 gap-1">
                <BaseButton tooltip="Сохранить (Ctrl+S)" placement="right" @click="saveCanvas(this.canvas, widthMM, heightMM, this.$route.params.id, this.$alert)" color="bg-accept" icon="CloudArrowUpIcon"/>
                <BaseButton tooltip="Выйти" placement="right" @click="exit" color="bg-danger" icon="ArrowLeftEndOnRectangleIcon"/>
                <hr class="m-1 border-t-2 border-gray-400">
                <BaseButton @click="undo(); this.canUpd()" :disabled="!canUndo" icon="ArrowUturnLeftIcon" tooltip="Отменить (Ctrl+Z)" placement="right" color="bg-mascot" />
                <BaseButton @click="redo(); this.canUpd()" :disabled="!canRedo" icon="ArrowUturnRightIcon" tooltip="Вернуть (Ctrl+Y)" placement="right" color="bg-mascot" />
                <hr class="m-1 border-t-2 border-gray-400">
                <BaseButton tooltip="Добавить текст" placement="right" @click="addText(this.canvas);" color="bg-mascot" icon="ItalicIcon"/>
                <BaseButton tooltip="Добавить рамку" placement="right" @click="addRect(this.canvas);" color="bg-mascot" icon="Squares2X2Icon"/>
                <SelectGalleryIcons tooltip="Добавить QR" placement="right" button-color="bg-mascot" button-icon="QrCodeIcon" modal-title="Выберите код" :icons="fabricIconsBarcodes()" @icon-selected="icon => addImage(this.canvas, icon.path, icon.meta, icon.meta_type)" />
                <SelectGalleryIcons tooltip="Добавить символ" placement="right" button-color="bg-mascot" button-icon="AtSymbolIcon" modal-title="Выберите символ" :icons="fabricIconsSpecial()" @icon-selected="icon => addImage(this.canvas, icon.path, icon.meta, icon.meta_type)" />
                <BaseButton tooltip="Добавить изображение" placement="right" @click="() => $refs.imageInput.click()" color="bg-mascot" icon="PhotoIcon"/>
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
    addImage, addRect, addText,
    onColorChange, onLayerClick,
    setTextAlign, setTextFont,
    toggleBold, toggleItalic, toggleProperty,
    updateFontSize, updateLineHeight,
    changeLayer, clearTextStyles, moveObject, rotateObject,
} from '@/utils/fabricHelpers.js';
import {loadCanvas, saveCanvas} from '@/utils/fabricSaveLoad.js';
import {registerKeyboardShortcuts} from '@/utils/keyboardListeners.js';
import {canRedo, canUndo, initRecording, record, redo, undo} from '@/utils/fabricHistory.js'
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
            zoom: 6,
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
            fontOptions: [
                { key: 'Arial', value: 'Arial' },
                { key: 'Times New Roman', value: 'Times New Roman' },
                { key: 'Verdana', value: 'Verdana' },
                { key: 'Helvetica', value: 'Helvetica' },
                { key: 'Georgia', value: 'Georgia' },
                { key: 'Courier New', value: 'Courier New' },
                { key: 'Comic Sans MS', value: 'Comic Sans MS' },
                { key: 'Trebuchet MS', value: 'Trebuchet MS' },
                { key: 'Impact', value: 'Impact' },
                { key: 'Lucida Sans Unicode', value: 'Lucida Sans Unicode' }
            ]
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
            () => saveCanvas(c, this.widthMM, this.heightMM, this.$route.params.id, this.$alert),
            () => clearTextStyles(c)
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
        fabricIconsSpecial, fabricIconsBarcodes, moveObject, rotateObject,
        undo, redo, onColorChange, onLayerClick, toggleProperty, changeLayer, clearTextStyles,

        exit() { this.$router.push('/'); },
        toggleVisibility(index) {
            toggleProperty(this.canvas, index, 'visible'); this.updateLayers();
        },
        toggleSelectable(index) {
            toggleProperty(this.canvas, index, 'selectable'); this.updateLayers();
        },
        handleChangeLayer(i, dir) {
            const success = changeLayer(this.canvas, i, dir);
            if (success) this.updateLayers();
        },
        updateLayers() {
            this.layers = this.canvas.getObjects().map((obj, i) => ({
                type: obj.id ? obj.id : obj.type,
                visible: obj.visible !== false,
                selectable: obj.selectable !== false,
                index: i,
            })).reverse();
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
            this.$alert('Данные скопированы в буфер обмена!', 'info');
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
</style>
