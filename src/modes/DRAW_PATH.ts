import { pointerToSvgCoords } from "../helper";
import { createPath } from "../shapes/path";
import { createLine } from "../shapes/line";
import type {
  ClickInputHandler,
  Coord,
  KeydownInputHandler,
  MousemoveInputHandler,
} from "../types";
import type { Mode } from "../types/mode";
import { createSVGFrame } from "../framecreator";

let currentPath: SVGPathElement | null = null;
let paths: SVGPathElement[] = [];
let lastCoord: Coord;
let previewLine: SVGLineElement | null = null;

const MOVE: MousemoveInputHandler = {
  type: "mousemove",
  validator: (e, _) => e.target instanceof SVGElement,
  handler: (e, s) => {
    if (!currentPath) return;
    const rect = s.activeMainFrameMode.frame.getBoundingClientRect();
    const projCoords: Coord = pointerToSvgCoords(e, rect);
    if (previewLine && lastCoord) {
      previewLine.update({
        x1: lastCoord.x,
        y1: lastCoord.y,
        x2: projCoords.x,
        y2: projCoords.y,
      });
    }
  },
};
const CLICK: ClickInputHandler = {
  type: "click",
  desc: "draw",
  validator: (e, s) =>
    s.activeMainFrameMode.frame.contains(e.target as SVGElement),
  handler: (e, s) => {
    const rect = s.activeMainFrameMode.frame.getBoundingClientRect();
    const projCoords: Coord = pointerToSvgCoords(e, rect);
    if (!currentPath) {
      currentPath = createPath(projCoords);
      previewLine = createLine({
        x1: projCoords.x,
        y1: projCoords.y,
        x2: projCoords.x,
        y2: projCoords.y,
      });
      s.activeMainFrameMode.frame.appendChild(currentPath);
      s.activeMainFrameMode.frame.appendChild(previewLine);
      paths.push(currentPath);
      lastCoord = projCoords;
    } else {
      currentPath.update({
        x1: projCoords.x,
        y1: projCoords.y,
      });
      lastCoord = projCoords;
    }
  },
};
const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "Escape",
  desc: "switch mode -> NEUTRAL",
  handler: (_, s) => {
    if (currentPath) {
      currentPath = null;
    } else {
      s.setActiveModeId("NEUTRAL");
    }
  },
};

const frame = createSVGFrame();
export const DRAW_PATH_MODE: Mode = {
  name: "DRAW_PATH",
  frame: frame,
  events: {
    modeExit: (s) => {
      currentPath = null;
      s.data["svg-canvas"] = (s.data["svg-canvas"] ?? []).concat(paths);
      paths = [];
    },
  },
  inputHandlers: [ESC, CLICK, MOVE],
  color: "#229e7f",
};
