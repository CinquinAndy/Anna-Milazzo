import * as migration_20260903_232844_initial from './20260903_232844_initial';

export const migrations = [
  {
    up: migration_20260903_232844_initial.up,
    down: migration_20260903_232844_initial.down,
    name: '20260903_232844_initial'
  },
];
