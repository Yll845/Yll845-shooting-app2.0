// Pikën 7: Disiplinat ndahen sipas gjinisë dhe tipit
// Pikën 14: Prioriteti i seeding: Serike → Standarde Pushkë → Standarde Pistoletë
// Shënim: "serike" dhe "standarde" aplikohen vetëm për armët ajrore

export const DISCIPLINES = [
  'Pushkë Ajrore 10m, serike',
  'Pushkë Ajrore 10m, standarde',
  'Pistoletë Ajrore 10m, standarde',
  'Pushkë e Vogël 50m',
  'Pistoletë Standarde 25m',
  'Pushkë 300m',
  'Trap',
  'Skeet',
];

// Prioriteti për seeding (sipas pikës 14.1)
export const SEEDING_PRIORITY = {
  'Pushkë Ajrore 10m, serike': 1,
  'Pushkë Ajrore 10m, standarde': 2,
  'Pushkë e Vogël 50m': 2,
  'Pushkë 300m': 2,
  'Pistoletë Ajrore 10m, standarde': 3,
  'Pistoletë Standarde 25m': 3,
  'Trap': 4,
  'Skeet': 4,
};

export const isSerike = (discipline) =>
  discipline === 'Pushkë Ajrore 10m, serike';

export const isStandardeArmë = (discipline) =>
  ['Pushkë Ajrore 10m, standarde', 'Pushkë e Vogël 50m', 'Pushkë 300m'].includes(discipline);

export const isStandardePistoletë = (discipline) =>
  ['Pistoletë Ajrore 10m, standarde', 'Pistoletë Standarde 25m'].includes(discipline);

export const GENDERS = ['Meshkuj', 'Femra'];

// Pikën 7 & 16.6: Kategorite sipas moshës me hierarki
export const AGE_CATEGORIES = ['Pionier', 'Junior', 'Senior'];
export const AGE_CATEGORY_RANK = { 'Pionier': 1, 'Junior': 2, 'Senior': 3 };

export const COMPETITION_TYPES = [
  'Kampionat Kombëtar',
  'Kupë e Kosovës',
  'Garë Miqësore',
  'Turne',
  'Kualifikuese',
  'Ndërkombëtare',
];

export const COMPETITION_STATUSES = [
  'Planifikuar',
  'Regjistrimi i hapur',
  'Në zhvillim',
  'Përfunduar',
  'Anuluar',
];

// Tranzicionet e lejuara të statusit
export const STATUS_TRANSITIONS = {
  'Planifikuar':          ['Regjistrimi i hapur', 'Anuluar'],
  'Regjistrimi i hapur':  ['Në zhvillim', 'Anuluar'],
  'Në zhvillim':          ['Përfunduar'],
  'Përfunduar':           [],
  'Anuluar':              [],
  // Backward compat për statuse të vjetra
  'Hapur':                ['Në zhvillim', 'Anuluar'],
  'Draft':                ['Regjistrimi i hapur', 'Anuluar'],
  'Mbyllur':              ['Përfunduar'],
};

export const STATUS_COLORS = {
  'Planifikuar':         'bg-gray-100 text-gray-600',
  'Regjistrimi i hapur': 'bg-green-100 text-green-800',
  'Në zhvillim':         'bg-yellow-100 text-yellow-800',
  'Përfunduar':          'bg-blue-100 text-blue-800',
  'Anuluar':             'bg-red-100 text-red-700',
  // Backward compat
  'Draft': 'bg-gray-100 text-gray-600',
  'Hapur': 'bg-green-100 text-green-800',
  'Mbyllur': 'bg-yellow-100 text-yellow-800',
};

export const OFFICIAL_ROLES = [
  'Kryesuesi i garës',
  'Referi kryesor',
  'Referi ndihmës',
  'Referi për numrim (serike)',
  'Komisioni i Ankesave - Anëtari 1',
  'Komisioni i Ankesave - Anëtari 2',
  'Komisioni i Ankesave - Anëtari 3',
];

export const REQUIRED_OFFICIAL_ROLES = [
  'Kryesuesi i garës',
  'Referi kryesor',
  'Referi ndihmës',
  'Referi për numrim (serike)',
  'Komisioni i Ankesave - Anëtari 1',
  'Komisioni i Ankesave - Anëtari 2',
  'Komisioni i Ankesave - Anëtari 3',
];

export const MAX_LANES = 10;

// Pikën 16.7: Pikët për rangimin e klubeve
export const CLUB_RANKING_POINTS = {
  participation: { serike: 1, standarde: 3 },
  position: {
    serike: { 1: 3, 2: 2, 3: 1 },
    standarde: { 1: 5, 2: 4, 3: 3 },
  },
};

// Audit log helper
export async function logAudit(base44Client, { entity_type, entity_id, action, user, details, old_value, new_value }) {
  try {
    await base44Client.entities.AuditLog.create({
      entity_type,
      entity_id,
      action,
      user_email: user?.email || '',
      user_name: user?.full_name || '',
      details,
      old_value: old_value ? JSON.stringify(old_value) : '',
      new_value: new_value ? JSON.stringify(new_value) : '',
    });
  } catch (_) {
    // audit log failure nuk duhet të pengojë operacionin kryesor
  }
}