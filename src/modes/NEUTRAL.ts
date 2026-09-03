import { createSVGFrame } from "../framecreator";
import type { Mode, KeydownInputHandler } from "../types";

const S: KeydownInputHandler = {
  type: "keydown",
  desc: "SELECT",
  keyCode: "s",
  handler: (_, s) => s.setActiveModeId("SELECT"),
};
const l: KeydownInputHandler = {
  type: "keydown",
  desc: "DRAW_LINE",
  keyCode: "l",
  handler: (_, s) => s.setActiveModeId("DRAW_LINE"),
};
const e: KeydownInputHandler = {
  type: "keydown",
  desc: "EDIT",
  keyCode: "e",
  handler: (_, s) => s.setActiveModeId("EDIT"),
};
const c: KeydownInputHandler = {
  type: "keydown",
  desc: "DRAW_CIRCLE",
  keyCode: "c",
  handler: (_, s) => s.setActiveModeId("DRAW_CIRCLE"),
};
const p: KeydownInputHandler = {
  type: "keydown",
  desc: "DRAW_PATH",
  keyCode: "p",
  handler: (_, s) => s.setActiveModeId("DRAW_PATH"),
};
const i: KeydownInputHandler = {
  type: "keydown",
  desc: "TEXT_INPUT",
  keyCode: "i",
  handler: (_, s) => s.setActiveModeId("TEXT_INPUT"),
};
const v: KeydownInputHandler = {
  type: "keydown",
  desc: "VIEW",
  keyCode: "v",
  handler: (_, s) => s.setActiveModeId("VIEW"),
};
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
    s.setActiveModeId("VIEW");
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
  inputHandlers: [S, l, e, c, p, i, v, t, space, questionmark],
};
