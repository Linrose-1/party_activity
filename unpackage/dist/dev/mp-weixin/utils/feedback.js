"use strict";
const common_vendor = require("../common/vendor.js");
const POINTS_GAINED_SOUND_URL = "https://img.gofor.club/20251119/retro-coin-4-236671_1763536579022.mp3";
const audioContext = common_vendor.index.createInnerAudioContext();
audioContext.src = POINTS_GAINED_SOUND_URL;
audioContext.autoplay = false;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/feedback.js.map
