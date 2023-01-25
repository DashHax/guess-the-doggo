import { writable, type Writable } from "svelte/store";

export const dogBreeds: Writable<{[key:string]:string[]}> = writable({});