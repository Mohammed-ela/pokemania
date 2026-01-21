// Couleurs des types Pokémon - Utilitaire partagé
export const TYPE_COLORS: Record<string, string> = {
  Normal: '#A8A878',
  Feu: '#F08030',
  Eau: '#6890F0',
  Électrik: '#F8D030',
  Plante: '#78C850',
  Glace: '#98D8D8',
  Combat: '#C03028',
  Poison: '#A040A0',
  Sol: '#E0C068',
  Vol: '#A890F0',
  Psy: '#F85888',
  Insecte: '#A8B820',
  Roche: '#B8A038',
  Spectre: '#705898',
  Dragon: '#7038F8',
  Ténèbres: '#705848',
  Acier: '#B8B8D0',
  Fée: '#EE99AC',
};

export const getTypeColor = (type: string): string => {
  return TYPE_COLORS[type] || '#68A090';
};
