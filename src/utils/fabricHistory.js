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