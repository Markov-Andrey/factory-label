export function saveCanvas(canvas, widthMM, heightMM) {
    const json = canvas.toJSON();
    json.custom = {
        widthMM: Number(widthMM),
        heightMM: Number(heightMM),
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.json';
    a.click();
    URL.revokeObjectURL(url);
}

export async function loadCanvas(canvas, file, canvasEl, undoRedo, mmToPx) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
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

                    if (undoRedo) {
                        undoRedo.history.value = [];
                        undoRedo.historyIndex.value = -1;
                        undoRedo.recordState();
                    }

                    resolve({ widthPx, heightPx });
                });
            } catch (err) {
                alert('Ошибка загрузки: ' + err.message);
                reject(err);
            }
        };

        reader.readAsText(file);
    });
}