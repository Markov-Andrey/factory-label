// src/utils/fabricHelpers.js
import * as fabric from 'fabric';

/**
 * Добавляет новый текстовый объект в canvas и возвращает его.
 * @param {fabric.Canvas} canvas - экземпляр fabric.Canvas
 * @param {Object} options - дополнительные опции для текста
 * @returns {fabric.Textbox} созданный текстовый объект
 */
export function addText(canvas, options = {}) {
    const text = new fabric.Textbox('Новый текст', {
        fontFamily: 'Times New Roman',
        left: 100,
        top: 100,
        fontSize: 30,
        fill: 'black',
        id: '',
        ...options,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();

    return text;
}

/**
 * Асинхронно загружает SVG-изображение по URL, создаёт объект fabric.Image и добавляет его на canvas.
 * @param {fabric.Canvas} canvas - Экземпляр fabric.Canvas, на который добавляется изображение.
 * @param {string} svgUrl - URL файла SVG (относительный или абсолютный путь).
 * @returns {Promise<fabric.Image>} Промис, который разрешается после добавления изображения на canvas с объектом fabric.Image.
 * @throws {Error} В случае ошибки загрузки изображения промис будет отклонён.
 */
export function addSVG(canvas, svgUrl) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // на случай CORS
        img.onload = () => {
            canvas.add(new fabric.Image(img, { left: 150, top: 150 }));
            canvas.requestRenderAll();
            res();
        };
        img.onerror = rej;
        img.src = svgUrl;
    });
}

/**
 * Устанавливает выравнивание текста у активного объекта на canvas, если это текстбокс.
 * @param {fabric.Canvas} canvas - экземпляр fabric.Canvas
 * @param {string} alignment - значение выравнивания ('left', 'center', 'right', 'justify')
 */
export function setTextAlign(canvas, alignment) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.isType('textbox')) {
        activeObj.set('textAlign', alignment);
        canvas.requestRenderAll();
    }
}

/**
 * Переключает жирность шрифта у активного текстового объекта на canvas.
 * @param {fabric.Canvas} canvas
 */
export function toggleBold(canvas) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.isType('textbox')) {
        const newWeight = activeObj.fontWeight === 'bold' ? 'normal' : 'bold';
        activeObj.set('fontWeight', newWeight);
        canvas.requestRenderAll();
    }
}

/**
 * Переключает курсив у активного текстового объекта на canvas.
 * @param {fabric.Canvas} canvas
 */
export function toggleItalic(canvas) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.isType('textbox')) {
        const newStyle = activeObj.fontStyle === 'italic' ? 'normal' : 'italic';
        activeObj.set('fontStyle', newStyle);
        canvas.requestRenderAll();
    }
}

/**
 * Обновляет размер шрифта у активного текстового объекта на canvas.
 * @param {fabric.Canvas} canvas
 * @param {number} fontSize
 */
export function updateFontSize(canvas, fontSize) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.isType('textbox')) {
        activeObj.set('fontSize', fontSize);
        canvas.requestRenderAll();
    }
}

/**
 * Обновляет междустрочный интервал у активного текстового объекта на canvas.
 * @param {fabric.Canvas} canvas
 * @param {number} lineHeight
 */
export function updateLineHeight(canvas, lineHeight) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.isType('textbox')) {
        activeObj.set('lineHeight', parseFloat(lineHeight));
        canvas.requestRenderAll();
    }
}

/**
 * Меняет цвет указанного атрибута у активного объекта на canvas.
 * @param {string} color - новый цвет
 * @param {fabric.Canvas} canvas
 * @param {string} attribute - имя свойства, которое нужно изменить (например, 'fill' или 'stroke')
 */
export function onColorChange(color, canvas, attribute) {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
        activeObj.set(attribute, color);
        canvas.requestRenderAll();
    }
}