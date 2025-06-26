export function useDeleteObjects(canvas) {
    function handleDelete() {
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            activeObjects.forEach(obj => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }
    }

    function handleKeyDown(event) {
        if (event.key === 'Delete' || event.keyCode === 46) {
            handleDelete();
        }
    }

    return {
        handleDelete,
        handleKeyDown,
    };
}
