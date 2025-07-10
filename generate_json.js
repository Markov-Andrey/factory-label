import fs from 'fs/promises';
import path from 'path';
import { createCanvas } from 'canvas';
import JsBarcode from 'jsbarcode';
import bwipjs from 'bwip-js';
import axios from 'axios';

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
    const postData = { codes: [value] };

    try {
        const response = await axios.post('http://127.0.0.1:8000/api/get-svg', postData);
        const svgBase64 = response.data.data[0];
        obj.src = `data:image/svg+xml;base64,${svgBase64}`;
    } catch (error) {
        console.error('Ошибка запроса:', error);
    }
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
