const { app, BrowserWindow, Menu, ipcMain, shell, nativeImage } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// Set App User Model ID for Windows taskbar icon consistency (Must be set early)
if (process.platform === 'win32') {
    app.setAppUserModelId('com.master.marks');
}
app.setName('Master Marks');

const DATA_DIR = process.env.PORTABLE_EXECUTABLE_DIR || app.getPath('userData');
const DB_PATH = path.join(DATA_DIR, 'scorebookdata.json');

// Helper to ensure database file exists
function ensureDb() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ teacherInfo: {}, classes: [] }, null, 2));
    }
}

ipcMain.handle('save-app-state', async (event, state) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
        return { success: true };
    } catch (error) {
        console.error('Failed to save state:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-app-state', async () => {
    try {
        ensureDb();
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load state:', error);
        return null;
    }
});

ipcMain.handle('toggle-fullscreen', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        const isFullscreen = win.isFullScreen();
        win.setFullScreen(!isFullscreen);
        return !isFullscreen;
    }
    return false;
});

ipcMain.handle('close-app', async () => {
    app.quit();
});

ipcMain.handle('registry-get', async (event, keyName) => {
    return new Promise((resolve) => {
        exec(`reg query HKCU\\Software\\MasterMarks /v ${keyName}`, { timeout: 5000, shell: true }, (err, stdout) => {
            if (err || !stdout) {
                resolve(null);
            } else {
                const regex = new RegExp(`${keyName}\\s+REG_\\w+\\s+(.+)`);
                const match = stdout.match(regex);
                if (match && match[1]) resolve(match[1].trim());
                else resolve(null);
            }
        });
    });
});

ipcMain.handle('registry-set', async (event, keyName, value) => {
    return new Promise((resolve) => {
        exec(`reg add HKCU\\Software\\MasterMarks /v ${keyName} /t REG_SZ /d "${value}" /f`, { timeout: 5000, shell: true }, () => resolve(true));
    });
});

// --- Shadow Registry System (Survivability against Uninstallation) ---
const SHADOW_REG_PATH = `HKCU\\Software\\Classes\\CLSID\\{A8B1C2D3-E4F5-4A7B-8C9D-0E1F2A3B4C5D}`;

ipcMain.handle('hidden-reg-get', async (event, keyName) => {
    return new Promise((resolve) => {
        // Obfuscate keyName to look like system components
        let internalKey = keyName;
        if (keyName === 'RevokedKeys') internalKey = 'SystemUpdateID';
        if (keyName === 'ActivationKey') internalKey = 'ProviderID';
        if (keyName === 'LastKnownTime') internalKey = 'LastSyncTime';
        if (keyName === 'TamperCount') internalKey = 'ValidationCode';

        exec(`reg query "${SHADOW_REG_PATH}" /v ${internalKey}`, { timeout: 5000, shell: true }, (err, stdout) => {
            if (err || !stdout) {
                resolve(null);
            } else {
                const regex = new RegExp(`${internalKey}\\s+REG_\\w+\\s+(.+)`);
                const match = stdout.match(regex);
                if (match && match[1]) resolve(match[1].trim());
                else resolve(null);
            }
        });
    });
});

ipcMain.handle('hidden-reg-set', async (event, keyName, value) => {
    return new Promise((resolve) => {
        let internalKey = keyName;
        if (keyName === 'RevokedKeys') internalKey = 'SystemUpdateID';
        if (keyName === 'ActivationKey') internalKey = 'ProviderID';
        if (keyName === 'LastKnownTime') internalKey = 'LastSyncTime';
        if (keyName === 'TamperCount') internalKey = 'ValidationCode';

        exec(`reg add "${SHADOW_REG_PATH}" /v ${internalKey} /t REG_SZ /d "${value}" /f`, { timeout: 5000, shell: true }, () => resolve(true));
    });
});

// --- Hidden License Cache System ---
const LICENSE_CACHE_FILE = path.join(DATA_DIR, '.sys_cache.dat');
const APP_DIR = path.dirname(process.execPath);
const APP_DIR_CACHE_FILE = path.join(APP_DIR, '.license_backup.dat');

ipcMain.handle('save-license-cache', async (event, encryptedData) => {
    let appDataSuccess = false;
    let appDirSuccess = false;

    // 1. Save to AppData (Always works)
    try {
        fs.writeFileSync(LICENSE_CACHE_FILE, encryptedData, 'utf-8');
        if (process.platform === 'win32') exec(`attrib +h "${LICENSE_CACHE_FILE}"`);
        appDataSuccess = true;
    } catch (e) {}

    // 2. Save to App Directory (Works in Portable mode, might fail in Program Files)
    try {
        fs.writeFileSync(APP_DIR_CACHE_FILE, encryptedData, 'utf-8');
        if (process.platform === 'win32') exec(`attrib +h "${APP_DIR_CACHE_FILE}"`);
        appDirSuccess = true;
    } catch (e) {}
    
    return { appDataSuccess, appDirSuccess };
});

ipcMain.handle('load-license-cache', async () => {
    // Try to load from any available source
    try {
        if (fs.existsSync(LICENSE_CACHE_FILE)) {
            return fs.readFileSync(LICENSE_CACHE_FILE, 'utf-8');
        }
    } catch (e) {}
    
    try {
        if (fs.existsSync(APP_DIR_CACHE_FILE)) {
            return fs.readFileSync(APP_DIR_CACHE_FILE, 'utf-8');
        }
    } catch (e) {}
    
    return null;
});

ipcMain.handle('is-in-program-files', () => {
    return process.execPath.toLowerCase().includes('c:\\program files');
});

