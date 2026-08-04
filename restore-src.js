const fs = require('fs');
const path = require('path');

const backupDir = './_backup_src';
const filesToRestore = [
    'electron-main.js',
    'activation-system.js',
    'preload.js',
    'script.js',
    'verify-hwid.js'
];

function restoreFiles() {
    console.log('--- Restoring Original Source Files ---');

    if (!fs.existsSync(backupDir)) {
        console.error('Error: Backup directory not found!');
        return;
    }

    for (const file of filesToRestore) {
        const backupPath = path.join(backupDir, file);
        const targetPath = path.join(__dirname, file);

        if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, targetPath);
            console.log(`Restored: ${file}`);
        }
    }

    console.log('\n--- Restore Complete! ---');
}

restoreFiles();
