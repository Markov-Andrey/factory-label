import {setTextAlign} from "@/utils/fabricHelpers.js";

function deleteActiveObjects(canvas) {
    const active = canvas.getActiveObjects();
    if (active.length) {
        active.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    }
}

export function registerKeyboardShortcuts(canvas, onUndo, onRedo, toggleBold, toggleItalic, setTextAlignLeft, setTextAlignCenter, setTextAlignRight, setTextAlignJustify) {
    const shortcutMap = {
        'ctrl+z': onUndo,
        'ctrl+y': onRedo,
        'ctrl+b': toggleBold,
        'ctrl+i': toggleItalic,
        'ctrl+l': setTextAlignLeft,
        'ctrl+e': setTextAlignCenter,
        'ctrl+r': setTextAlignRight,
        'ctrl+j': setTextAlignJustify,
    };

    function handleKeyDown(e) {
        const key = e.key.toLowerCase();

        if (key === 'delete' || e.keyCode === 46) {
            deleteActiveObjects(canvas);
            return;
        }

        const combination = [
            e.ctrlKey ? 'ctrl' : '',
            e.shiftKey ? 'shift' : '',
            key
        ].filter(Boolean).join('+');

        const handler = shortcutMap[combination];
        if (typeof handler === 'function') {
            handler();
            e.preventDefault();
        }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
}
