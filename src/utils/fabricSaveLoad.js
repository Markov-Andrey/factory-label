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

export function loadCanvas(canvas, file, onDimensionsUpdate = () => {}) {
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            canvas.clear();

            if (json.custom?.widthMM && json.custom?.heightMM) {
                onDimensionsUpdate(json.custom.widthMM, json.custom.heightMM);
            }

            canvas.loadFromJSON(json, () => {
                canvas.requestRenderAll();
            });
        } catch (err) {
            alert('Ошибка загрузки: ' + err.message);
        }
    };

    reader.readAsText(file);
}