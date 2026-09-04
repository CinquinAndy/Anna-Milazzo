import * as migration_20260903_232844_initial from './20260903_232844_initial';
import * as migration_20260904_004937_content_model from './20260904_004937_content_model';
import * as migration_20260904_005732_r2_storage from './20260904_005732_r2_storage';
import * as migration_20260904_011542_audio_labels from './20260904_011542_audio_labels';
import * as migration_20260904_012130_timeline_label from './20260904_012130_timeline_label';
import * as migration_20260904_215954_peaks from './20260904_215954_peaks';

export const migrations = [
  {
    up: migration_20260903_232844_initial.up,
    down: migration_20260903_232844_initial.down,
    name: '20260903_232844_initial',
  },
  {
    up: migration_20260904_004937_content_model.up,
    down: migration_20260904_004937_content_model.down,
    name: '20260904_004937_content_model',
  },
  {
    up: migration_20260904_005732_r2_storage.up,
    down: migration_20260904_005732_r2_storage.down,
    name: '20260904_005732_r2_storage',
  },
  {
    up: migration_20260904_011542_audio_labels.up,
    down: migration_20260904_011542_audio_labels.down,
    name: '20260904_011542_audio_labels',
  },
  {
    up: migration_20260904_012130_timeline_label.up,
    down: migration_20260904_012130_timeline_label.down,
    name: '20260904_012130_timeline_label',
  },
  {
    up: migration_20260904_215954_peaks.up,
    down: migration_20260904_215954_peaks.down,
    name: '20260904_215954_peaks'
  },
];
