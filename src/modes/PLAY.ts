import { createSVGFrame } from "../framecreator";
import { createAnimateNode } from "../helper";
import { ESC } from "../keyhelper";
import type { AnimationAttributes, EditableSVGElement, Mode } from "../types";
function getAnimationAttributes(
  child: EditableSVGElement,
  timing: number,
  animationAttr?: AnimationAttributes
): AnimationAttributes {
  const animatedAttributes: string[] = [];
  const values: string[] = [];
  child.animatedProperties.forEach((el) => {
    animatedAttributes.push(el);
    values.push(child.getAttribute(el) ?? "-1");
  });
  if (!animationAttr) {
    return {
      animatedAttributes: animatedAttributes,
      values: values,
      initValues: values,
      attributes: child.attributes,
      keyTimes: timing.toString(),
      node: document.createElementNS(
        "http://www.w3.org/2000/svg",
        child.nodeName
      ),
      createAnimation: createAnimation,
    };
  }
  for (let i = 0; i < child.animatedProperties.size; i++) {
    animationAttr.values[i] += ";" + values[i];
  }
  animationAttr.keyTimes += ";" + timing;
  return animationAttr;
}
function createAnimation(
  this: AnimationAttributes,
  node: SVGElement,
  duration: string
): SVGElement {
  for (let i = 0; i < this.animatedAttributes.length; i++) {
    const aa = this.animatedAttributes[i];
    node.setAttribute(aa, this.initValues[i]);
    node.appendChild(
      createAnimateNode(aa, this.values[i], duration, this.keyTimes)
    );
  }
  Object.entries(this.attributes).forEach(([_, value]) => {
    if (!this.animatedAttributes.includes(value.nodeName)) {
      node.setAttribute(value.nodeName, value.nodeValue ?? "true");
    }
  });
  return node;
}
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
              getAnimationAttributes(child, (keyframe.x - start) / end)
            );
          } else {
            animations.set(
              id,
              getAnimationAttributes(
                child,
                (keyframe.x - start) / end,
                animations.get(id)
              )
            );
          }
        });
      });

      s.activeMainFrameMode.frame.textContent = "";
      animations.forEach((el) => {
        const svgElement = el.createAnimation(el.node, duration + "ms");
        s.activeMainFrameMode.frame.appendChild(svgElement);
      });
    },
  },
};
