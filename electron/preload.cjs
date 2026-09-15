const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  // relativePath : chemin du fichier à l'intérieur du dossier dist/ (embarqué dans l'appli)
  saveBundledFile: (relativePath, suggestedName) =>
    ipcRenderer.invoke('save-bundled-file', relativePath, suggestedName)
});
