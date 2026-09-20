const { app, BrowserWindow, Menu, shell, ipcMain, dialog, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const isDev = !app.isPackaged;

// Dossier "facepack" (photos des joueurs) choisi par l'utilisateur : vit en mémoire côté
// process principal pour la session en cours. Le renderer est seul à le persister
// (localStorage, comme le reste des données de l'appli) et le retransmet via
// set-facepack-folder à chaque démarrage — voir src/utils/facepack.js.
let facepackFolder = null;

// Doit être appelé avant app.whenReady() : déclare le schéma comme "standard" (URLs avec
// host/pathname classiques) pour pouvoir servir des images via <img src="facepack://...">.
protocol.registerSchemesAsPrivileged([
  { scheme: 'facepack', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

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

// Choix du dossier facepack (bouton "Importer facepack" de la page Effectif). On ne copie
// jamais les fichiers (le dossier peut faire plusieurs Go) : on retient juste son chemin et
// on sert les photos à la demande via le protocole facepack:// ci-dessous.
ipcMain.handle('select-facepack-folder', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Choisir le dossier des photos (facepack)',
    properties: ['openDirectory']
  });

  if (canceled || filePaths.length === 0) return { canceled: true };

  facepackFolder = filePaths[0];
  return { canceled: false, folderPath: facepackFolder };
});

// Reconnecte le dossier retenu au démarrage (le process principal ne persiste rien
// lui-même entre deux lancements de l'appli).
ipcMain.handle('set-facepack-folder', (event, folderPath) => {
  facepackFolder = folderPath && fs.existsSync(folderPath) ? folderPath : null;
  return { ok: !!facepackFolder };
});

Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  // facepack://photos/<nom-fichier>.png -> <facepackFolder>/<nom-fichier>.png (le nom de
  // fichier attendu est l'"Unique ID" FM26 du joueur). Le nom de fichier est le seul segment
  // utile de l'URL ; on rejette tout ce qui ressemble à une tentative de sortir du dossier.
  protocol.handle('facepack', (request) => {
    if (!facepackFolder) return new Response('Facepack folder not configured', { status: 404 });

    const url = new URL(request.url);
    const filename = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return new Response('Invalid file name', { status: 400 });
    }

    const filePath = path.join(facepackFolder, filename);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return new Response('Not found', { status: 404 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
