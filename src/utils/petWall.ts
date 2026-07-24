// Shared helpers for the "Muro de las Huellas" voting system.
// One huella per pet per device, tracked via localStorage.

const VOTER_KEY = 'lh_voter_key';
const VOTED_KEY = 'lh_voted_pets';

// Stable per-device key so a visitor can only give one huella per pet.
export function getVoterKey(): string {
  try {
    let k = localStorage.getItem(VOTER_KEY);
    if (!k) {
      k =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ?
      crypto.randomUUID() :
      `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VOTER_KEY, k);
    }
    return k;
  } catch {
    return 'anon';
  }
}

export function loadVotedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    return new Set(raw ? JSON.parse(raw) as string[] : []);
  } catch {
    return new Set();
  }
}

export function persistVotedIds(ids: Set<string>) {
  try {
    localStorage.setItem(VOTED_KEY, JSON.stringify([...ids]));
  } catch {

    /* ignore */}
}