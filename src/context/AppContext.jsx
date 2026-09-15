import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  loadSnapshots, addSnapshot, removeSnapshot, clearSnapshots as clearStoredSnapshots, getCurrentPlayers
} from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [snapshots, setSnapshots] = useState(() => loadSnapshots());
  const [lastImportInfo, setLastImportInfo] = useState(null);

  const players = useMemo(() => getCurrentPlayers(snapshots), [snapshots]);

  const importPlayers = useCallback((newPlayers, gameDate, csvName) => {
    const updated = addSnapshot(snapshots, newPlayers, gameDate, csvName);
    setSnapshots(updated);
    setLastImportInfo({ count: newPlayers.length, gameDate: gameDate || new Date().toISOString(), csvName });
  }, [snapshots]);

  const resetAll = useCallback(() => {
    clearStoredSnapshots();
    setSnapshots([]);
    setLastImportInfo(null);
  }, []);

  const deleteImport = useCallback((snapshotId) => {
    const updated = removeSnapshot(snapshots, snapshotId);
    setSnapshots(updated);
  }, [snapshots]);

  const getPlayerById = useCallback((id) => players.find(p => p.id === id) || null, [players]);

  const value = {
    snapshots,
    players,
    importPlayers,
    resetAll,
    deleteImport,
    getPlayerById,
    lastImportInfo,
    importCount: snapshots.length
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData doit être utilisé dans un AppProvider');
  return ctx;
}
