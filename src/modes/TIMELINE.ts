import { createTimelineFrame } from "../framecreator";
import {
  isEditableSVGElement,
  isEditPoint,
  pointerToSvgCoords,
  toast,
  uid,
} from "../helper";
import { setCircleMethods } from "../shapes/circle";
import { createEditPoint } from "../shapes/editpoint";
import { setLineMethods } from "../shapes/line";
import { setPathMethods } from "../shapes/path";
import type {
  ClickInputHandler,
  Coord,
  DblClickInputHandler,
  EditableSVGElement,
  EditPoint,
  KeydownInputHandler,
  Mode,
  MousedownInputHandler,
  MousemoveInputHandler,
  MouseupInputHandler,
  TimeLineFrame,
} from "../types";
import { EditPointType } from "../types/geometry";

let currentKeyframe: TimeLineFrame;
const keyframes: TimeLineFrame[] = [];
const toggleDurationInput = () => {
  const animationDurationDisplay = frame.querySelector("#animationDuration");
  const animationDurationInput = frame.querySelector("#animationDurationInput");
  animationDurationDisplay?.classList.toggle("hidden");
  const inputHidden = animationDurationInput?.classList.toggle("hidden");
  if (!inputHidden && animationDurationInput) {
    (animationDurationInput as HTMLElement).focus();
  }
};
let movingPoint: EditPoint | null;

const MOVE: MousemoveInputHandler = {
  type: "mousemove",
  desc: "move keyframe",
  validator: (e, _) => e.target instanceof SVGElement && !!movingPoint,
  handler: (e, s) => {
    const rect = s.activeMainFrameMode.frame.getBoundingClientRect();
    currentKeyframe.update(pointerToSvgCoords(e, rect));
    return;
  },
};
const mousedown: MousedownInputHandler = {
  type: "mousedown",
  validator: (e, s) =>
    isEditPoint(e.target) &&
    s.activeMainFrameMode.name === "NEUTRAL",
  handler: (e, s) => {
    saveState(s.activeMainFrameMode);
    currentKeyframe.point.classList.remove("active");
    movingPoint = e.target as EditPoint;
    currentKeyframe = keyframes.find((k) => k.id === movingPoint!.targetId)!;
    currentKeyframe.point.classList.add("active");
    s.activeMainFrameMode.frame.textContent = "";
    currentKeyframe.children.forEach((child) =>
      s.activeMainFrameMode.frame.appendChild(child)
    );
    s.data["svg-canvas"] = currentKeyframe.children;
    s.data["bottom-bar"] = { duration: duration, keyframes: keyframes };
  },
};
const mouseup: MouseupInputHandler = {
  type: "mouseup",
  validator: (e, s) =>
    e.target instanceof SVGElement &&
    !!movingPoint &&
    (s.activeMainFrameMode.name === "NEUTRAL" ||
      !toast("Mode must be NEUTRAL to edit timeline.")),
  handler: (_, __) => {
    movingPoint = null;
  },
};

