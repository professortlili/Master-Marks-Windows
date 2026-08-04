const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('./obfuscator-config.json', 'utf8'));
const filesToObfuscate = [
    'electron-main.js',
    'activation-system.js',
    'preload.js',
    'script.js',
    'verify-hwid.js'
];

const backupDir = './_backup_src';

async function obfuscateFiles() {
    console.log('--- Starting Obfuscation Process ---');

    // 1. Create backup directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    for (const file of filesToObfuscate) {
        const filePath = path.join(__dirname, file);
        const backupPath = path.join(backupDir, file);

        if (fs.existsSync(filePath)) {
            console.log(`Processing: ${file}...`);
            
            // Backup original file
            fs.copyFileSync(filePath, backupPath);

            // Read original content
            const sourceCode = fs.readFileSync(filePath, 'utf8');

            // Obfuscate
            const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, config);

            // Overwrite original with obfuscated code
            fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());
            console.log(`Successfully obfuscated: ${file}`);
        } else {
            console.warn(`Warning: File ${file} not found.`);
        }
    }

    console.log('\n--- Obfuscation Complete! ---');
    console.log(`Original files are backed up in: ${backupDir}`);
    console.log('You can now run "npm run build:scorebook" to package the protected app.');
    console.log('To restore original files, use "node restore-src.js"');
}

obfuscateFiles().catch(err => {
    console.error('Obfuscation failed:', err);
});
