import { useEffect, useRef, useState } from 'react';
import { parseCsvFile } from '../../utils/csvParser.js';
import { useAppData } from '../../context/AppContext.jsx';
import { saveClubLogo } from '../../utils/clubLogos.js';
import './CsvImporter.css';

const MAX_LOGO_SIZE = 1024 * 1024; // 1 Mo, pour ne pas gonfler démesurément le localStorage

export default function CsvImporter() {
  const { importPlayers } = useAppData();
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error'|'warning', message }
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvName, setCsvName] = useState('');
  const [gameDate, setGameDate] = useState('');
  const [touched, setTouched] = useState(false);
  const [importing, setImporting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError] = useState(null);
  const logoInputRef = useRef(null);

  const modalOpen = !!selectedFile;

  useEffect(() => {
    if (!modalOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') cancelSelection();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  function pickFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setStatus({ type: 'error', message: "Ce fichier n'est pas un .csv." });
      return;
    }
    setSelectedFile(file);
    setCsvName('');
    setGameDate('');
    setTouched(false);
    setStatus(null);
    resetLogoSelection();
  }

  function cancelSelection() {
    setSelectedFile(null);
    setCsvName('');
    setGameDate('');
    setTouched(false);
    if (inputRef.current) inputRef.current.value = '';
    resetLogoSelection();
  }

  function resetLogoSelection() {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  }

  function handleLogoSelect(file) {
    setLogoError(null);
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setLogoError("Ce fichier n'est pas une image.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setLogoError('Image trop lourde (1 Mo maximum).');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleConfirmImport() {
    setTouched(true);
    if (!csvName.trim() || !gameDate) return; // les champs restent affichés en erreur

    setImporting(true);
    try {
      const { players, unmatchedHeaders, missingRequired } = await parseCsvFile(selectedFile);

      if (missingRequired.length > 0) {
        setStatus({
          type: 'error',
          message: `Colonnes obligatoires introuvables dans le CSV : ${missingRequired.join(', ')}.`
        });
        setImporting(false);
        return;
      }
      if (players.length === 0) {
        setStatus({ type: 'error', message: 'Aucun joueur trouvé dans ce fichier.' });
        setImporting(false);
        return;
      }

      importPlayers(players, new Date(gameDate).toISOString(), csvName.trim());
      if (logoPreview) saveClubLogo(csvName.trim(), logoPreview);

      const warning = unmatchedHeaders.length > 0
        ? ` (${unmatchedHeaders.length} colonne(s) non reconnue(s) et ignorée(s) : ${unmatchedHeaders.slice(0, 6).join(', ')}${unmatchedHeaders.length > 6 ? '…' : ''})`
        : '';

      setStatus({
        type: unmatchedHeaders.length > 0 ? 'warning' : 'success',
        message: `« ${csvName.trim()} » importé avec succès : ${players.length} joueur(s).${warning}`
      });
      cancelSelection();
    } catch (err) {
      setStatus({ type: 'error', message: `Erreur lors de la lecture du fichier : ${err.message}` });
    } finally {
      setImporting(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragActive(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  const nameInvalid = touched && !csvName.trim();
  const dateInvalid = touched && !gameDate;

  return (
    <div className="csv-importer">
      {!selectedFile && (
        <div
          className={`csv-dropzone ${dragActive ? 'csv-dropzone-active' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.click(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="csv-dropzone-icon">
            <path d="M12 3v12m0 0-4-4m4 4 4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          <p className="csv-dropzone-title">Glisse ton export CSV FM26 ici</p>
          <p className="csv-dropzone-subtitle">ou clique pour parcourir tes fichiers</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={e => pickFile(e.target.files?.[0])}
      />

      {modalOpen && (
        <div
          className="csv-modal-overlay"
          onMouseDown={e => { if (e.target === e.currentTarget) cancelSelection(); }}
        >
          <div className="csv-confirm" role="dialog" aria-modal="true" aria-label="Informations de l'import">
            <div className="csv-confirm-file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M14 3v5h5" />
                <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
              </svg>
              <span>{selectedFile.name}</span>
              <button type="button" className="csv-confirm-cancel" onClick={cancelSelection}>Changer de fichier</button>
            </div>

            <p className="csv-confirm-hint">
              Indique le Nom du club, la Date en jeu et le logo club de cet export avant de terminer l'import.
            </p>
            <p className="csv-confirm-hint">
              Donne le même Nom de club quand tu importe différents CSV pour le même club.
            </p>

            <div className="csv-importer-row">
              <label className="csv-field">
                <span>Nom du club *</span>
                <input
                  type="text"
                  placeholder="ex : Arsenal"
                  value={csvName}
                  onChange={e => setCsvName(e.target.value)}
                  className={nameInvalid ? 'csv-field-invalid' : ''}
                  autoFocus
                />
                {nameInvalid && <span className="csv-field-error">Ce champ est obligatoire.</span>}
              </label>
              <label className="csv-field">
                <span>Date en jeu (FM26) *</span>
                <input
                  type="date"
                  value={gameDate}
                  onChange={e => setGameDate(e.target.value)}
                  className={dateInvalid ? 'csv-field-invalid' : ''}
                />
                {dateInvalid && <span className="csv-field-error">Ce champ est obligatoire.</span>}
              </label>
            </div>

            <label className="csv-field csv-logo-field">
              <span>Importer logo club</span>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={e => handleLogoSelect(e.target.files?.[0])}
              />
              {logoError && <span className="csv-field-error">{logoError}</span>}
            </label>

            {logoPreview && (
              <div className="csv-logo-preview-row">
                <img src={logoPreview} alt="Aperçu du logo" className="csv-logo-preview" />
                <span>{logoFile?.name}</span>
              </div>
            )}

            <div className="csv-confirm-actions">
              <button type="button" className="csv-confirm-secondary" onClick={cancelSelection}>Annuler</button>
              <button type="button" className="csv-confirm-btn" onClick={handleConfirmImport} disabled={importing}>
                {importing ? 'Import en cours…' : "Valider l'import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {status && (
        <div className={`csv-status csv-status-${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}
