import { createSVGFrame } from "../framecreator";
import { isEditableSVGElement } from "../helper";
import { ESC } from "../keyhelper";
import type { Mode } from "../types";
const frame = createSVGFrame();
export const PLAY: Mode = {
  name: "PLAY",
  modeKey: "spc",
  frame: frame,
  inputHandlers: [ESC],
  events: {
    modeEnter(s) {
      s.activeMainFrameMode.frame.childNodes.forEach((el) => {
        if (isEditableSVGElement(el)) {
          el.animation.setAnimationNodes();
        }
      });
    },
    modeExit(s) {
      var elements = s.activeMainFrameMode.frame.querySelectorAll("animate");
      for (var i = 0; i < elements.length; i++) {
        elements[i].remove();
      }
    },
  },
};
