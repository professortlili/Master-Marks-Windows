const fs = require('fs');
const path = require('path');

const version = process.env.APP_VERSION;
if (!version) {
    console.error('APP_VERSION environment variable not set');
    process.exit(1);
}

console.log(`[INFO] Updating version to ${version}...`);

// 1. Update package.json (Semantic versioning for electron-builder)
const pkgPath = path.join(__dirname, 'package.json');
if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    let semV = version.split('.');
    while (semV.length < 3) semV.push('0');
    pkg.version = semV.slice(0, 3).join('.');
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4));
    console.log(`[OK] package.json updated to ${pkg.version}`);
}

// 2. Update index.html (Static display in splash screen)
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    // Targeted replacement for the span with id="app-version-display"
    const newContent = content.replace(/id="app-version-display">[^<]+<\/span>/, `id="app-version-display">${version}</span>`);
    if (content !== newContent) {
        fs.writeFileSync(indexPath, newContent);
        console.log(`[OK] index.html version display updated to ${version}`);
    } else {
        console.warn(`[WARN] Could not find id="app-version-display" in index.html`);
        // Fallback to the Arabic pattern if the ID match failed
        const fallbackContent = content.replace(/الإصدار [0-9.]+/g, `الإصدار ${version}`);
        if (content !== fallbackContent) {
            fs.writeFileSync(indexPath, fallbackContent);
            console.log(`[OK] index.html (fallback pattern) updated to ${version}`);
        }
    }
}

// 3. Update script.js (Internal logic used by the UI)
const scriptPath = path.join(__dirname, 'script.js');
if (fs.existsSync(scriptPath)) {
    let content = fs.readFileSync(scriptPath, 'utf8');
    const newContent = content.replace(/const APP_VERSION = "[^"]+"/, `const APP_VERSION = "${version}"`);
    if (content !== newContent) {
        fs.writeFileSync(scriptPath, newContent);
        console.log(`[OK] script.js constant updated to ${version}`);
    } else {
        console.warn(`[WARN] Could not find APP_VERSION constant in script.js`);
    }
}
