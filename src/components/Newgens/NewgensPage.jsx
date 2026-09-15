import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { NEWGENS_METHODS } from '../../data/newgensPositionProfiles.js';
import './NewgensPage.css';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function NewgensPage() {
  const { snapshots } = useAppData();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState('');
  const [method, setMethod] = useState('polynomial');
  const [squad, setSquad] = useState('all');

  const importsOrdered = useMemo(() => (
    [...snapshots].sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate))
  ), [snapshots]);

  const hasImports = importsOrdered.length > 0;

  useEffect(() => {
    if (!modalOpen) return;
    function onKeyDown(e) { if (e.key === 'Escape') setModalOpen(false); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  function openModal() {
    setSelectedImportId('');
    setSquad('all');
    setModalOpen(true);
  }

  function handleConfirm() {
    if (!selectedImportId) return;
    navigate(`/newgens/${selectedImportId}?method=${method}&squad=${squad}`);
    setModalOpen(false);
  }

  return (
    <div className="newgens-page">
      <p className="newgens-intro">
        Le Labo des Postes analyse automatiquement les attributs de tes joueurs importés pour
        t'indiquer leur poste idéal — sur l'effectif complet, ou filtré sur tes Newgens.
      </p>

      <button type="button" className="newgens-open-modal-btn" onClick={openModal}>
        Choisir une méthode et un effectif
      </button>

      {modalOpen && (
        <div
          className="newgens-modal-overlay"
          onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="newgens-modal" role="dialog" aria-modal="true" aria-label="Choisir une méthode et un effectif">
            <div className="newgens-modal-header">
              <h3>Choisir une méthode et un effectif</h3>
              <button type="button" className="newgens-modal-close" onClick={() => setModalOpen(false)} aria-label="Fermer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <label className="newgens-method-select">
              <span>Méthode de calcul</span>
              <select value={method} onChange={e => setMethod(e.target.value)}>
                {NEWGENS_METHODS.map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </label>

            {hasImports ? (
              <>
                <label className="newgens-import-select">
                  <span>Effectif / Import</span>
                  <select value={selectedImportId} onChange={e => setSelectedImportId(e.target.value)}>
                    <option value="">Sélectionner un import…</option>
                    {importsOrdered.map(snap => (
                      <option key={snap.id} value={snap.id}>
                        {snap.csvName || 'Import'} — {formatDate(snap.gameDate)} ({Object.keys(snap.players).length} joueur(s))
                      </option>
                    ))}
                  </select>
                </label>

                <label className="newgens-method-select">
                  <span>Joueurs à analyser</span>
                  <select value={squad} onChange={e => setSquad(e.target.value)}>
                    <option value="all">Effectif complet (tous les joueurs de l'import)</option>
                    <option value="newgens">Newgens (contrat débutant à ± 1 jour de la date en jeu)</option>
                  </select>
                </label>
              </>
            ) : (
              <p className="newgens-explain-hint">
                Aucun import pour le moment. Rends-toi sur le{' '}
                <Link to="/" onClick={() => setModalOpen(false)}>tableau de bord</Link> pour importer ton
                effectif.
              </p>
            )}

            <div className="newgens-modal-actions">
              <button type="button" className="newgens-modal-secondary" onClick={() => setModalOpen(false)}>
                Annuler
              </button>
              <button
                type="button"
                className="newgens-modal-confirm"
                onClick={handleConfirm}
                disabled={!selectedImportId}
              >
                Voir les résultats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
