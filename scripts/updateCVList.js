// Script to help update the CV detection list
// Run this script when you add a new CV file

const fs = require('fs');
const path = require('path');

const CV_DETECTOR_PATH = path.join(__dirname, '../utils/cvDetector.ts');
const DOCUMENTS_PATH = path.join(__dirname, '../assets/documents');

// Read current CV detector file
let cvDetectorContent = fs.readFileSync(CV_DETECTOR_PATH, 'utf8');

// Get all PDF files in documents folder
const files = fs.readdirSync(DOCUMENTS_PATH);
const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

console.log('📁 Found PDF files in assets/documents/:');
pdfFiles.forEach((file, index) => {
  console.log(`  ${index + 1}. ${file}`);
});

// Update the KNOWN_CV_FILES array
const newCVFiles = pdfFiles.map(file => `'${file}'`).join(',\n  ');

const updatedContent = cvDetectorContent.replace(
  /export const KNOWN_CV_FILES: string\[\] = \[[\s\S]*?\];/,
  `export const KNOWN_CV_FILES: string[] = [\n  ${newCVFiles},\n  // Add more CV files here as you create them\n];`
);

// Write updated content back to file
fs.writeFileSync(CV_DETECTOR_PATH, updatedContent);

console.log('\n✅ Updated CV detection list!');
console.log('📝 The system will now automatically detect these CV files in order of preference.');
