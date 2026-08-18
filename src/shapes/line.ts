import { createEditPoint } from "./editpoint";
import { createAnimateNode, uid } from "../helper";
import type { Coord, CoordPair, EditPoint } from "../types";
import {
  EditPointType,
  type AnimationAttributes,
  type SVGLineAnimationAttributes,
} from "../types/geometry";

function update(this: SVGLineElement, { x1, y1, x2, y2 }: CoordPair) {
  if (x1) this.setAttribute("x1", x1.toString());
  if (y1) this.setAttribute("y1", y1.toString());
  if (x2) this.setAttribute("x2", x2.toString());
  if (y2) this.setAttribute("y2", y2.toString());
}
function edit(this: SVGLineElement, ep: EditPoint, { x, y }: Coord) {
  switch (ep.type) {
    case EditPointType.LINE_1:
      this.update({ x1: x, y1: y });
      break;
    case EditPointType.LINE_2:
      this.update({ x2: x, y2: y });
      break;
  }
}
function getEditPoints(this: SVGLineElement) {
  const ep1 = createEditPoint(EditPointType.LINE_1, this.id + "-1", {
    x: this.x1.baseVal.value,
    y: this.y1.baseVal.value,
  });
  const ep2 = createEditPoint(EditPointType.LINE_2, this.id + "-2", {
    x: this.x2.baseVal.value,
    y: this.y2.baseVal.value,
  });
  return [ep1, ep2];
}
function createAnimation(
  this: SVGLineAnimationAttributes,
  duration: string
): SVGElement {
  const lineNode = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  lineNode.setAttribute("x1", this.initX1);
  lineNode.setAttribute("y1", this.initY1);
  lineNode.setAttribute("x2", this.initX2);
  lineNode.setAttribute("y2", this.initY2);
  lineNode.appendChild(createAnimateNode("x1", this.x1, duration));
  lineNode.appendChild(createAnimateNode("y1", this.y1, duration));
  lineNode.appendChild(createAnimateNode("x2", this.x2, duration));
  lineNode.appendChild(createAnimateNode("y2", this.y2, duration));
  Object.entries(this.attributes).forEach(([_, value]) => {
    lineNode.setAttribute(value.nodeName, value.nodeValue ?? "true");
  });
  return lineNode;
}
function getAnimationAttributes(
  this: SVGLineElement,
  animationAttr?: SVGLineAnimationAttributes
): SVGLineAnimationAttributes {
  if (!animationAttr) {
    return {
      x1: this.x1.baseVal.valueAsString,
      y1: this.y1.baseVal.valueAsString,
      x2: this.x2.baseVal.valueAsString,
      y2: this.y2.baseVal.valueAsString,
      initX1: this.x1.baseVal.valueAsString,
      initY1: this.y1.baseVal.valueAsString,
      initX2: this.x2.baseVal.valueAsString,
      initY2: this.y2.baseVal.valueAsString,
      attributes: this.attributes,
      createAnimation: createAnimation,
    };
  }
  animationAttr.x1 += ";" + this.x1.baseVal.valueAsString;
  animationAttr.y1 += ";" + this.y1.baseVal.valueAsString;
  animationAttr.x2 += ";" + this.x2.baseVal.valueAsString;
  animationAttr.y2 += ";" + this.y2.baseVal.valueAsString;
  return animationAttr;
}

export function setLineMethods(line: SVGLineElement) {
  line.update = update;
  line.edit = edit;
  line.getEditPoints = getEditPoints;
  line.getAnimationAttributes = getAnimationAttributes;
  return line;
}
export function createLine(initCoords: CoordPair) {
  let line = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  ) as SVGLineElement;

  line = setLineMethods(line);

  line.id = uid();
  line.update(initCoords);
  line.setAttribute("stroke", "#333");

  return line;
}
