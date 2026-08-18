import { createEditPoint } from "./editpoint";
import { createAnimateNode, distance, uid } from "../helper";
import type { Coord, CoordPair, EditPoint } from "../types";
import {
  EditPointType,
  type SVGCircleAnimationAttributes,
} from "../types/geometry";

function update(this: SVGCircleElement, { x1, y1, x2, y2 }: CoordPair) {
  if (x1 !== undefined) this.setAttribute("cx", x1.toString());
  if (y1 !== undefined) this.setAttribute("cy", y1.toString());
  if (x2 !== undefined) this.rx = x2;
  if (y2 !== undefined) this.ry = y2;
  if (x2 !== undefined && y2 !== undefined) {
    const cx = this.getAttribute("cx");
    const cy = this.getAttribute("cy");
    if (cx !== null && cy !== null) {
      const r = distance(Number.parseInt(cx), Number.parseInt(cy), x2, y2);
      this.setAttribute("r", r.toString());
    }
  }
}
function edit(this: SVGCircleElement, ep: EditPoint, { x, y }: Coord) {
  switch (ep.type) {
    case EditPointType.CIRCLE_1:
      this.update({ x1: x, y1: y });
      break;
    case EditPointType.CIRCLE_2:
      this.update({ x2: x, y2: y });
      break;
  }
}
function getEditPoints(this: SVGCircleElement) {
  const ep1 = createEditPoint(EditPointType.CIRCLE_1, this.id, {
    x: this.cx.baseVal.value,
    y: this.cy.baseVal.value,
  });
  const ep2 = createEditPoint(EditPointType.CIRCLE_2, this.id, {
    x: this.rx,
    y: this.ry,
  })
    .setAnchorPoint(ep1)
    .toggleAnchorLine();
  return [ep1, ep2];
}

export function setCircleMethods(circle: SVGCircleElement) {
  circle.update = update;
  circle.edit = edit;
  circle.getEditPoints = getEditPoints;
  circle.getAnimationAttributes = getAnimationAttributes;
  return circle;
}

export function createCircle(initCoords: CoordPair) {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  ) as SVGCircleElement;

  setCircleMethods(circle);

  circle.id = uid();
  circle.update(initCoords);
  circle.setAttribute("stroke", "#333");
  circle.setAttribute("fill", "transparent");

  return circle;
}
function createAnimation(
  this: SVGCircleAnimationAttributes,
  duration: string
): SVGElement {
  const circleNode = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circleNode.setAttribute("cx", this.initCx);
  circleNode.setAttribute("cy", this.initCy);
  circleNode.setAttribute("r", this.initR);
  circleNode.appendChild(createAnimateNode("cx", this.cx, duration));
  circleNode.appendChild(createAnimateNode("cy", this.cy, duration));
  circleNode.appendChild(createAnimateNode("r", this.r, duration));
  Object.entries(this.attributes).forEach(([_, value]) => {
    circleNode.setAttribute(value.nodeName, value.nodeValue ?? "true");
  });
  return circleNode;
}
function getAnimationAttributes(
  this: SVGCircleElement,
  animationAttr?: SVGCircleAnimationAttributes
): SVGCircleAnimationAttributes {
  if (!animationAttr) {
    return {
      cx: this.cx.baseVal.valueAsString,
      cy: this.cy.baseVal.valueAsString,
      r: this.r.baseVal.valueAsString,
      initCx: this.cx.baseVal.valueAsString,
      initCy: this.cy.baseVal.valueAsString,
      initR: this.r.baseVal.valueAsString,
      attributes: this.attributes,
      createAnimation: createAnimation,
    };
  }
  animationAttr.cx += ";" + this.cx.baseVal.valueAsString;
  animationAttr.cy += ";" + this.cy.baseVal.valueAsString;
  animationAttr.r += ";" + this.r.baseVal.valueAsString;
  return animationAttr;
}
