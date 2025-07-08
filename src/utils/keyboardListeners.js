function deleteActiveObjects(canvas) {
    const active = canvas.getActiveObjects();
    if (active.length) {
        active.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    }
}

export function registerKeyboardShortcuts(canvas, onUndo, onRedo) {
    function handleKeyDown(e) {
        // Удаление по Delete
        if (e.key === 'Delete' || e.keyCode === 46) {
            deleteActiveObjects(canvas);
        }
        // Ctrl+Z - undo
        else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
            if (typeof onUndo === 'function') onUndo();
            e.preventDefault();
        }
        // Ctrl+Y - redo
        else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            if (typeof onRedo === 'function') onRedo();
            e.preventDefault();
        }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
}
