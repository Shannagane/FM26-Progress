import TutoStep from './TutoStep.jsx';
import './TutoImportPage.css';

export default function TutoFacepackPage() {
  return (
    <div className="tuto-page">

      <div className="tuto-columns">
        <section className="tuto-section">
          <h2>Récupérer Facepacks</h2>
          <div className="tuto-steps">

            <TutoStep number="1" title="Téléchargez Cut-Out Player Faces Megapack">
              <p>
                Rendez-vous sur{' '}
                <a href="https://sortitoutsi.net/graphics/style/1/cut-out-player-faces" target="_blank" rel="noreferrer">
                  sortitoutsi.net/graphics/style/1/cut-out-player-faces
                </a>
              </p>
              <p>
                Cliquez sur <strong>Download Complete Pack 2026.09</strong> pour récupérer{' '}
                <code>sortitoutsi_cutout_megapack_2026.09.rar</code>.
              </p>
            </TutoStep>

            <TutoStep number="2" title="Ouvrir l'archive">
              <p>
                Ouvre le fichier téléchargé <code>sortitoutsi_cutout_megapack_2026.09.rar</code>{' '}
                avec WinRAR ou 7-Zip (gratuit).
              </p>
              <p>Entre dans le dossier <code>sortitoutsi_cutout_megapack_2026.09</code>.</p>
            </TutoStep>

            <TutoStep number="3" title="Copie de fichiers">
              <p>
                Sélectionne tout le contenu du dossier et dépose-le directement dans le dossier
                du jeu <code>Documents\Sports Interactive\Football Manager 26\graphics\</code>.
              </p>
            </TutoStep>
          </div>
        </section>

        <section className="tuto-section">
          <h2>Importer les Facepacks sur l'application</h2>
          <div className="tuto-steps">

            <TutoStep number="1" title="Accéder à son effectif">
              <p>Clique sur le menu <strong>Effectif</strong>.</p>
              <p>Choisis ton club et son import.</p>
            </TutoStep>

            <TutoStep number="2" title="Ajouter les facepacks">
              <p>
                Une fois la liste de ton effectif apparue, clique sur le bouton{' '}
                <strong>Importer facepack</strong>.
              </p>
              <p>
                Choisis le dossier où tu as extrait tes fichiers :{' '}
                <code>Documents\Sports Interactive\Football Manager 26\graphics\</code>.
              </p>
            </TutoStep>

            <TutoStep number="3" title="Validation">
              <p>
                Valide, et les joueurs disposant d'une photo correspondante devraient
                maintenant apparaître avec celle-ci dans le tableau.
              </p>
            </TutoStep>
          </div>
        </section>
      </div>
    </div>
  );
}
