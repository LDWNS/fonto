import type { KeydownInputHandler } from "./types";

export const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "esc",
  desc: "<~",
  handler: (_, s) => {
    s.mainModeHistory.pop(); // <- pop current mode
    const targetMode = s.mainModeHistory[s.mainModeHistory.length - 1]; // <- peek previous mode
    if (targetMode) {
      s.setActiveMode(targetMode);
    } else {
      s.setActiveModeId("NEUTRAL");
    }
  },
};
