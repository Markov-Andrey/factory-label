let canvas, history = [null], historyIndex = 1, onFlagsChanged = () => {}, isBlocked = false;

export function initRecording(c, flagsCallback) {
    canvas = c;
    onFlagsChanged = flagsCallback || (() => {});
    history = [null, canvas.toJSON()];
    historyIndex = 1;
    ['object:added', 'object:removed', 'object:modified', 'path:created', 'selection:created', 'selection:updated', 'selection:cleared']
        .forEach(eventName => {
            canvas.on(eventName, handleChange);
        });
    onFlagsChanged();
}

function handleChange() {
    if (!isBlocked) record();
}

export function record() {
    const json = canvas.toJSON();
    if (JSON.stringify(history[historyIndex]) === JSON.stringify(json)) return;
    if (historyIndex < history.length - 1) history.splice(historyIndex + 1);
    history.push(json);
    historyIndex++;
    if (history.length > 50) {
        history.splice(1, 1);
        historyIndex = Math.max(historyIndex - 1, 1);
    }
    onFlagsChanged();
}

const block = () => (isBlocked = true);
const unblock = () => (isBlocked = false);

export function undo() {
    if (!canUndo()) return;
    block();
    historyIndex--;
    canvas.loadFromJSON(history[historyIndex], () => {
        canvas.requestRenderAll();
        onFlagsChanged();
        setTimeout(unblock, 10);
    });
}

export function redo() {
    if (!canRedo()) return;
    block();
    historyIndex++;
    canvas.loadFromJSON(history[historyIndex], () => {
        canvas.requestRenderAll();
        onFlagsChanged();
        setTimeout(unblock, 10);
    });
}

export function canUndo() {
    return historyIndex > 1;
}

export function canRedo() {
    return historyIndex < history.length - 1;
}
