import fs from 'fs';
import path from 'path';
import { StaticCanvas } from 'fabric/node';
import { randomUUID } from 'crypto';

const DPI = 300;
const MM_TO_PX_REAL = DPI / 25.4;
const MM_TO_PX_FRONTEND = 6;

async function processFile(inputFile) {
    if (!fs.existsSync(inputFile)) throw new Error(`File not found: ${inputFile}`);

    const outputDir = path.dirname(inputFile);
    const uniqueName = randomUUID() + '.png';
    const outputFile = path.join(outputDir, uniqueName);

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
        out.on('finish', () => resolve(uniqueName));
        out.on('error', reject);
    });
}

async function main() {
    const inputFile = process.argv[2];
    if (!inputFile || !inputFile.toLowerCase().endsWith('.json')) process.exit(1);
    try {
        const result = await processFile(inputFile);
        console.log(result);
    } catch {
        process.exit(1);
    }
}

main();
