import { createSVGFrame } from "../framecreator";
import { pointerToSvgCoords } from "../helper";
import { ESC } from "../keyhelper";
import { createLine } from "../shapes/line";
import type {
  ClickInputHandler,
  Coord,
  MousemoveInputHandler,
} from "../types";
import type { Mode } from "../types/mode";
import { EDIT_MODE } from "./EDIT";

let currentLine: SVGLineElement | null = null;
let lines: SVGLineElement[] = [];

const MOVE: MousemoveInputHandler = {
  type: "mousemove",
  validator: (e, _) => e.target instanceof SVGElement,
  handler: (e, s) => {
    if (!currentLine) return;
    const rect = s.activeMainFrameMode.frame.getBoundingClientRect();
    const projCoords: Coord = pointerToSvgCoords(e, rect);
    currentLine.update({
      x2: projCoords.x,
      y2: projCoords.y,
    });
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
    if (!currentLine) {
      currentLine = createLine({
        x1: projCoords.x,
        y1: projCoords.y,
        x2: projCoords.x,
        y2: projCoords.y,
      });
      s.activeMainFrameMode.frame.appendChild(currentLine);
    } else {
      currentLine!.update({
        x2: projCoords.x,
        y2: projCoords.y,
      });
      lines.push(currentLine);
      currentLine = null;
    }
  },
};
const frame = createSVGFrame();
export const DRAW_LINE_MODE: Mode = {
  name: "DRAW_LINE",
  frame: frame,
  modeKey: "l",
  events: {
    modeExit: (s) => {
      s.data["svg-canvas"] = (s.data["svg-canvas"] ?? []).concat(lines);
      lines = [];
    },
  },
  inputHandlers: [ESC, CLICK, MOVE],
  subModes: [EDIT_MODE],
};
