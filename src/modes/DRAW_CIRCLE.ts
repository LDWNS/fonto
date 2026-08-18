import { createSVGFrame } from "../framecreator";
import { pointerToSvgCoords } from "../helper";
import { createCircle } from "../shapes/circle";
import type {
  ClickInputHandler,
  Coord,
  KeydownInputHandler,
  MousemoveInputHandler,
} from "../types";
import type { Mode } from "../types/mode";

let currentCircle: SVGCircleElement | null = null;
let circles: SVGCircleElement[] = [];

const MOVE: MousemoveInputHandler = {
  type: "mousemove",
  validator: (e, _) => e.target instanceof SVGElement,
  handler: (e, s) => {
    if (!currentCircle) return;
    const rect = s.activeMainFrameMode.frame.getBoundingClientRect();
    const projCoords: Coord = pointerToSvgCoords(e, rect);
    currentCircle.update({
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
    if (!currentCircle) {
      currentCircle = createCircle({
        x1: projCoords.x,
        y1: projCoords.y,
        x2: projCoords.x,
        y2: projCoords.y,
      });
      s.activeMainFrameMode.frame.appendChild(currentCircle);
    } else {
      currentCircle!.update({
        x2: projCoords.x,
        y2: projCoords.y,
      });
      circles.push(currentCircle);
      currentCircle = null;
    }
  },
};
const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "Escape",
  desc: "switch mode -> NEUTRAL",
  handler: (_, s) => s.setActiveModeId("NEUTRAL"),
};

const frame = createSVGFrame();
export const DRAW_CIRCLE_MODE: Mode = {
  name: "DRAW_CIRCLE",
  frame: frame,
  events: {
    modeExit: (s) => {
      s.data["svg-canvas"] = (s.data["svg-canvas"] ?? []).concat(circles);
      circles = [];
    },
  },
  inputHandlers: [ESC, CLICK, MOVE],
  color: "#7f22fe",
};
