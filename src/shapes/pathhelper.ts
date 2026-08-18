import { toast, uid } from "../helper";
import type { Coord, EditPoint, SVGPathSegment } from "../types";
import { EditPointType } from "../types/geometry";
import { createEditPoint } from "./editpoint";
import { createCSeg, createLSeg, createMSeg } from "./pathsegment";

export function createCAnchorPoints(
  ep: EditPoint,
  coordA1: Coord,
  coordA2: Coord
): [EditPoint, EditPoint] {
  const a1 = createEditPoint(EditPointType.PATH_A1, ep.targetId, coordA1)
    .setAnchorPoint(ep.prevEditPoint!)
    .setAnchorPoint(ep, true)
    .toggleAnchorLine();
  const a2 = createEditPoint(EditPointType.PATH_A2, ep.targetId, coordA2)
    .setAnchorPoint(ep)
    .toggleAnchorLine();
  return [a1, a2];
}
export function createPathSegmentEditPoint(
  id: string,
  el: SVGPathSegment,
  prevEP?: EditPoint
): EditPoint[] {
  let ep;
  switch (el.type) {
    case "C":
      const c = createEditPoint(EditPointType.PATH_1, `${id}-${el.id}`, {
        x: el.coords.x!,
        y: el.coords.y!,
      }).linkPrev(prevEP);
      ep = [
        c,
        ...createCAnchorPoints(
          c,
          { x: el.coords.x1!, y: el.coords.y1! },
          { x: el.coords.x2!, y: el.coords.y2! }
        ),
      ];
      break;
    case "M":
    case "L":
      ep = [
        createEditPoint(
          EditPointType.PATH_1,
          `${id}-${el.id}`,
          el.coords
        ).linkPrev(prevEP),
      ];
  }
  prevEP = ep[0];
  return ep;
}
export function getPathSegments(d: string | null): SVGPathSegment[] {
  if (!d) return [];
  let prevPathSeg: SVGPathSegment;
  return d
    .split(/([a-zA-Z] {0,1}[-\d. ]*)/)
    .map((el) => el.trim())
    .filter((el) => el.length > 0)
    .map((str) => {
      const [type, coords] =
        str.split(/([a-zA-Z] ?)([-\d. ]*)/).filter((el) => el.length > 0) ?? [];
      const moves: number[] = [];
      if (coords) {
        coords
          .matchAll(/-?\d*\.?\d+/g)
          .forEach((x) => moves.push(parseFloat(x[0])));
      }
      let pathSeg;
      switch (type.trim()) {
        case "C":
          pathSeg = createCSeg(uid(), moves, prevPathSeg);
          break;
        case "L":
          pathSeg = createLSeg(uid(), moves, prevPathSeg);
          break;
        case "M":
          pathSeg = createMSeg(uid(), moves, prevPathSeg);
          break;
        default:
          toast("unsupported type: " + type);
          throw "";
      }
      prevPathSeg = pathSeg!;
      return pathSeg;
    });
}
