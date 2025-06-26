import fs from 'fs';
import path from 'path';
import { StaticCanvas } from 'fabric/node';

const inputDir = 'C:\\Program Files\\OSPanel\\domains\\fabric\\public\\input';
const outputDir = 'C:\\Program Files\\OSPanel\\domains\\fabric\\public\\output';

const DPI = 300;
const MM_TO_PX_REAL = DPI / 25.4;
const MM_TO_PX_FRONTEND = 4;

async function processFile(fileName) {
    const inputFile = path.join(inputDir, fileName);
    const outputFile = path.join(outputDir, fileName.replace(/\.json$/i, '.png'));

    const json = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    const width = json.custom?.widthMM ? Math.round(json.custom.widthMM * MM_TO_PX_REAL) : (json.width || 500);
    const height = json.custom?.heightMM ? Math.round(json.custom.heightMM * MM_TO_PX_REAL) : (json.height || 500);

    const canvas = new StaticCanvas(null, { width, height });

    await canvas.loadFromJSON(json);

    const scale = MM_TO_PX_REAL / MM_TO_PX_FRONTEND;
    canvas.getObjects().forEach(obj => {
        obj.scaleX *= scale;
        obj.scaleY *= scale;
        obj.left *= scale;
        obj.top *= scale;
        obj.setCoords();
    });
    canvas.renderAll();

    return new Promise((resolve, reject) => {
        const out = fs.createWriteStream(outputFile);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => {
            console.log(`Готово! Картинка записана в ${outputFile}`);
            resolve();
        });
        out.on('error', reject);
    });
}

async function processAll() {
    try {
        const files = fs.readdirSync(inputDir).filter(f => f.toLowerCase().endsWith('.json'));
        for (const file of files) {
            await processFile(file);
        }
        console.log('Все файлы обработаны.');
    } catch (err) {
        console.error('Ошибка обработки:', err);
    }
}

processAll();
