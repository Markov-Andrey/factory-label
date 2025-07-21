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
        fill: '#000000',
        backgroundColor: '',
        id: '',
        meta: 'text',
        ...options,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();

    return text;
}

/**
 * Добавляет новый прямоугольник в canvas и возвращает его.
 * @param {fabric.Canvas} canvas - экземпляр fabric.Canvas
 * @param {Object} options - дополнительные опции для прямоугольника
 * @returns {fabric.Rect} созданный объект прямоугольника
 */
export function addRect(canvas, options = {}) {
    const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 150,
        height: 100,
        fill: '',
        stroke: '#000000',
        strokeWidth: 1,
        rx: 2,
        ry: 2,
        id: '',
        meta: 'rect',
        ...options,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();

    return rect;
}

/**
 * Асинхронно загружает Изображение по URL, создаёт объект fabric.Image и добавляет его на canvas.
 * @param {fabric.Canvas} canvas - Экземпляр fabric.Canvas, на который добавляется изображение.
 * @param {string} imageUrl - URL файла (относительный или абсолютный путь).
 * @param {string} meta - ключ к типу вставляемого изображения.
 * @param {string} meta_type - ключ к подтипу вставляемого изображения.
 * @returns {Promise<fabric.Image>} Промис, который разрешается после добавления изображения на canvas с объектом fabric.Image.
 * @throws {Error} В случае ошибки загрузки изображения промис будет отклонён.
 */
export function addImage(canvas, imageUrl, meta = '', meta_type = '') {
    return new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // на случай CORS
        img.onload = () => {
            canvas.add(new fabric.Image(img, { left: 150, top: 150, meta: meta, meta_type: meta_type }));
            canvas.requestRenderAll();
            res();
        };
        img.onerror = rej;
        img.src = imageUrl;
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

/**
 * Меняет шрифт текста у выбранного текстового объекта на canvas.
 * @param {fabric.Canvas} canvas
 * @param {string} fontName - название шрифта (например, "Arial")
 */
export function setTextFont(canvas, fontName) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.isType('textbox')) {
        activeObj.set('fontFamily', fontName);
        canvas.requestRenderAll();
    }
}

/**
 * Устанавливает активный объект на canvas по индексу слоя при клике. Игнорирует клики по кнопкам внутри слоя.
 * @param {fabric.Canvas} canvas
 * @param {MouseEvent} event
 * @param {number} index
 */
export function onLayerClick(canvas, event, index) {
    if (event.target.closest('button')) return;
    const objects = canvas.getObjects();
    const obj = objects[index];
    if (obj && obj.selectable && obj.evented) {
        canvas.setActiveObject(obj);
    } else {
        canvas.discardActiveObject();
    }
    canvas.requestRenderAll();
}

/**
 * Переключает булево свойство объекта на canvas по индексу слоя.
 * @param {fabric.Canvas} canvas
 * @param {number} index - Индекс объекта в списке объектов canvas
 * @param {string} prop - Имя свойства для переключения (например, 'visible' или 'selectable')
 */
export function toggleProperty(canvas, index, prop) {
    const obj = canvas.getObjects()[index];
    if (!obj) return;
    obj[prop] = !obj[prop];
    canvas.renderAll();
}

/**
 * Меняет порядок слоев объекта на canvas, перемещая указанный объект вверх или вниз.
 * @param {fabric.Canvas} canvas
 * @param {number} index - Индекс объекта в списке объектов canvas
 * @param {'up'|'down'} direction - Направление перемещения
 * @returns {boolean} Был ли выполнен перенос
 */
export function changeLayer(canvas, index, direction) {
    const objects = [...canvas.getObjects()];
    if (index < 0 || index >= objects.length) return false;

    let moved = false;

    switch (direction) {
        case 'up':
            if (index < objects.length - 1) {
                [objects[index], objects[index + 1]] = [objects[index + 1], objects[index]];
                moved = true;
            }
            break;
        case 'down':
            if (index > 0) {
                [objects[index], objects[index - 1]] = [objects[index - 1], objects[index]];
                moved = true;
            }
            break;
    }

    if (!moved) return false;

    canvas.clear();
    objects.forEach(obj => canvas.add(obj));
    canvas.renderAll();
    return true;
}