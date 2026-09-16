import { createEditPoint } from "./editpoint";
import { uid } from "../helper";
import type { Coord, CoordPair, EditPoint } from "../types";
import { EditPointType } from "../types/geometry";

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
function getRelatedAttributes(
  this: SVGLineElement,
  ep: EditPoint
): { attrs: string[]; values: number[] } {
  switch (ep.type) {
    case EditPointType.LINE_1:
      return {
        attrs: ["x1", "y1"],
        values: [this.x1.baseVal.value, this.y1.baseVal.value],
      };
    case EditPointType.LINE_2:
      return {
        attrs: ["x2", "y2"],
        values: [this.x2.baseVal.value, this.y2.baseVal.value],
      };
    default:
      return { attrs: [], values: [] };
  }
}

export function setLineMethods(line: SVGLineElement) {
  line.update = update;
  line.edit = edit;
  line.getEditPoints = getEditPoints;
  line.getRelatedAttributes = getRelatedAttributes;
  line.animatedProperties = new Set(["x1", "y1", "x2", "y2"]);
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
