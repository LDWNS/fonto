import { createEditPoint } from "./editpoint";
import { distance, uid } from "../helper";
import type { Coord, CoordPair, EditPoint } from "../types";
import { EditPointType } from "../types/geometry";

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
function getRelatedAttributes(
  this: SVGCircleElement,
  ep: EditPoint
): { attrs: string[]; values: number[] } {
  switch (ep.type) {
    case EditPointType.CIRCLE_1:
      return {
        attrs: ["x1", "y1"],
        values: [this.cx.baseVal.value, this.cy.baseVal.value],
      };
    case EditPointType.CIRCLE_2:
      return {
        attrs: ["x2", "y2", "r"],
        values: [this.rx, this.rx, parseInt(this.getAttribute("r") ?? "-1")],
      };
    default:
      return { attrs: [], values: [] };
  }
}

export function setCircleMethods(circle: SVGCircleElement) {
  circle.update = update;
  circle.edit = edit;
  circle.getEditPoints = getEditPoints;
  circle.getRelatedAttributes = getRelatedAttributes;
  circle.animatedProperties = new Set(["cx", "cy", "r"]);
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
