import { writable } from 'svelte/store';

// Create a writable store with an initial string value
export const passActTitle = writable(null);                 
export const passActContent = writable({});
export const searchedActContent = writable(null);
export const hocContent = writable(null);
export const senContent = writable(null);
export const ActContent = writable(null);
export const allActs = writable([]);
export const searchActsInput = writable(null);
export const searchActsInputCurrent = writable(null);
export const searchHansardsInput = writable(null);
export const searchHansardsInputCurrent = writable(null);
