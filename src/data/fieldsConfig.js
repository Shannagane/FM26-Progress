// Champs "identité / infos" attendus dans le CSV, avec alias d'en-têtes tolérés.
export const IDENTITY_FIELDS = [
  { key: 'nom', label: 'Nom', aliases: ['Nom', 'Nom complet', 'Name', 'Joueur'], required: true },
  { key: 'numero', label: 'N°', aliases: ['N°', 'No', 'Numero', 'Numéro', '#'] },
  { key: 'poste', label: 'Meilleur poste', aliases: ['M. Poste', 'M.Poste', 'Meilleur poste', 'Meilleur Poste'], required: true },
  { key: 'club', label: 'Club', aliases: ['Club', 'Équipe', 'Equipe', 'Team', 'Club actuel'] },
  { key: 'nation', label: 'Nation', aliases: ['Nation', 'Nationalité', 'Nationalite', 'Nationality', 'Pays', 'Country'] },
  { key: 'nation2', label: '2ème nation', aliases: ['2ème nat', '2eme nat', '2ème Nat', '2ème nationalité', '2eme nationalite', 'Seconde nationalité', 'Second Nationality', '2nd Nationality'] },
  { key: 'valeur_transfert', label: 'Montant transfert', aliases: ['Valeur de transfert', 'Valeur transfert', 'Montant transfert', 'Valeur marchande', 'Transfer Value', 'Value'] },
  { key: 'age', label: 'Age', aliases: ['Age', 'Âge'] },
  { key: 'taille', label: 'Taille', aliases: ['Taille', 'Height'] },
  { key: 'pied_gauche', label: 'Pied gauche', aliases: ['Pied gauche', 'Left Foot'] },
  { key: 'pied_droit', label: 'Pied droit', aliases: ['Pied droit', 'Right Foot'] },
  { key: 'matchs_joues', label: 'Matchs Disputés', aliases: ['Matchs disputés', 'Matchs Disputés', 'Matchs joues', 'MJ', 'Apps'] },
  { key: 'passes_decisives', label: 'Passe décisives', aliases: ['Passe Décisive', 'Passe décisives', 'Passes décisives', 'Passes decisives', 'Pd', 'Assists'] },
  { key: 'buts', label: 'Buts', aliases: ['Buts', 'But', 'Gls', 'Goals'] },
  { key: 'xg', label: 'xG', aliases: ['xG'] },
  { key: 'passes_attendues', label: 'Passe décisives Attendus', aliases: ['PdA'] },
  { key: 'temps_de_jeu', label: 'Temps de jeu', aliases: ['Minutes'] },
  { key: 'homme_du_match', label: 'Homme du match', aliases: ['HdM Joueur du match'] },
  { key: 'note_moyenne', label: 'Note moyenne en club', aliases: ['Note moyenne en club', 'Moy', 'Avg Rat', 'Average Rating'] },
  { key: 'buts_encaisses', label: 'Buts encaissés', aliases: ['Buts encaissés'] },
  { key: 'cages_inviolees', label: 'Cage inviolée', aliases: ['Cage(s) inviolée(s)'] },
  { key: 'personnalite', label: 'Personnalité', aliases: ['Personnalité', 'Personnalite', 'Personality'] },
  { key: 'rapports_media', label: 'Rapports média', aliases: ['Rapports avec les médias', 'Rapports media', 'Rapports médias', 'Media Handling'] },
  { key: 'projet_court_terme', label: 'Projet à court terme', aliases: ['Projets à court terme', 'Projet a court terme', 'Short Term'] },
  { key: 'projet_long_terme', label: 'Projet à long terme', aliases: ['Projets à long terme', 'Projet a long terme', 'Long Term'] },
  { key: 'photo', label: 'Photo', aliases: ['Photo', 'Image', 'Photo URL'] },
  { key: 'date_debut_contrat', label: 'Date commencement contrat', aliases: ['Date commencement contrat', 'Date de commencement du contrat', 'Début de contrat', 'Debut de contrat', 'Date début contrat', 'Contract Start', 'Contract Start Date'] }
];

// Niveaux de pied considérés faibles / très forts pour la coloration
export const FOOT_WEAK_VALUES = ['faible', 'très faible', 'tres faible'];
export const FOOT_STRONG_VALUES = ['très fort', 'tres fort'];

export function footColorClass(value) {
  const v = (value || '').trim().toLowerCase();
  if (FOOT_WEAK_VALUES.includes(v)) return 'foot-weak';
  if (FOOT_STRONG_VALUES.includes(v)) return 'foot-strong';
  return '';
}
