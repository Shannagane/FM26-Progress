import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
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
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedImportId, setSelectedImportId] = useState('');
  const [squad, setSquad] = useState('all');

  const clubs = useMemo(() => {
    const set = new Set(snapshots.map(s => (s.csvName || '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [snapshots]);

  const importsByClub = useMemo(() => {
    const map = new Map();
    snapshots.forEach(snap => {
      const club = (snap.csvName || '').trim();
      if (!club) return;
      const list = map.get(club) || [];
      list.push(snap);
      map.set(club, list);
    });
    map.forEach(list => list.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate)));
    return map;
  }, [snapshots]);

  const clubImports = importsByClub.get(selectedClub) || [];
  const hasImports = clubs.length > 0;

  useEffect(() => {
    if (!modalOpen) return;
    function onKeyDown(e) { if (e.key === 'Escape') setModalOpen(false); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  function openModal() {
    const firstClub = clubs[0] || '';
    setSelectedClub(firstClub);
    setSelectedImportId(importsByClub.get(firstClub)?.[0]?.id || '');
    setSquad('all');
    setModalOpen(true);
  }

  function handleClubChange(club) {
    setSelectedClub(club);
    setSelectedImportId(importsByClub.get(club)?.[0]?.id || '');
  }

  function handleConfirm() {
    if (!selectedImportId) return;
    navigate(`/newgens/${selectedImportId}?squad=${squad}`);
    setModalOpen(false);
  }

  return (
    <div className="newgens-page">
      <div className="newgens-explain-card">
        <div className="newgens-explain-header">
          <span className="newgens-explain-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.9L12 3Z" />
              <path d="M19 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" />
            </svg>
          </span>
          <h3>Le Labo des Postes FM24</h3>
        </div>
        <p>Le Labo analyse automatiquement les attributs de vos joueurs importés pour révéler leur poste idéal.</p>
      </div>

      <button type="button" className="newgens-open-modal-btn" onClick={openModal}>
        Choisir un effectif
      </button>

      {modalOpen && (
        <div
          className="newgens-modal-overlay"
          onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="newgens-modal" role="dialog" aria-modal="true" aria-label="Choisir un effectif">
            <div className="newgens-modal-header">
              <h3>Choisir un effectif</h3>
              <button type="button" className="newgens-modal-close" onClick={() => setModalOpen(false)} aria-label="Fermer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {hasImports ? (
              <>
                <label className="newgens-club-select">
                  <span>Choix du club</span>
                  <select value={selectedClub} onChange={e => handleClubChange(e.target.value)}>
                    {clubs.map(club => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </select>
                </label>

                <label className="newgens-import-select">
                  <span>Choix de l'effectif</span>
                  <select value={selectedImportId} onChange={e => setSelectedImportId(e.target.value)}>
                    {clubImports.length === 0 && <option value="">Aucun import pour ce club</option>}
                    {clubImports.map(snap => (
                      <option key={snap.id} value={snap.id}>
                        {formatDate(snap.gameDate)} ({Object.keys(snap.players).length} joueur(s))
                      </option>
                    ))}
                  </select>
                </label>

                <label className="newgens-method-select">
                  <span>Joueurs à analyser</span>
                  <select value={squad} onChange={e => setSquad(e.target.value)}>
                    <option value="all">Effectif complet</option>
                    <option value="newgens">Newgens</option>
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
