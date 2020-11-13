import { writable } from 'svelte/store';

export const cur_blueline = writable([]);
export const cur_treble = writable([]);
export const stage = writable(8);
export const cur_bell = writable(8);
export const cur_method = writable('');
export const card_complete = writable(false);
export const lead_length = writable(0);

export const cards_today = writable(0);

export const mistakes = writable(0);
