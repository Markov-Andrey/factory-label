import axios from 'axios';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export async function saveCanvas(canvas, widthMM, heightMM, id) {
    const json = canvas.toJSON();
    json.custom = {
        widthMM: Number(widthMM),
        heightMM: Number(heightMM),
    };
    const pngDataUrl = canvas.toDataURL();
    try {
        await axios.patch(`${apiBaseUrl}/api/templates/${id}`, {
            template: JSON.stringify(json, null, 2),
            widthMM,
            heightMM,
            preview_png: pngDataUrl,
        });
        console.log('Шаблон и превью успешно сохранены');
    } catch (error) {
        console.error('Ошибка при сохранении шаблона:', error);
        throw error;
    }
}

export async function loadCanvas(canvas, json, canvasEl, mmToPx) {
    return new Promise((resolve, reject) => {
        try {
            if (typeof json === 'string') {
                json = JSON.parse(json);
            }
            canvas.clear();

            let widthPx, heightPx;

            if (json.custom?.widthMM && json.custom?.heightMM) {
                widthPx = mmToPx(json.custom.widthMM);
                heightPx = mmToPx(json.custom.heightMM);

                canvasEl.width = widthPx;
                canvasEl.height = heightPx;
                canvas.setWidth(widthPx);
                canvas.setHeight(heightPx);
                canvas.calcOffset();
            }

            canvas.loadFromJSON(json, () => {
                canvas.requestRenderAll();
                resolve({ widthPx, heightPx });
            });
        } catch (err) {
            console.log('Ошибка загрузки: ' + err.message);
            reject(err);
        }
    });
}