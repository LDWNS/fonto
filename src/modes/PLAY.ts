import { keyframesToAnimation } from "../animationhelper";
import { createSVGFrame } from "../framecreator";
import { ESC } from "../keyhelper";
import type {
  Mode,
} from "../types";
const frame = createSVGFrame();
export const PLAY: Mode = {
  name: "PLAY",
  modeKey: "spc",
  frame: frame,
  inputHandlers: [ESC],
  events: {
    modeEnter(s) {
      // const duration = s.data["bottom-bar"]?.duration!;
      let keyframes = s.data["bottom-bar"]?.keyframes!;
      s.activeMainFrameMode.frame.textContent = "";
      keyframesToAnimation(keyframes, s.data["bottom-bar"]?.duration!, (se) =>
        s.activeMainFrameMode.frame.appendChild(se)
      );
    },
  },
};
