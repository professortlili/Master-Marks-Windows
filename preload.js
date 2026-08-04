const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getHWID: () => ipcRenderer.invoke('get-hwid'),
    saveAppState: (state) => ipcRenderer.invoke('save-app-state', state),
    loadAppState: () => ipcRenderer.invoke('load-app-state'),
    toggleFullScreen: () => ipcRenderer.invoke('toggle-fullscreen'),
    saveFile: (options) => ipcRenderer.invoke('save-file', options),
    closeApp: () => ipcRenderer.invoke('close-app'),
    getRegistryValue: (keyName) => ipcRenderer.invoke('registry-get', keyName),
    setRegistryValue: (keyName, value) => ipcRenderer.invoke('registry-set', keyName, value),
    getHiddenValue: (keyName) => ipcRenderer.invoke('hidden-reg-get', keyName),
    setHiddenValue: (keyName, value) => ipcRenderer.invoke('hidden-reg-set', keyName, value),
    saveLicenseCache: (data) => ipcRenderer.invoke('save-license-cache', data),
    loadLicenseCache: () => ipcRenderer.invoke('load-license-cache'),
    isInProgramFiles: () => ipcRenderer.invoke('is-in-program-files'),
    installElevatedLicense: (data) => ipcRenderer.invoke('install-elevated-license', data)
});
