import * as migration_20260903_232844_initial from './20260903_232844_initial';
import * as migration_20260904_004937_content_model from './20260904_004937_content_model';
import * as migration_20260904_005732_r2_storage from './20260904_005732_r2_storage';
import * as migration_20260904_011542_audio_labels from './20260904_011542_audio_labels';
import * as migration_20260904_012130_timeline_label from './20260904_012130_timeline_label';
import * as migration_20260904_215954_peaks from './20260904_215954_peaks';
import * as migration_20260904_225010_spectrum from './20260904_225010_spectrum';
import * as migration_20260904_232618_drop_spectrum from './20260904_232618_drop_spectrum';
import * as migration_20260904_232630_tone from './20260904_232630_tone';
import * as migration_20260905_091533_cta_badge from './20260905_091533_cta_badge';
import * as migration_20260905_202229_drop_cta_badge from './20260905_202229_drop_cta_badge';
import * as migration_20260905_213339_contact_page from './20260905_213339_contact_page';
import * as migration_20260905_220003_footer_headings from './20260905_220003_footer_headings';
import * as migration_20260905_221112_drop_check_label from './20260905_221112_drop_check_label';

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
    name: '20260904_215954_peaks',
  },
  {
    up: migration_20260904_225010_spectrum.up,
    down: migration_20260904_225010_spectrum.down,
    name: '20260904_225010_spectrum',
  },
  {
    up: migration_20260904_232618_drop_spectrum.up,
    down: migration_20260904_232618_drop_spectrum.down,
    name: '20260904_232618_drop_spectrum',
  },
  {
    up: migration_20260904_232630_tone.up,
    down: migration_20260904_232630_tone.down,
    name: '20260904_232630_tone',
  },
  {
    up: migration_20260905_091533_cta_badge.up,
    down: migration_20260905_091533_cta_badge.down,
    name: '20260905_091533_cta_badge',
  },
  {
    up: migration_20260905_202229_drop_cta_badge.up,
    down: migration_20260905_202229_drop_cta_badge.down,
    name: '20260905_202229_drop_cta_badge',
  },
  {
    up: migration_20260905_213339_contact_page.up,
    down: migration_20260905_213339_contact_page.down,
    name: '20260905_213339_contact_page',
  },
  {
    up: migration_20260905_220003_footer_headings.up,
    down: migration_20260905_220003_footer_headings.down,
    name: '20260905_220003_footer_headings',
  },
  {
    up: migration_20260905_221112_drop_check_label.up,
    down: migration_20260905_221112_drop_check_label.down,
    name: '20260905_221112_drop_check_label'
  },
];
