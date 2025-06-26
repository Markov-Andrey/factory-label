export function useCanvasSaveLoad(canvasRef, widthMMRef, heightMMRef, mmToPxFn) {
    function saveCanvas() {
        const json = canvasRef.value.toJSON();
        json.custom = {
            widthMM: Number(widthMMRef()),
            heightMM: Number(heightMMRef()),
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

    function loadCanvas(file, onDimensionsUpdate = () => {}) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                canvasRef.value.clear();

                if (json.custom?.widthMM && json.custom?.heightMM) {
                    widthMMRef.value = json.custom.widthMM;
                    heightMMRef.value = json.custom.heightMM;

                    const widthPx = mmToPxFn(widthMMRef.value);
                    const heightPx = mmToPxFn(heightMMRef.value);

                    onDimensionsUpdate(widthPx, heightPx);
                }

                canvasRef.value.loadFromJSON(json, () => {
                    canvasRef.value.requestRenderAll();
                });
            } catch (err) {
                alert('Ошибка загрузки: ' + err.message);
            }
        };

        reader.readAsText(file);
    }

    return { saveCanvas, loadCanvas };
}
