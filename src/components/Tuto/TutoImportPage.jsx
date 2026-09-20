import TutoStep from './TutoStep.jsx';
import ViewDownloadCard from './ViewDownloadCard.jsx';
import './TutoImportPage.css';

export default function TutoImportPage() {
  return (
    <div className="tuto-page">

      <ViewDownloadCard />

      <div className="tuto-columns">
        <section className="tuto-section">
          <h2>Installer FM26 Player Export</h2>
          <div className="tuto-steps">

            <TutoStep number="1" title="Téléchargez FM26 Player Export">
              <p>
                Rendez-vous sur{' '}
                <a href="https://www.fmscout.com/a-fm26-player-csv-export.html" target="_blank" rel="noreferrer">
                  fmscout.com/a-fm26-player-csv-export.html
                </a>
              </p>
              <p>
                Cliquez sur <strong>Download Now</strong> pour récupérer <code>FM26PlayerExport v5.1.rar</code>.
              </p>
            </TutoStep>

            <TutoStep number="2" title="Ouvrir l'archive">
              <p>
                Ouvre le fichier téléchargé <code>FM26PlayerExport v5.1.rar</code> avec WinRAR ou 7-Zip (gratuit).
              </p>
              <p>Entre dans le dossier <code>FM26PlayerExport v5.1</code>.</p>
            </TutoStep>

            <TutoStep number="3" title="Copie de fichiers">
              <p>
                Sélectionne tout le contenu du dossier et dépose-le directement dans le dossier du jeu <code>C:\Program Files (x86)\Steam\steamapps\common\Football Manager 26</code>.
              </p>
            </TutoStep>

            <TutoStep number="4" title="Lancer le jeu">
              <p>
                Lancer le jeu, une fenêtre de commande s'ouvre c'est l'outil qui se lance pas de soucis.
              </p>
              <p>Le jeu se lance ensuite normalement.</p>
            </TutoStep>
          </div>
        </section>

        <section className="tuto-section">
          <h2>Utiliser FM26 Player Export</h2>
          <div className="tuto-steps">
            <TutoStep number="1" title="Importer la vue personnalisée dans FM26">
              <p>
                Télécharge la vue ci-dessus, puis dans FM26 ouvre l'écran <strong>Effectif</strong>{' '}
                (ou <strong>Recrutement → Recherche de joueurs</strong>), clique sur le menu des vues
                (en haut du tableau) puis <strong>Importation de l'affichage</strong> et sélectionne
                le fichier <code>.fmf</code> téléchargé.
              </p>
              <p>Toutes les colonnes utiles à l'application apparaissent alors dans le tableau — seules les colonnes visibles seront exportées.</p>
            </TutoStep>

            <TutoStep number="2" title="Lancez l'export">
              <p>
                Avec la vue importée active, appuyez sur <code>Ctrl+P</code> (ou <code>F9</code>,
                les deux font la même chose) pour démarrer l'export.
              </p>
              <p>
                Le tableau défile automatiquement pour capturer tous les joueurs : ne touchez pas
                la souris pendant le défilement, sous peine de sauter des lignes.
              </p>
              <p>
                Si vous changez d'écran entre deux exports (Effectif → Recherche de joueurs par
                exemple), appuyez sur <code>F8</code> pour que le plugin rescanne l'interface avant
                de relancer <code>Ctrl+P</code>. Une confirmation s'affiche dans la console BepInEx
                une fois l'export terminé.
              </p>
            </TutoStep>

            <TutoStep number="3" title="Retrouvez le fichier CSV généré">
              <p>Le fichier est déposé dans tes documents :</p>
              <p><code>Documents\Sports Interactive\Football Manager 26\FM26PlayerExport by vinteset</code></p>
              <p>
                Nommé par exemple <code>player_export_20260310_235900.csv</code>.
              </p>
            </TutoStep>

            <TutoStep number="4" title="Importer le CSV dans l'application">
              <p>
                Retourne sur le <strong>Tableau de bord</strong> de cette application et
                glisse-dépose ce fichier CSV dans la zone d'import.
              </p>
              <p>C'est tout : tes joueurs apparaissent désormais dans le menu Effectif.</p>
            </TutoStep>
          </div>
        </section>
      </div>
    </div>
  );
}
