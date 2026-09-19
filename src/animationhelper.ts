import type {
  AnimationAttributes,
  EditableSVGElement,
  TimeLineFrame,
} from "./types";

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
function createAnimateNode(
  attributeName: string,
  values: string,
  duration: string,
  keyTimes: string
) {
  const animateNode = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animate"
  );
  animateNode.setAttribute("attributeName", attributeName);
  animateNode.setAttribute("values", values);
  animateNode.setAttribute("dur", duration);
  animateNode.setAttribute("keyTimes", keyTimes);
  animateNode.setAttribute("fill", "freeze");
  animateNode.setAttribute("begin", "0s");
  return animateNode;
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

function keyframesToAnimation(
  keyframes: TimeLineFrame[],
  timelineDuration: number,
  callback: (se: SVGElement) => void
) {
  keyframes = keyframes?.sort((a, b) => a.x - b.x);
  const animations: Map<string, AnimationAttributes> = new Map();

  const minX = keyframes[0].x;
  const maxX = keyframes[keyframes.length - 1].x;
  const start = 0;
  const end = maxX - minX;
  const duration = ((end - start) / 415) * timelineDuration;

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
    animations.forEach((el) => {
      const svgElement = el.createAnimation(el.node, duration + "ms");
      callback(svgElement);
    });
  });
}

export { keyframesToAnimation };
