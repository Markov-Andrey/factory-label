// useUndoRedo.js (оставляем как есть)
import { ref, computed } from 'vue';

export function useUndoRedo(canvas) {
    const history = ref([]);
    const historyIndex = ref(-1);
    const isUndoRedoRunning = ref(false);

    const canUndo = computed(() => historyIndex.value > 0);
    const canRedo = computed(() => historyIndex.value < history.value.length - 1);

    function recordState() {
        if (isUndoRedoRunning.value) return;

        const json = canvas.value.toJSON();

        const last = history.value[historyIndex.value];
        if (last && JSON.stringify(last) === JSON.stringify(json)) return;

        if (historyIndex.value < history.value.length - 1) {
            history.value.splice(historyIndex.value + 1);
        }

        history.value.push(json);

        if (history.value.length > 50) {
            history.value.shift();
            historyIndex.value = history.value.length - 1;
        } else {
            historyIndex.value = history.value.length - 1;
        }
    }

    function pauseRecording() {
        canvas.value.off('object:added', recordState);
        canvas.value.off('object:modified', recordState);
        canvas.value.off('object:removed', recordState);
    }

    function resumeRecording() {
        canvas.value.on('object:added', recordState);
        canvas.value.on('object:modified', recordState);
        canvas.value.on('object:removed', recordState);
    }

    function undo() {
        if (!canUndo.value) return;

        isUndoRedoRunning.value = true;
        pauseRecording();
        historyIndex.value--;

        const prevState = history.value[historyIndex.value];
        canvas.value.loadFromJSON(prevState, () => {
            canvas.value.requestRenderAll();
            setTimeout(() => {
                isUndoRedoRunning.value = false;
                resumeRecording();
            }, 0);
        });
    }

    function redo() {
        if (!canRedo.value) return;

        isUndoRedoRunning.value = true;
        pauseRecording();
        historyIndex.value++;

        const nextState = history.value[historyIndex.value];
        canvas.value.loadFromJSON(nextState, () => {
            canvas.value.requestRenderAll();
            setTimeout(() => {
                isUndoRedoRunning.value = false;
                resumeRecording();
            }, 0);
        });
    }

    return {
        history,
        historyIndex,
        canUndo,
        canRedo,
        recordState,
        pauseRecording,
        resumeRecording,
        undo,
        redo,
    };
}
