const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  // relativePath : chemin du fichier à l'intérieur du dossier dist/ (embarqué dans l'appli)
  saveBundledFile: (relativePath, suggestedName) =>
    ipcRenderer.invoke('save-bundled-file', relativePath, suggestedName),
  // Facepack (photos des joueurs) : voir src/utils/facepack.js pour l'usage côté renderer.
  selectFacepackFolder: () => ipcRenderer.invoke('select-facepack-folder'),
  setFacepackFolder: folderPath => ipcRenderer.invoke('set-facepack-folder', folderPath)
});