const doubleClick: DblClickInputHandler = {
  type: "dblclick",
  desc: "add keyframe",
  validator: (e, s) =>
    e.target instanceof SVGElement &&
    s.activeMainFrameMode.name === "NEUTRAL",
  handler: (e, s) => {
    const projCoords = pointerToSvgCoords(
      e,
      s.activeBottomBarMode.frame.getBoundingClientRect()
    );
    const newChildren: EditableSVGElement[] = saveState(s.activeMainFrameMode);
    currentKeyframe.point.classList.remove("active");
    currentKeyframe = createKeyframePoint(
      projCoords.x,
      s.activeBottomBarMode,
      newChildren
    );
    currentKeyframe.point.classList.add("active");
    s.activeMainFrameMode.frame.textContent = "";
    currentKeyframe.children.forEach((child) =>
      s.activeMainFrameMode.frame.appendChild(child)
    );
    s.data["svg-canvas"] = currentKeyframe.children;
    s.data["bottom-bar"] = { duration: duration, keyframes: keyframes };
  },
};
const CLICK: ClickInputHandler = {
  type: "click",
  validator: (e, s) =>
    !isEditPoint(e.target) &&
    (s.activeMainFrameMode.name === "NEUTRAL" ||
      !toast("Mode must be NEUTRAL to edit timeline.")),
  handler: (e, _) => {
    if ((e.target as HTMLElement).id === "animationDuration") {
      toggleDurationInput();
      return;
    }
  },
};
function saveState(m: Mode) {
  const oldChildren: EditableSVGElement[] = [];
  const newChildren: EditableSVGElement[] = [];
  m.frame.childNodes.forEach((node) => {
    oldChildren.push(node as EditableSVGElement);
    let clone = node.cloneNode(true) as EditableSVGElement;
    switch ((clone as SVGElement).tagName.toLowerCase()) {
      case "line":
        clone = setLineMethods(clone as SVGLineElement);
        break;
      case "circle":
        clone = setCircleMethods(clone as SVGCircleElement);
        clone.rx = (node as SVGCircleElement).rx;
        clone.ry = (node as SVGCircleElement).ry;
        break;
      case "path":
        clone = setPathMethods(clone as SVGPathElement);
        break;
      default:
        toast(
          `Tag not supported by TIMELINE: <${(clone as SVGElement).tagName}>`
        );
    }
    if (isEditableSVGElement(clone)) {
      newChildren.push(clone);
    }
  });
  currentKeyframe.children = oldChildren;
  return newChildren;
}
const ENTER: KeydownInputHandler = {
  type: "keydown",
  keyCode: "Enter",
  validator: (e, _) => e.target instanceof HTMLInputElement,
  handler: (e, s) => {
    duration = parseInt((e.target as HTMLInputElement).value);
    if (s.data["bottom-bar"]) {
      s.data["bottom-bar"].duration = duration;
    }
    (
      document.querySelector("#animationDuration") as HTMLElement
    ).innerText = `${duration}ms`;
    toggleDurationInput();
    keyframes.forEach((k) => k.update());
  },
};
const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "esc",
  validator: (e, _) => e.target instanceof HTMLInputElement,
  handler: (e, __) => {
    (e.target as HTMLInputElement).value = `${duration}`;
    toggleDurationInput();
  },
};
const createKeyframePoint = (
  x: number,
  mode: Mode,
  children: EditableSVGElement[]
) => {
  const svg = mode.frame.querySelector("svg");
  const ep = createEditPoint(EditPointType.TIMELINE, uid(), { x: x, y: 8 }, 4);
  ep.id = ep.targetId;
  ep.classList.add("point");
  svg?.appendChild(ep);
  ep.toggleAnchorText("");
  svg?.appendChild(ep.anchorText!);
  const point: TimeLineFrame = {
    id: ep.id,
    x: x,
    point: ep,
    children: children,
    update: function (this: TimeLineFrame, projCoords?: Coord) {
      if (projCoords) {
        const clampedX = clampX(projCoords.x);
        this.x = clampedX - 5;
        this.point.update({ x1: clampedX });
      }
      this.point.anchorText!.textContent = `${mapCoordsToTimeline(this.x)}`;
      this.point.anchorText?.setAttribute(
        "x",
        `${this.x + 5 - 3 * this.point.anchorText!.textContent.length}`
      );
    },
  };
  keyframes.push(point);
  point.update({ x: x, y: 8 });
  return point;
};

function clampX(x: number) {
  return Math.min(Math.max(x, 5), 420);
}
function mapCoordsToTimeline(x: number) {
  return Math.round((x / 415) * duration);
}

let duration = 5000;
const frame = createTimelineFrame(duration);
export const TIMELINE: Mode = {
  name: "TIMELINE",
  frame: frame,
  inputHandlers: [CLICK, ENTER, ESC, mousedown, mouseup, MOVE, doubleClick],
  events: {
    preModeInteract(s) {
      if (s.activeMainFrameMode.name !== "NEUTRAL") {
        toast("Be in NEUTRAL before editing the timeline.");
        return false;
      }
      return true;
    },
    modeEnter(s) {
      currentKeyframe = createKeyframePoint(5, s.activeBottomBarMode, []);
      currentKeyframe.point.classList.add("active");
    },
  },
};
