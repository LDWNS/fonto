import type {
  BaseSVGPathSegment,
  Coord,
  CoordTriplet,
  SVGPathSegment,
} from "../types";

export function createMSeg(
  id: string,
  coord: Coord | number[],
  prevSeg: SVGPathSegment
): BaseSVGPathSegment<"M"> {
  if (Array.isArray(coord)) {
    coord = {
      x: coord[0],
      y: coord[1],
    };
  }
  return {
    id: id,
    type: "M",
    coords: coord,
    prevSeg: prevSeg,
  };
}
export function createLSeg(
  id: string,
  coord: Coord | number[],
  prevSeg: SVGPathSegment
): BaseSVGPathSegment<"L"> {
  if (Array.isArray(coord)) {
    coord = {
      x: coord[0],
      y: coord[1],
    };
  }
  return {
    id: id,
    type: "L",
    coords: coord,
    prevSeg: prevSeg,
  };
}

export function createCSeg(
  id: string,
  coord: CoordTriplet | number[],
  prevSeg: SVGPathSegment
): BaseSVGPathSegment<"C"> {
  if (Array.isArray(coord)) {
    coord = {
      x1: coord[0],
      y1: coord[1],
      x2: coord[2],
      y2: coord[3],
       x: coord[4],
       y: coord[5],
    };
  }
  return {
    id: id,
    type: "C",
    coords: coord,
    prevSeg: prevSeg,
  };
}
