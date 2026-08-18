import { distance, toast } from "../helper";
import { createLine } from "./line";
import type { Coord, CoordPair, EditPoint } from "../types";
import type { EditPointType } from "../types/geometry";

export function createEditPoint(
  type: EditPointType,
  targetId: string,
  { x, y }: Coord,
  r = 5
): EditPoint {
  const ep = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  ) as EditPoint;
  ep.type = type;
  ep.targetId = targetId;
  ep.setAttribute("data-edit", "true");
  ep.setAttribute("stroke", "#333");
  ep.setAttribute("stroke-width", "2px");
  ep.setAttribute("fill", "transparent");
  ep.setAttribute("cx", x.toString());
  ep.setAttribute("cy", y.toString());
  ep.setAttribute("r", r.toString());
  ep.anchoredPoints = [];
  ep.blindAnchoredPoints = [];

  ep.x = function () {
    return this.cx.baseVal.value;
  };
  ep.y = function () {
    return this.cy.baseVal.value;
  };
  ep.update = update;
  ep.addAnchoredPoint = addAnchoredPoint;
  ep.updateAnchoredPoints = updatedAnchoredPoints;
  ep.linkPrev = linkPrev;
  ep.setAnchorPoint = setAnchorPoint;
  ep.toggleAnchorLine = toggleAnchorLine;

  return ep;
}

function update(this: EditPoint, { x1, y1, x2, y2 }: CoordPair) {
  if (x1) this.setAttribute("cx", x1.toString());
  if (y1) this.setAttribute("cy", y1.toString());
  if (x2) this.setAttribute("rx", x2.toString());
  if (y2) this.setAttribute("ry", y2.toString());
  if (x2 && y2) {
    const cx = this.getAttribute("cx");
    const cy = this.getAttribute("cy");
    if (cx && cy) {
      const r = distance(Number.parseInt(cx), Number.parseInt(cy), x2, y2);
      this.setAttribute("r", r.toString());
    }
  }
}

function newAnchorLine(id: string, coord: CoordPair): SVGLineElement {
  const al = createLine(coord);
  al.id = id + "-line";
  al.setAttribute("data-edit", "true");
  al.setAttribute("stroke", "#333");
  al.setAttribute("stroke-dasharray", "2px");
  return al;
}
function anchorPointUpdateStrategy(
  anchoredPoint: EditPoint,
  dx: number,
  dy: number
) {
  anchoredPoint.update({
    x1: anchoredPoint.cx.baseVal.value + dx,
    y1: anchoredPoint.cy.baseVal.value + dy,
  });
  if (anchoredPoint.anchorLine) {
    anchoredPoint.anchorLine.update({
      x1: anchoredPoint.anchorLine.x1.baseVal.value + dx,
      y1: anchoredPoint.anchorLine.y1.baseVal.value + dy,
      x2: anchoredPoint.anchorLine.x2.baseVal.value + dx,
      y2: anchoredPoint.anchorLine.y2.baseVal.value + dy,
    });
  }
}
function updatedAnchoredPoints(this: EditPoint, dx: number, dy: number) {
  if (this.anchoredPoints !== undefined) {
    for (const anchoredPoint of this.anchoredPoints) {
      anchorPointUpdateStrategy(anchoredPoint, dx, dy);
    }
  }
  return this;
}

function addAnchoredPoint(
  this: EditPoint,
  editPoint: EditPoint,
  blind: boolean = false
): EditPoint {
  if (blind) {
    this.blindAnchoredPoints!.push(editPoint);
  } else {
    this.anchoredPoints!.push(editPoint);
  }
  return this;
}
function linkPrev(this: EditPoint, prevEPoint?: EditPoint) {
  if (prevEPoint) {
    this.prevEditPoint = prevEPoint;
    prevEPoint.nextEditPoint = this;
  }
  return this;
}
function setAnchorPoint(
  this: EditPoint,
  anchorPoint: EditPoint,
  blind = false
) {
  this.setAttribute("fill", "#333");
  if (blind) {
    this.blindAnchorPoint = anchorPoint;
  } else {
    this.anchorPoint = anchorPoint;
  }
  anchorPoint.addAnchoredPoint(this, blind);
  return this;
}
function toggleAnchorLine(this: EditPoint) {
  if (!this.anchorPoint) {
    toast("No anchorpoint when trying to toggle anchorline");
    return this;
  }
  if (this.anchorLine) {
    this.anchorLine.remove();
  } else {
    this.anchorLine = newAnchorLine(this.id, {
      x1: this.anchorPoint.cx.baseVal.value,
      y1: this.anchorPoint.cy.baseVal.value,
      x2: this.cx.baseVal.value,
      y2: this.cy.baseVal.value,
    });
  }
  return this;
}
