import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const framesDir = path.join(__dirname, 'references', 'BadApplefiles', 'frames-ascii');
const outputFile = path.join(__dirname, 'public', 'bad-apple-frames.json');
const publicDir = path.join(__dirname, 'public');

async function combineFrames() {
  try {
    console.log(`Reading files from: ${framesDir}`);
    const files = await fs.promises.readdir(framesDir);

    const frameFiles = files
      .filter(file => file.startsWith('out') && file.endsWith('.jpg.txt'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/(\d+)/)[0], 10);
        const numB = parseInt(b.match(/(\d+)/)[0], 10);
        return numA - numB;
      });

    if (frameFiles.length === 0) {
      console.error('No frame files found. Please check the directory and file naming.');
      return;
    }

    console.log(`Found ${frameFiles.length} frame files to process.`);

    const allFrames = [];
    for (const file of frameFiles) {
      const filePath = path.join(framesDir, file);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      allFrames.push(content);
    }

    // Ensure the public directory exists
    if (!fs.existsSync(publicDir)) {
      await fs.promises.mkdir(publicDir);
    }

    console.log(`Writing ${allFrames.length} frames to ${outputFile}...`);
    await fs.promises.writeFile(outputFile, JSON.stringify(allFrames, null, 2));

    console.log('Successfully created bad-apple-frames.json!');

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

combineFrames();
