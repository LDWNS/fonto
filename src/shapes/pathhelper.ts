import { toast, uid } from "../helper";
import type { Coord, EditPoint, SVGPathSegment } from "../types";
import { EditPointType } from "../types/geometry";
import { createEditPoint } from "./editpoint";
import {
  createASeg,
  createCSeg,
  createLSeg,
  createMSeg,
  createZSeg,
} from "./pathsegment";

export function createCAnchorPoints(
  ep: EditPoint,
  coordA1: Coord,
  coordA2: Coord
): [EditPoint, EditPoint] {
  const a1 = createEditPoint(EditPointType.PATH_A1, ep.targetId, ["d"], coordA1)
    .setAnchorPoint(ep.prevEditPoint!)
    .setAnchorPoint(ep, true)
    .toggleAnchorLine();
  const a2 = createEditPoint(EditPointType.PATH_A2, ep.targetId, ["d"], coordA2)
    .setAnchorPoint(ep)
    .toggleAnchorLine();
  return [a1, a2];
}
export function createPathSegmentEditPoint(
  id: string,
  el: SVGPathSegment,
  prevEP?: EditPoint
): EditPoint[] {
  let ep: EditPoint[];
  switch (el.type) {
    case "C":
      const c = createEditPoint(EditPointType.PATH_1, `${id}-${el.id}`, ["d"], {
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
          ["d"],
          el.coords
        ).linkPrev(prevEP),
      ];
      break;
    case "A":
      ep = [
        createEditPoint(EditPointType.PATH_1, `${id}-${el.id}`, ["d"], {
          x: el.coords.x,
          y: el.coords.y,
        }).linkPrev(prevEP),
      ];
      break;
    case "Z":
      ep = [];
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
    .flatMap((str) => {
      const [type, coords] =
        str.split(/([a-zA-Z] ?)([-\d. ]*)/).filter((el) => el.length > 0) ?? [];
      let moves: number[] = [];
      if (coords) {
        coords
          .matchAll(/-?\d*\.?\d+/g)
          .forEach((x) => moves.push(parseFloat(x[0])));
      }
      let pathSegs: SVGPathSegment[] = [];
      let pathSeg: SVGPathSegment;
      while (moves.length > 0) {
        switch (type.trim()) {
          case "c":
            moves = moves.map((m, i) =>
              i >= 6 // only do first 6
                ? m
                : i % 2 == 0
                ? m + prevPathSeg.coords!.x
                : m + prevPathSeg.coords!.y
            );
          case "C":
            pathSeg = createCSeg(uid(), moves, prevPathSeg);
            moves = moves.slice(6);
            break;
          case "a":
            moves[0] += prevPathSeg.coords!.x;
            moves[1] += prevPathSeg.coords!.y;
            moves[5] += prevPathSeg.coords!.x;
            moves[6] += prevPathSeg.coords!.y;
          case "A":
            pathSeg = createASeg(uid(), moves, prevPathSeg);
            moves = moves.splice(7);
            break;
          case "L":
            pathSeg = createLSeg(uid(), moves, prevPathSeg);
            moves = moves.splice(2);
            break;
          case "M":
            pathSeg = createMSeg(uid(), moves, prevPathSeg);
            moves = moves.splice(2);
            break;
          case "Z":
            pathSeg = createZSeg(uid(), prevPathSeg);
            break;
          default:
            toast("unsupported type: " + type);
            throw "";
        }
        prevPathSeg = pathSeg!;
        pathSegs.push(pathSeg);
      }
      return pathSegs;
    });
}
