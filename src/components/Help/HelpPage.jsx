import React from 'react';
import HelpStep from './HelpStep.jsx';
import ViewDownloadCard from './ViewDownloadCard.jsx';
import './HelpPage.css';

export default function HelpPage() {
  return (
    <div className="help-page">
      <p className="help-intro">
        FM26 ne propose plus d'export CSV natif. Pour récupérer les données de tes joueurs,
        on passe par <strong>BepInEx</strong> (le chargeur de plugins officiel pour FM26) et
        le plugin d'export <strong>FMDataExport</strong>. Voici la marche à suivre complète,
        de l'installation jusqu'à l'import dans cette application.
      </p>

      <ViewDownloadCard />

      <div className="help-columns">
        <section className="help-section">
          <h2>Installer BepInEx</h2>
          <div className="help-steps">
            <HelpStep number="1" title="Téléchargez BepInEx">
              <p>
                Rendez-vous sur{' '}
                <a href="https://new.thunderstore.io/c/football-manager-26/p/BepInEx/BepInExPack_FootballManager26/" target="_blank" rel="noreferrer">
                  new.thunderstore.io/c/football-manager-26/p/BepInEx/BepInExPack_FootballManager26
                </a>. Il s'agit de la version officielle de BepInEx pour Football Manager.
              </p>
              <p>Cliquez sur le bouton <strong>Télécharger</strong>, puis décompressez le fichier téléchargé.</p>
            </HelpStep>

            <HelpStep number="2" title="Installez BepInEx dans FM26">
              <p>Accédez au dossier d'installation de FM26.</p>
              <p>
                Astuce : sur Steam, faites un clic droit sur FM26 → <strong>Propriétés</strong> →{' '}
                <strong>Fichiers installés</strong> → <strong>Parcourir</strong>.
              </p>
              <p>Copiez/collez les fichiers décompressés dans ce dossier. Vous devriez obtenir la structure suivante :</p>
              <p>
                <code>.../Steam/steamapps/common/Football Manager 26/</code><br />
                <code>├── BepInEx/</code><br />
                <code>├── changelog.txt</code><br />
                <code>├── [...]</code><br />
                <code>├── fm.exe</code><br />
                <code>├── fm_data/</code><br />
                <code>├── [...]</code><br />
                <code>├── dotnet/</code><br />
                <code>├── libdoorstop.so</code><br />
                <code>└── run_bepinex.sh</code>
              </p>
              <p>
                <strong>Important (Linux)</strong> : ajoutez FM26 aux options de lancement Steam :
              </p>
              <p><code>WINEDLLOVERRIDES="winhttp=n,b" %command%</code></p>
              <p>(clic droit sur FM26 dans Steam → Propriétés → Options de lancement)</p>
            </HelpStep>

            <HelpStep number="3" title="Premier lancement">
              <p>
                Lancez le jeu une fois pour que BepInEx s'initialise et crée le dossier{' '}
                <code>BepInEx/plugins/</code>.
              </p>
              <p>Vérifiez que ce dossier existe bien après ce premier lancement.</p>
            </HelpStep>

            <HelpStep number="4" title="Installation du plugin FMDataExport">
              <p>
                Copiez le fichier <code>FMDataExport.dll</code> dans le dossier des plugins BepInEx :
              </p>
              <p><code>.../Steam/steamapps/common/Football Manager 26/BepInEx/plugins/</code></p>
              <p>Sous Linux/Proton, le chemin réel est :</p>
              <p>
                <code>~/.local/share/Steam/steamapps/compatdata/&lt;app_id&gt;/pfx/drive_c/users/steamuser/Documents/Sports Interactive/Football Manager 26/exports/</code>
              </p>
            </HelpStep>

            <HelpStep number="5" title="Utilisation : exporter les données (F10)">
              <p>Ouvrez n'importe quelle vue contenant un tableau dans FM26 (équipe, recherche de joueurs, classements, etc.).</p>
              <p>Configurez les colonnes souhaitées dans le jeu, puis appuyez sur <code>F10</code>.</p>
              <ul>
                <li>Pour les petites tables : exportation instantanée.</li>
                <li>Pour les grands tableaux (recherche de joueurs) : le tableau défile automatiquement, patientez jusqu'à la fin du défilement.</li>
              </ul>
              <p>Le fichier CSV est enregistré sous :</p>
              <p><code>Documents/Sports Interactive/Football Manager 26/exports/</code></p>
              <p>Sous Linux/Proton, le chemin réel est :</p>
              <p>
                <code>~/.local/share/Steam/steamapps/compatdata/&lt;app_id&gt;/pfx/drive_c/users/steamuser/Documents/Sports Interactive/Football Manager 26/exports/</code>
              </p>
            </HelpStep>

            <HelpStep number="6" title="Interface de diagnostic (F9)">
              <p>
                Appuyez sur <code>F9</code> pour exporter l'intégralité de l'arborescence de
                l'interface utilisateur vers le journal BepInEx. Utile pour le débogage et le développement.
              </p>
            </HelpStep>
          </div>
        </section>

        <section className="help-section">
          <h2>Importer la vue et exporter tes joueurs</h2>
          <div className="help-steps">
            <HelpStep number="1" title="Importer la vue personnalisée dans FM26">
              <p>
                Télécharge la vue ci-dessus, puis dans FM26 ouvre l'écran <strong>Effectif</strong>,
                clique sur le menu des vues (en haut du tableau) puis <strong>Importation de l'affichage</strong>
                {' '}et sélectionne le fichier <code>.fmf</code> téléchargé.
              </p>
              <p>Toutes les colonnes utiles à l'application apparaissent alors dans le tableau.</p>
            </HelpStep>

            <HelpStep number="2" title="Exporter le tableau en CSV">
              <p>
                Avec la vue importée active sur l'écran Effectif, lance l'export du plugin
                (appuie sur <code>F10</code>).
              </p>
              <p>
                Le plugin exporte automatiquement toutes les colonnes visibles, joueur par
                joueur, y compris s'il faut faire défiler la liste.
              </p>
            </HelpStep>

            <HelpStep number="3" title="Retrouver le fichier CSV généré">
              <p>Le fichier est déposé dans tes documents, en général :</p>
              <p><code>Documents\Sports Interactive\Football Manager 26\exports\</code></p>
            </HelpStep>

            <HelpStep number="4" title="Importer le CSV dans l'application">
              <p>
                Retourne sur le <strong>Tableau de bord</strong> de cette application et
                glisse-dépose ce fichier CSV dans la zone d'import.
              </p>
              <p>C'est tout : tes joueurs apparaissent désormais dans le menu Effectif.</p>
            </HelpStep>
          </div>
        </section>
      </div>

      <section className="help-section help-note">
        <h2>Bon à savoir</h2>
        <ul>
          <li>Le plugin n'accède pas à internet et ne modifie ni ta sauvegarde ni les fichiers du jeu.</li>
          <li>Le CSV généré peut être séparé par des points-virgules plutôt que des virgules : l'application détecte automatiquement le bon séparateur, aucune manipulation n'est nécessaire.</li>
          <li>Donne un nom clair à chaque import (ex : « Après J12 ») et renseigne la date en jeu correspondante : c'est ce qui permet à l'application de classer correctement les imports et de tracer les courbes de progression.</li>
          <li>Répète l'export après chaque série de matchs pour faire progresser les courbes de suivi.</li>
        </ul>
      </section>
    </div>
  );
}
