import { createSVGFrame } from "../framecreator";
import { ESC } from "../keyhelper";
import type { Mode } from "../types";
import type { AnimationAttributes } from "../types/geometry";

const frame = createSVGFrame();
export const PLAY: Mode = {
  name: "PLAY",
  frame: frame,
  color: "#AA2399",
  inputHandlers: [ESC],
  events: {
    modeEnter(s) {
      // const duration = s.data["bottom-bar"]?.duration!;
      let keyframes = s.data["bottom-bar"]?.keyframes!;
      keyframes = keyframes?.sort((a, b) => a.x - b.x);
      const animations: Map<string, AnimationAttributes> = new Map();

      const minX = keyframes[0].x;
      const maxX = keyframes[keyframes.length - 1].x;
      const start = 0;
      const end = maxX - minX;
      const duration = ((end - start) / 415) * s.data["bottom-bar"]?.duration!;

      keyframes.forEach((keyframe) => {
        const children = keyframe.children;
        children.forEach((child) => {
          const id = child.id;
          if (!animations.get(id)) {
            animations.set(
              id,
              child.getAnimationAttributes((keyframe.x - start) / end)
            );
          } else {
            animations.set(
              id,
              child.getAnimationAttributes(
                (keyframe.x - start) / end,
                animations.get(id)
              )
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
