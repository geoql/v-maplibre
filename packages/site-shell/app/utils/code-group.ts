import type { InjectionKey } from 'vue';

/** True inside `::code-group`, where the tabs carry the file names. */
export const IN_CODE_GROUP: InjectionKey<boolean> = Symbol('in-code-group');
