import type { KeydownInputHandler } from "./types";

export const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "esc",
  desc: "NEUTRAL",
  handler: (_, s) => s.setActiveModeId("NEUTRAL"),
};
