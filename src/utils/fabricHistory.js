let canvas = null;
let history = [];
let historyIndex = 1;
let onFlagsChanged = () => {};
let isBlocked = false;

export function initRecording(canvasInstance, flagsCallback) {
    canvas = canvasInstance;
    onFlagsChanged = flagsCallback || (() => {});

    history = [];
    historyIndex = 1;

    history.push(null); // заглушка под индекс 0
    history.push(canvas.toJSON());

    canvas.on('object:added', handleChange);
    canvas.on('object:modified', handleChange);
    canvas.on('object:removed', handleChange);

    onFlagsChanged();
}

function handleChange() {
    if (isBlocked) return;
    record();
}

export function record() {
    const json = canvas.toJSON();
    const last = history[historyIndex];

    if (last && JSON.stringify(last) === JSON.stringify(json)) return;

    if (historyIndex < history.length - 1) {
        history.splice(historyIndex + 1);
    }

    history.push(json);
    historyIndex++;

    if (history.length > 50) {
        history.splice(1, 1);
        if (historyIndex > 1) historyIndex--;
    }

    onFlagsChanged();
}

function block() {
    isBlocked = true;
}

function unblock() {
    isBlocked = false;
}

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
