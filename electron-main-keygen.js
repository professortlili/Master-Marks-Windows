const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Set unique app name for Control Panel to separate its AppData
if (process.platform === 'win32') {
    app.setAppUserModelId('com.master.marks.controlpanel');
}
app.setName('MasterMarks-ControlPanel');
const DATA_DIR = process.env.PORTABLE_EXECUTABLE_DIR || path.join(app.getPath('appData'), 'MasterMarks-ControlPanel');
app.setPath('userData', DATA_DIR);

const DB_PATH = path.join(DATA_DIR, 'keygendata.json');

// Ensure the dedicated data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function ensureDb() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ archive: [], deviceNames: {} }, null, 2));
    }
}

ipcMain.handle('save-app-state', async (event, state) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2));
        return { success: true };
    } catch (error) {
        console.error('Failed to save Keygen state:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-app-state', async () => {
    try {
        ensureDb();
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load Keygen state:', error);
        return null;
    }
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, 'assets/icon1.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.resolve(__dirname, 'preload.js'),
            sandbox: false
        }
    });

    win.loadFile('keygen.html');

    // Open external links in default browser
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    Menu.setApplicationMenu(null);
}

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
