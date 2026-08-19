import { createTimelineFrame } from "../framecreator";
import { isEditableSVGElement, pointerToSvgCoords, toast } from "../helper";
import { createCircle, setCircleMethods } from "../shapes/circle";
import { setLineMethods } from "../shapes/line";
import { setPathMethods } from "../shapes/path";
import type {
  ClickInputHandler,
  EditableSVGElement,
  KeydownInputHandler,
  Mode,
  TimeLineFrame,
} from "../types";

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
const CLICK: ClickInputHandler = {
  type: "click",
  validator: (e, s) =>
    s.activeBottomBarMode.frame.contains(e.target as SVGElement | HTMLElement),
  handler: (e, s) => {
    if ((e.target as HTMLElement).id === "animationDuration") {
      toggleDurationInput();
      return;
    }
    if (e.target instanceof SVGCircleElement) {
      saveState(s.activeMainFrameMode);
      currentKeyframe.point.classList.remove("active");
      currentKeyframe = keyframes.find(
        (k) => k.id === (e.target as SVGCircleElement).id
      )!;
    } else if (e.target instanceof SVGElement) {
      const projCoords = pointerToSvgCoords(
        e,
        s.activeBottomBarMode.frame.getBoundingClientRect()
      );
      const newChildren: EditableSVGElement[] = saveState(
        s.activeMainFrameMode
      );
      currentKeyframe.point.classList.remove("active");
      currentKeyframe = createKeyframePoint(
        projCoords.x,
        s.activeBottomBarMode,
        newChildren
      );
    }
    currentKeyframe.point.classList.add("active");
    s.activeMainFrameMode.frame.textContent = "";
    currentKeyframe.children.forEach((child) =>
      s.activeMainFrameMode.frame.appendChild(child)
    );
    s.data["svg-canvas"] = currentKeyframe.children;
    s.data["bottom-bar"] = { duration: duration, keyframes: keyframes };
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
  },
};
const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "Escape",
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
  const circle = createCircle({
    x1: x,
    y1: 8,
    x2: x + 3,
    y2: 11,
  });
  circle.classList.add("point");
  svg?.appendChild(circle);
  const point: TimeLineFrame = {
    id: circle.id,
    x: x,
    point: circle,
    children: children,
  };
  keyframes.push(point);
  return point;
};

let duration = 5000;
const frame = createTimelineFrame(duration);
export const TIMELINE: Mode = {
  name: "TIMELINE",
  frame: frame,
  inputHandlers: [CLICK, ENTER, ESC],
  events: {
    modeEnter(s) {
      currentKeyframe = createKeyframePoint(0, s.activeBottomBarMode, []);
      currentKeyframe.point.classList.add("active");
    },
  },
};
