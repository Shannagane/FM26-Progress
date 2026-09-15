import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host: true permet d'ouvrir l'appli depuis un téléphone sur le même réseau Wi-Fi
// (npm run dev affichera une adresse du type http://192.168.x.x:5173)
export default defineConfig({
  plugins: [react()],
  // base: './' est indispensable pour la version .exe (Electron) : sans ça, les
  // fichiers JS/CSS sont référencés avec un chemin absolu ("/assets/...") qui ne
  // fonctionne pas quand la page est chargée via file:// (écran blanc au démarrage).
  base: './',
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  }
});
