function deleteActiveObjects(canvas) {
    const active = canvas.getActiveObjects();
    if (active.length) {
        active.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    }
}

export function registerKeyboardShortcuts(canvas) {
    function handleKeyDown(e) {
        if (e.key === 'Delete' || e.keyCode === 46) {
            deleteActiveObjects(canvas);
        }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
}
