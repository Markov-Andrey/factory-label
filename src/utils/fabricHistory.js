// canvasRecording.js

export function pauseRecording(canvas, recordState) {
    canvas.off('object:added', recordState);
    canvas.off('object:modified', recordState);
    canvas.off('object:removed', recordState);
}

export function resumeRecording(canvas, recordState) {
    canvas.on('object:added', recordState);
    canvas.on('object:modified', recordState);
    canvas.on('object:removed', recordState);
}

export function undo({
                         canvas,
                         history,
                         historyIndex,
                         setHistoryIndex,
                         pauseRecording,
                         resumeRecording,
                         setIsUndoRedoRunning,
                         updateUndoRedoFlags,
                         canUndo
                     }) {
    if (!canUndo()) return;

    setIsUndoRedoRunning(true);
    pauseRecording();

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);

    const prevState = history[newIndex];
    canvas.loadFromJSON(prevState, () => {
        canvas.requestRenderAll();
        setIsUndoRedoRunning(false);
        resumeRecording();
        updateUndoRedoFlags();
    });
}

export function redo({
                         canvas,
                         history,
                         historyIndex,
                         setHistoryIndex,
                         pauseRecording,
                         resumeRecording,
                         setIsUndoRedoRunning,
                         updateUndoRedoFlags,
                         canRedo
                     }) {
    if (!canRedo()) return;

    setIsUndoRedoRunning(true);
    pauseRecording();

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);

    const nextState = history[newIndex];
    canvas.loadFromJSON(nextState, () => {
        canvas.requestRenderAll();
        setIsUndoRedoRunning(false);
        resumeRecording();
        updateUndoRedoFlags();
    });
}