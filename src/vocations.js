// Mapeamento id -> nome (vocations.xml do servidor). Ajuste se mudar as vocações.
export const VOCATIONS = {
  0: 'No vocation',
  1: 'Sorcerer',
  2: 'Druid',
  3: 'Paladin',
  4: 'Knight',
  5: 'Master Sorcerer',
  6: 'Elder Druid',
  7: 'Royal Paladin',
  8: 'Elite Knight',
}

// Vocações escolhíveis na criação (precisa bater com 'allowed_vocations' do backend).
// Este servidor começa todo personagem como No vocation (Rook), então só [0].
export const CREATABLE_VOCATIONS = [0]

export const vocationName = (id) => VOCATIONS[id] || `Voc ${id}`
