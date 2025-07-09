import fs from 'fs/promises';
import path from 'path';
import { createCanvas } from 'canvas';
import JsBarcode from 'jsbarcode';
import bwipjs from 'bwip-js'

const templatePath = 'C:\\Program Files\\OSPanel\\domains\\fabric\\public\\template\\test_canvas_1.json';
const testDataPath = 'C:\\Program Files\\OSPanel\\domains\\fabric\\public\\test\\test.json';
const outputDir = 'C:\\Program Files\\OSPanel\\domains\\fabric\\public\\input\\';

async function loadJson(filePath) {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

function updateTextbox(obj, value) {
    obj.text = value;
}

function updateBarcode(obj, value) {
    const filename = path.basename(obj.src);
    const format = path.parse(filename).name;
    const canvas = createCanvas();
    JsBarcode(canvas, value, {
        format,
        width: 2,
        height: 80,
        background: '',
        displayValue: true,
    });
    obj.src = canvas.toDataURL();
}

async function updateDatamatix(obj, value) {
    const pngBuffer = await bwipjs.toBuffer({
        bcid: 'datamatrix',
        text: value,
        scale: 5,
        includetext: false,
        gs1: true,
    });
    const pngBase64 = pngBuffer.toString('base64');
    obj.src = `data:image/png;base64,${pngBase64}`;
}

async function process() {
    const template = await loadJson(templatePath);
    const testData = await loadJson(testDataPath);

    for (let i = 0; i < testData.length; i++) {
        const dataItem = testData[i];
        const newObj = JSON.parse(JSON.stringify(template));

        for (const obj of newObj.objects) {
            const key = obj.id;
            if (key && key in dataItem) {
                const val = dataItem[key];
                if (obj.type === 'Textbox') {
                    updateTextbox(obj, val);
                } else if (obj.type === 'Image') {
                    if (key === 'barcode') {
                        updateBarcode(obj, val);
                    } else if (key === 'datamatrix') {
                        await updateDatamatix(obj, val);
                    }
                }
            }
        }

        const outputFile = path.join(outputDir, `output_${i + 1}.json`);
        await fs.writeFile(outputFile, JSON.stringify(newObj, null, 2), 'utf-8');
    }
}

process().catch(console.error);
