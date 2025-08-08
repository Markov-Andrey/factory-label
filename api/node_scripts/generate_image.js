import fs from 'fs';
import path from 'path';
import { StaticCanvas } from 'fabric/node';
import { randomUUID } from 'crypto';

const DPI = 300;
const MM_TO_PX_REAL = DPI / 25.4;
const MM_TO_PX_FRONTEND = 6;

const logFile = '/tmp/node_generate_image.log';

function log(message) {
    const time = new Date().toISOString();
    fs.appendFileSync(logFile, `[${time}] ${message}\n`);
}

async function processFile(inputFile) {
    log(`processFile started with inputFile: ${inputFile}`);

    if (!fs.existsSync(inputFile)) {
        log(`File not found: ${inputFile}`);
        throw new Error(`File not found: ${inputFile}`);
    }

    const outputDir = path.dirname(inputFile);
    const uniqueName = randomUUID() + '.png';
    const outputFile = path.join(outputDir, uniqueName);

    log(`Output file will be: ${outputFile}`);

    const json = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    const width = json.custom?.widthMM ? Math.round(json.custom.widthMM * MM_TO_PX_REAL) : (json.width || 500);
    const height = json.custom?.heightMM ? Math.round(json.custom.heightMM * MM_TO_PX_REAL) : (json.height || 500);

    log(`Canvas size: width=${width}, height=${height}`);

    const canvas = new StaticCanvas(null, { width, height });

    try {
        await canvas.loadFromJSON(json);
        log('Canvas loaded from JSON');
    } catch (e) {
        log('Error loading canvas from JSON: ' + e.message);
        throw e;
    }

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
            log(`PNG file created: ${uniqueName}`);
            resolve(uniqueName);
        });
        out.on('error', (err) => {
            log('Error writing PNG file: ' + err.message);
            reject(err);
        });
    });
}

async function main() {
    const inputFile = process.argv[2];
    if (!inputFile || !inputFile.toLowerCase().endsWith('.json')) {
        log('Invalid or missing input file argument');
        process.exit(1);
    }

    try {
        const result = await processFile(inputFile);
        console.log(result);
        log('Process finished successfully with result: ' + result);
    } catch (e) {
        log('Fatal error: ' + e.message);
        process.exit(1);
    }
}

main();
