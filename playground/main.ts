import { generate } from './noise/generate.js';
import { initControls } from './ui/controls.js';
import { initPlayback } from './ui/playback.js';
import { initReadout } from './ui/readout.js';

initControls();
initPlayback();
initReadout();
generate();
