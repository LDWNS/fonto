import { createSVGFrame } from "../framecreator";
import type { Mode, KeydownInputHandler } from "../types";
import { DRAW_CIRCLE_MODE } from "./DRAW_CIRCLE";
import { DRAW_LINE_MODE } from "./DRAW_LINE";
import { DRAW_PATH_MODE } from "./DRAW_PATH";
import { EDIT_MODE } from "./EDIT";
import { TEXT_INPUT } from "./TEXT_INPUT";

const t: KeydownInputHandler = {
  type: "keydown",
  desc: "toggle bottombar",
  keyCode: "t",
  handler: (_, s) => {
    s.toggleBottomBar();
  },
};
const space: KeydownInputHandler = {
  type: "keydown",
  desc: "play animation",
  keyCode: "spc",
  handler: (_, s) => {
    s.setActiveModeId("PLAY");
    if (s.activeMainFrameMode.frame instanceof SVGSVGElement) {
      s.activeMainFrameMode.frame.setCurrentTime(0);
      let isActive = false;
      s.activeMainFrameMode.frame
        .querySelector("animate")!
        .addEventListener("endEvent", (_) => {
          if (isActive) {
            s.setActiveModeId("NEUTRAL");
          }
          isActive = true;
        });
    }
  },
};
const questionmark: KeydownInputHandler = {
  type: "keydown",
  desc: "toggle input help",
  keyCode: "S-?",
  handler: (_, __) => {
    document.querySelectorAll(".inputHelp").forEach((node) => {
      if (node.hasChildNodes()) {
        node.classList.toggle("hidden");
      }
    });
  },
};

const frame = createSVGFrame();
export const NEUTRAL_MODE: Mode = {
  name: "NEUTRAL",
  frame: frame,
  inputHandlers: [t, space, questionmark],
  modeKey: "s-n",
  subModes: [
    DRAW_CIRCLE_MODE,
    DRAW_LINE_MODE,
    DRAW_PATH_MODE,
    EDIT_MODE,
    TEXT_INPUT,
  ],
};
