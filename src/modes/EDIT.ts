import { createSVGFrame } from "../framecreator";
import {
  isEditableSVGElement,
  isEditPoint,
  pointerToSvgCoords,
} from "../helper";
import {
  type KeydownInputHandler,
  type MousemoveInputHandler,
  type EditPoint,
  type MousedownInputHandler,
  type EditableSVGElement,
  type MouseupInputHandler,
  type DblClickInputHandler,
} from "../types";
import { EditPointType } from "../types/geometry";
import type { Mode } from "../types/mode";

let movingPoint: EditPoint | null;
let currentPath: EditableSVGElement | null;

const MOVE: MousemoveInputHandler = {
  type: "mousemove",
  validator: (e, _) =>
    e.target instanceof SVGElement && !!currentPath && !!movingPoint,
  handler: (e, s) => {
    const rect = s.activeMainFrameMode.frame.getBoundingClientRect();
    const { x, y } = pointerToSvgCoords(e, rect);
    const dx = x - movingPoint!.cx.baseVal.value;
    const dy = y - movingPoint!.cy.baseVal.value;
    movingPoint!.update({ x1: x, y1: y });
    movingPoint!.updateAnchoredPoints(dx, dy);
    currentPath!.edit(movingPoint!, { x, y }, dx, dy);
    if (movingPoint!.anchorLine) {
      movingPoint!.anchorLine.update({ x2: x, y2: y });
    }
    return;
  },
};
const mousedown: MousedownInputHandler = {
  type: "mousedown",
  validator: (e, _) => isEditPoint(e.target),
  handler: (e, _) => {
    movingPoint = e.target as EditPoint;
    const [id, __] = movingPoint.targetId.split("-");
    currentPath = document.querySelector("#" + id) as EditableSVGElement;
  },
};
const mouseup: MouseupInputHandler = {
  type: "mouseup",
  validator: (e, _) =>
    e.target instanceof SVGElement && !!currentPath && !!movingPoint,
  handler: (_, __) => {
    movingPoint = null;
    currentPath = null;
  },
};

const dblclick: DblClickInputHandler = {
  type: "dblclick",
  validator: (e, _) =>
    isEditPoint(e.target) && e.target.type === EditPointType.PATH_1,
  handler: (e, s) => {
    const ep = e.target as EditPoint;
    const [id, __] = ep.targetId.split("-");
    (document.querySelector("#" + id) as SVGPathElement).toggleSegmentType(
      s,
      ep
    );
  },
};

const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "Escape",
  desc: "switch mode -> NEUTRAL",
  handler: (_, s) => s.setActiveModeId("NEUTRAL"),
};
const s: KeydownInputHandler = {
  type: "keydown",
  keyCode: "s",
  desc: "switch mode -> SELECT",
  handler: (_, s) => s.setActiveModeId("SELECT"),
};

const frame = createSVGFrame();
export const EDIT_MODE: Mode = {
  name: "EDIT",
  frame: frame,
  events: {
    modeEnter: (s) => {
      let editNodes = s.activeMainFrameMode.frame.childNodes
        .entries()
        .filter(([_, node]) => isEditableSVGElement(node))
        .map(([_, node]) => node as EditableSVGElement)
        .toArray();
      if (s.selectedNodes.length > 0) {
        editNodes = s.selectedNodes;
      }
      editNodes.forEach((node) => {
        const x = node.getEditPoints();
        x.forEach((ep) => {
          s.activeMainFrameMode.frame.appendChild(ep);
          if (ep.anchorLine) {
            s.activeMainFrameMode.frame.appendChild(ep.anchorLine);
          }
        });
      });
    },
    modeExit: (s) => {
      const nodes = s.activeMainFrameMode.frame.querySelectorAll("[data-edit]");
      if (nodes) nodes.forEach((n) => n.remove());
      movingPoint = null;
      currentPath = null;
    },
  },
  inputHandlers: [ESC, s, mousedown, MOVE, mouseup, dblclick],
  color: "#cc7704",
};