ipcMain.handle('install-elevated-license', async (event, encryptedData) => {
    return new Promise((resolve) => {
        // Prepare PowerShell command to write the file with Admin privileges
        // We use -Verb RunAs to trigger the UAC prompt
        const psCommand = `Start-Process powershell -ArgumentList "-Command \\"Set-Content -Path '${APP_DIR_CACHE_FILE}' -Value '${encryptedData}' -Force; (Get-Item '${APP_DIR_CACHE_FILE}').Attributes = 'Hidden,System,ReadOnly'\\"" -Verb RunAs -Wait`;
        
        exec(psCommand, (err) => {
            if (err) {
                console.error("Elevated Write Error:", err);
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
});

function createWindow() {
    const iconPath = path.join(__dirname, 'assets', 'icon.ico');
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: nativeImage.createFromPath(iconPath),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.resolve(__dirname, 'preload.js'),
            sandbox: false
        }
    });

    win.maximize();
    win.loadFile('index.html');

    // Open external links in default browser
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    Menu.setApplicationMenu(null);
}

// --- نظام تعريف الجهاز المتطور (Pinned Identity System V3) ---
ipcMain.handle('get-hwid', async () => {
    const crypto = require('crypto');
    const { execSync } = require('child_process');
    
    // مسارات التخزين البديلة لضمان الثبات
    const ID_CACHE_FILE = path.join(DATA_DIR, '.sys_id_pinner.dat');
    
    const getStoredID = () => {
        // 1. محاولة القراءة من الملف المخفي (AppData) - هذا الأكثر دقة لاستعادة المعرف القديم
        try {
            if (fs.existsSync(ID_CACHE_FILE)) {
                const content = fs.readFileSync(ID_CACHE_FILE, 'utf-8').trim();
                if (content.length > 10) return content;
            }
        } catch (e) {}

        // 2. محاولة القراءة من السجل (Registry)
        try {
            const out = execSync('reg query HKCU\\Software\\MasterMarks /v PermanentID', { timeout: 2000, stdio: ['pipe', 'pipe', 'ignore'] }).toString();
            const match = out.match(/PermanentID\s+REG_SZ\s+(.+)/);
            if (match && match[1].trim()) return match[1].trim();
        } catch (e) {}
        
        return null;
    };

    const saveID = (id) => {
        // حفظ في السجل
        try { execSync(`reg add HKCU\\Software\\MasterMarks /v PermanentID /t REG_SZ /d "${id}" /f`, { timeout: 2000, stdio: 'ignore' }); } catch (e) {}
        // حفظ في ملف مخفي
        try { 
            fs.writeFileSync(ID_CACHE_FILE, id, 'utf-8');
            if (process.platform === 'win32') execSync(`attrib +h "${ID_CACHE_FILE}"`, { stdio: 'ignore' });
        } catch (e) {}
    };

    // 1. إذا كان هناك معرف محفوظ سابقاً، استخدمه فوراً ولا تعد الحساب أبداً
    const existingID = getStoredID();
    if (existingID) return existingID;

    // 2. إذا لم يوجد (أول تشغيل)، قم ببنائه من أكثر القيم ثباتاً في ويندوز
    let components = [];
    
    try {
        // MachineGuid (ثابت جداً في نظام التشغيل)
        const guidOut = execSync('reg query HKLM\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid', { timeout: 3000 }).toString();
        const guidMatch = guidOut.match(/MachineGuid\s+REG_SZ\s+(.+)/);
        if (guidMatch) components.push(guidMatch[1].trim());
    } catch (e) { components.push('G-FALLBACK'); }

    try {
        // Volume Serial Number لقرص النظام (لا يتغير إلا بفرمتة القرص)
        const volOut = execSync('vol c:', { timeout: 2000 }).toString();
        const volMatch = volOut.match(/Number is\s+(.+)/i);
        if (volMatch) components.push(volMatch[1].trim());
    } catch (e) { components.push('V-FALLBACK'); }

    // إضافة بصمة المعالج كعنصر إضافي
    try {
        const cpuOut = execSync('wmic cpu get processorid', { timeout: 2000 }).toString();
        const cpuLines = cpuOut.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (cpuLines.length > 1) components.push(cpuLines[1]);
    } catch (e) {}

    const rawId = components.join('|').toUpperCase().replace(/[^A-Z0-9|]/g, '');
    const hash = crypto.createHash('sha256').update(rawId).digest('hex');
    
    // تحويل الـ Hash إلى التنسيق المطلوب (15 رقم)
    let digits = '';
    for (let i = 0; i < hash.length && digits.length < 15; i++) {
        const char = hash[i];
        if (/[0-9]/.test(char)) digits += char;
        else digits += char.charCodeAt(0).toString().slice(-1);
    }
    while (digits.length < 15) digits += (digits.length % 10).toString();

    const groups = [];
    const prefix = "TLILI";
    for (let i = 0; i < 5; i++) {
        groups.push(prefix[i] + digits.substring(i * 3, i * 3 + 3));
    }
    const finalHWID = groups.join(' - ');

    // 3. تثبيت المعرف للأبد
    saveID(finalHWID);

    return finalHWID;
});

// حفظ ملف Excel عبر نافذة الحفظ الأصلية
const { dialog } = require('electron');

ipcMain.handle('save-file', async (event, options) => {
    const { defaultPath, buffer, filters } = options;
    const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: defaultPath || 'export.xlsx',
        filters: filters || [{ name: 'All Files', extensions: ['*'] }]
    });

    if (canceled || !filePath) return false;

    try {
        const uint8 = Buffer.from(buffer);
        fs.writeFileSync(filePath, uint8);
        return true;
    } catch (err) {
        console.error('save-file error:', err);
        return false;
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
