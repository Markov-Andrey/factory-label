import {setTextAlign} from "@/utils/fabricHelpers.js";
import {saveCanvas} from "@/utils/fabricSaveLoad.js";

function deleteActiveObjects(canvas) {
    const active = canvas.getActiveObjects();
    if (active.length) {
        active.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    }
}

export function registerKeyboardShortcuts(
    canvas,
    onUndo,
    onRedo,
    toggleBold,
    toggleItalic,
    setTextAlignLeft,
    setTextAlignCenter,
    setTextAlignRight,
    setTextAlignJustify,
    saveCanvas
) {
    const shortcutMap = {
        'ctrl+keyz': onUndo,
        'ctrl+keyy': onRedo,
        'ctrl+keyb': toggleBold,
        'ctrl+keyi': toggleItalic,
        'ctrl+keyl': setTextAlignLeft,
        'ctrl+keye': setTextAlignCenter,
        'ctrl+keyr': setTextAlignRight,
        'ctrl+keyj': setTextAlignJustify,
        'ctrl+keys': saveCanvas,
    };

    function handleKeyDown(e) {
        const key = e.code.toLowerCase();

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
