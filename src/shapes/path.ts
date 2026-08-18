import { createAnimateNode, pathSegmentToString, uid } from "../helper";
import type {
  BaseSVGPathSegment,
  Coord,
  CoordPair,
  CoordTriplet,
  EditPoint,
  SVGPathSegment,
} from "../types";
import {
  EditPointType,
  type SVGCircleAnimationAttributes,
  type SVGPathAnimationAttributes,
} from "../types/geometry";
import { createCSeg, createLSeg } from "./pathsegment";
import type { App } from "../state";
import {
  createCAnchorPoints,
  createPathSegmentEditPoint,
  getPathSegments,
} from "./pathhelper";

function coordToD({ x, y }: CoordTriplet, type: string = "M"): string {
  return `${type} ${x} ${y}`;
}
function update(this: SVGPathElement, { x1, y1 }: CoordPair) {
  const d = this.getAttribute("d");
  if (d && x1 && y1) {
    this.setAttribute("d", d + coordToD({ x: x1, y: y1 }, "L"));
  }
}
function getEditPoints(this: SVGPathElement): EditPoint[] {
  let pd: SVGPathSegment[] = getPathSegments(this.getAttribute("d"));

  this.pathSegs = pd;
  let prevEP: EditPoint | undefined = undefined;
  return pd
    .map((el) => {
      const ep = createPathSegmentEditPoint(this.id, el, prevEP);
      prevEP = ep[0];
      return ep;
    })
    .flat();
}
function edit(this: SVGPathElement, ep: EditPoint, coord: Coord): void {
  if (this.pathSegs) {
    let oldPathString = this.getAttribute("d");
    let pathString = "";
    this.pathSegs = this.pathSegs.map((ps) => {
      if (ep.targetId.endsWith(ps.id)) {
        switch (ep.type) {
          case EditPointType.PATH_1:
            ps.coords.x = coord.x;
            ps.coords.y = coord.y;
            break;
          case EditPointType.PATH_A1:
            ps = ps as BaseSVGPathSegment<"C">;
            ps.coords.x1 = coord.x;
            ps.coords.y1 = coord.y;
            break;
          case EditPointType.PATH_A2:
            ps = ps as BaseSVGPathSegment<"C">;
            ps.coords.x2 = coord.x;
            ps.coords.y2 = coord.y;
            break;
        }
      }
      pathString += pathSegmentToString(ps);
      return ps;
    });
    this.setAttribute("d", pathString.trim());
  }
}
function toggleSegmentType(this: SVGPathElement, s: App, ep: EditPoint): void {
  let pathString = "";
  this.pathSegs = this.pathSegs!.map((ps) => {
    if (ep.targetId.endsWith(ps.id)) {
      switch (ps.type) {
        case "L":
          ps = createCSeg(
            ps.id,
            {
              x: ps.coords.x,
              y: ps.coords.y,
              x1: ps.prevSeg.coords.x + 30,
              y1: ps.prevSeg.coords.y + 30,
              x2: ps.coords.x - 30,
              y2: ps.coords.y - 30,
            },
            ps.prevSeg
          );
          const [a1, a2] = createCAnchorPoints(
            ep,
            { x: ps.coords.x1!, y: ps.coords.y1! },
            { x: ps.coords.x2!, y: ps.coords.y2! }
          );
          s.activeMainFrameMode.frame.appendChild(a1);
          s.activeMainFrameMode.frame.appendChild(a1.anchorLine!);
          s.activeMainFrameMode.frame.appendChild(a2);
          s.activeMainFrameMode.frame.appendChild(a2.anchorLine!);
          break;
        case "C":
          ps = createLSeg(ps.id, ps.coords, ps.prevSeg);
          break;
        case "M":
          break;
      }
    }
    pathString += pathSegmentToString(ps);
    return ps;
  });
  this.setAttribute("d", pathString.trim());
}
function createAnimation(
  this: SVGPathAnimationAttributes,
  duration: string
): SVGElement {
  const lineNode = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  lineNode.setAttribute("d", this.initD);
  lineNode.appendChild(createAnimateNode("d", this.d, duration));
  return lineNode;
}
function getAnimationAttributes(
  this: SVGPathElement,
  animationAttr?: SVGPathAnimationAttributes
): SVGPathAnimationAttributes {
  if (!animationAttr) {
    return {
      d: this.getAttribute("d")!,
      initD: this.getAttribute("d")!,
      createAnimation: createAnimation,
    };
  }
  animationAttr.d += ";" + this.getAttribute("d")!;
  return animationAttr;
}
export function setPathMethods(path: SVGPathElement) {
  path.update = update;
  path.edit = edit;
  path.getEditPoints = getEditPoints;
  path.toggleSegmentType = toggleSegmentType;
  path.getAnimationAttributes = getAnimationAttributes;
  return path;
}
export function createPath(initCoord: Coord) {
  let path = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  ) as SVGPathElement;

  path = setPathMethods(path);

  path.id = uid();
  path.setAttribute("d", coordToD(initCoord));
  path.setAttribute("stroke", "#333");
  path.setAttribute("stroke-width", "2px");
  path.setAttribute("fill", "none");
  return path;
}
