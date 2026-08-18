import type { App } from "../state";

declare global {
  interface SVGLineElement extends Editable {
    update({ x1, y1, x2, y2 }: CoordPair): void;
  }

  interface SVGCircleElement extends Editable {
    rx: number;
    ry: number;
    update({ x1, y1, x2, y2 }: CoordPair): void;
  }

  interface SVGPathElement extends Editable {
    update({ x1, y1, x2, y2 }: CoordPair): void;
    toggleSegmentType(state: App, editPoint: EditPoint): void;
    pathSegs?: SVGPathSegment[];
  }
}
interface Editable {
  getEditPoints(): EditPoint[];
  edit(editPoint: EditPoint, { x, y }: Coord, dx: number, dy: number): void;
  getAnimationAttributes(
    animationAttributes?: AnimationAttributes
  ): AnimationAttributes;
}
export type AnimationAttributes =
  | SVGLineAnimationAttributes
  | SVGCircleAnimationAttributes
  | SVGPathAnimationAttributes;
export interface SVGLineAnimationAttributes {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  initX1: string;
  initY1: string;
  initX2: string;
  initY2: string;
  attributes: NamedNodeMap;
  createAnimation(duration: string): SVGElement;
}
export interface SVGCircleAnimationAttributes {
  cx: string;
  cy: string;
  r: string;
  initCx: string;
  initCy: string;
  initR: string;
  attributes: NamedNodeMap;
  createAnimation(duration: string): SVGElement;
}
export interface SVGPathAnimationAttributes {
  d: string;
  initD: string;
  createAnimation(duration: string): SVGElement;
}
export type EditableSVGElement =
  | SVGLineElement
  | SVGCircleElement
  | SVGPathElement;

export enum EditPointType {
  LINE_1,
  LINE_2,
  CIRCLE_1,
  CIRCLE_2,
  PATH_1,
  PATH_A1,
  PATH_A2,
}

export interface EditPoint extends SVGCircleElement {
  type: EditPointType;
  targetId: string;
  anchorPoint?: EditPoint;
  anchoredPoints?: EditPoint[];
  anchorLine?: SVGLineElement;
  blindAnchorPoint?: EditPoint;
  blindAnchoredPoints?: EditPoint[];
  nextEditPoint?: EditPoint;
  prevEditPoint?: EditPoint;
  addAnchoredPoint(editPoint: EditPoint, blind?: boolean): EditPoint;
  updateAnchoredPoints(dx: number, dy: number): EditPoint;
  linkPrev(editPoint?: EditPoint): EditPoint;
  setAnchorPoint(editPoint: EditPoint, blind?: boolean): EditPoint;
  toggleAnchorLine(): EditPoint;
  x(): number;
  y(): number;
}

export type SVGPathSegment = {
  [K in keyof SVGPathSegmentType]: BaseSVGPathSegment<K>;
}[keyof SVGPathSegmentType];

export interface BaseSVGPathSegment<K extends keyof SVGPathSegmentType> {
  id: string;
  type: K;
  coords: SVGPathSegmentType[K];
  prevSeg: SVGPathSegment;
}

interface SVGPathSegmentType {
  M: Coord;
  L: Coord;
  C: CoordTriplet;
}

export type CoordTriplet = {
  x: number;
  y: number;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
};

export type CoordPair = {
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
};

export type Coord = {
  x: number;
  y: number;
};
