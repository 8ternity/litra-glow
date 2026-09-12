const fs = require('fs');
const sharp = require('sharp');

async function convertSvgToPng(svgPath, pngPath) {
  try {
    console.log(`Converting ${svgPath} to ${pngPath}`);
    
    // Lire le fichier SVG
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convertir en PNG avec une taille de 144x144 pixels
    await sharp(svgBuffer)
      .resize(144, 144)
      .png()
      .toFile(pngPath);
      
    console.log(`Conversion successful: ${pngPath}`);
  } catch (error) {
    console.error(`Error converting ${svgPath}:`, error);
  }
}

async function main() {
  await convertSvgToPng(
    'com.litra.glow.v2.sdPlugin/imgs/temperature-up.svg',
    'com.litra.glow.v2.sdPlugin/imgs/temperature-up.png'
  );
  
  await convertSvgToPng(
    'com.litra.glow.v2.sdPlugin/imgs/temperature-down.svg',
    'com.litra.glow.v2.sdPlugin/imgs/temperature-down.png'
  );
}

main(); 