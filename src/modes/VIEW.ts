import { createSVGFrame } from "../framecreator";
import { ESC } from "../keyhelper";
import type { Mode } from "../types";
import type { AnimationAttributes } from "../types/geometry";

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
            animations.set(
              id,
              child.getAnimationAttributes(keyframe.x / duration)
            );
          } else {
            animations.set(
              id,
              child.getAnimationAttributes(keyframe.x / 415, animations.get(id))
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
