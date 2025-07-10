import fs from 'fs/promises';
import path from 'path';
import { createCanvas } from 'canvas';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import axios from 'axios';

const templatePath = 'C:\\Program Files\\OSPanel\\domains\\fabric\\public\\template\\test_canvas_2.json';
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

async function updateQr(obj, value) {
    const canvas = createCanvas(100, 100);
    await QRCode.toCanvas(canvas, value, {
        type: 'svg',
        margin: 1,
        version: 7,
        width: 100,
        errorCorrectionLevel: 'H',
    });
    obj.src = canvas.toDataURL();
}

async function process() {
    const template = await loadJson(templatePath);
    const testData = await loadJson(testDataPath);

    for (let i = 0; i < testData.length; i++) {
        const dataItem = testData[i];
        const newObj = JSON.parse(JSON.stringify(template));

        for (const obj of newObj.objects) {
            const key = obj.id;
            const meta = obj.meta;

            if (!key || !(key in dataItem)) continue;

            const val = dataItem[key];

            switch (meta) {
                case 'text': updateTextbox(obj, val); break;
                case 'qr': await updateQr(obj, val); break;
                case 'barcode': updateBarcode(obj, val); break;
                case 'datamatrix': await updateDatamatix(obj, val); break;
                default: break;
            }
        }

        const outputFile = path.join(outputDir, `output_${i + 1}.json`);
        await fs.writeFile(outputFile, JSON.stringify(newObj, null, 2), 'utf-8');
    }
}

process().catch(console.error);
