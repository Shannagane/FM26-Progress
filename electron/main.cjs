const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0A0E1A',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'build-resources', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Ouvre les liens externes (http/https) dans le navigateur par défaut, pas dans l'appli
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  win.loadFile(indexPath);

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  return win;
}

// Les liens <a download> ne fonctionnent pas de façon fiable sur des fichiers
// chargés en file:// (cas d'une appli Electron). On propose donc une vraie
// boîte de dialogue "Enregistrer sous" côté processus principal, qui copie le
// fichier demandé (situé dans dist/, embarqué dans l'appli) vers l'endroit
// choisi par l'utilisateur.
ipcMain.handle('save-bundled-file', async (event, relativePath, suggestedName) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const sourcePath = path.join(__dirname, '..', 'dist', relativePath);

  if (!fs.existsSync(sourcePath)) {
    return { success: false, error: 'Fichier introuvable dans l\'application.' };
  }

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Enregistrer le fichier',
    defaultPath: suggestedName || path.basename(sourcePath)
  });

  if (canceled || !filePath) {
    return { success: false, canceled: true };
  }

  try {
    fs.copyFileSync(sourcePath, filePath);
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
