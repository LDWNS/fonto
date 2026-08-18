import { createSVGFrame, createTimelineFrame } from "../framecreator";
import type { KeydownInputHandler, Mode } from "../types";
import type { AnimationAttributes } from "../types/geometry";

const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "Escape",
  handler: (_, s) => s.setActiveModeId("NEUTRAL"),
};

const frame = createSVGFrame();
export const VIEW: Mode = {
  name: "VIEW",
  frame: frame,
  inputHandlers: [ESC],
  events: {
    modeEnter(s) {
      const duration = s.data["bottom-bar"]?.duration!;
      let keyframes = s.data["bottom-bar"]?.keyframes!;
      keyframes = keyframes?.sort((a, b) => a.x - b.x);
      const animations: Map<string, AnimationAttributes> = new Map();

      keyframes.forEach((keyframe) => {
        const children = keyframe.children;
        children.forEach((child) => {
          const id = child.id;
          if (!animations.get(id)) {
            animations.set(id, child.getAnimationAttributes());
          } else {
            animations.set(
              id,
              child.getAnimationAttributes(animations.get(id))
            );
          }
        });
      });

      s.activeMainFrameMode.frame.textContent = "";
      animations.forEach((el) => {
        const svgElement = el.createAnimation(duration + "ms");
        s.activeMainFrameMode.frame.appendChild(svgElement);
      });
    },
  },
};
