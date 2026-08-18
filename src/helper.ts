import type { EditableSVGElement, EditPoint } from "./types";
import type { SVGPathSegment } from "./types/geometry";

const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};
function pointerToSvgCoords<P extends MouseEvent>(
  { clientX, clientY }: P,
  { left, top }: DOMRect
) {
  return { x: clientX - left, y: clientY - top };
}

function isEditPoint(item: any): item is EditPoint {
  // Check if it's a circle AND has your specific CSS class
  return item instanceof SVGCircleElement && !!item.getAttribute("data-edit");
}
function isEditableSVGElement(item: any): item is EditableSVGElement {
  return item instanceof SVGElement && "getEditPoints" in item;
}

const eventToKeyCode = ({
  key,
  metaKey,
  altKey,
  ctrlKey,
  shiftKey,
}: KeyboardEvent) => {
  let prefix = "";
  if (metaKey) prefix += "m-";
  if (altKey) prefix += "a-";
  if (ctrlKey) prefix += "c-";
  if (shiftKey) prefix += "s-";
  return `${prefix}${key.toLowerCase()}`;
};

const toastEl = document.querySelector("p#toast") as HTMLElement;
function toast(mes: string) {
  if (toastEl) {
    toastEl.innerText = mes;
    toastEl.style.top = "0rem";
    setTimeout(() => {
      toastEl.innerHTML = "";
      toastEl.style.top = "-2rem";
    }, 2000);
  }
}
const inputEl = document.querySelector("p#input") as HTMLElement;
function logInput(mes: string) {
  if (inputEl) {
    const child = document.createElement("span");
    child.innerText = mes;
    inputEl.appendChild(child);
    setTimeout(() => {
      inputEl.removeChild(child);
    }, 700);
  }
}

function pathSegmentToString(ps: SVGPathSegment): string {
  switch (ps.type) {
    case "M":
    case "L":
      return `${ps.type} ${ps.coords.x} ${ps.coords.y}`;
    case "C":
      return `${ps.type} ${ps.coords.x1} ${ps.coords.y1} ${ps.coords.x2} ${ps.coords.y2} ${ps.coords.x} ${ps.coords.y}`;
  }
}
function createAnimateNode(attributeName: string, values: string, duration: string) {
  const animateNode = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animate"
  );
  animateNode.setAttribute("attributeName", attributeName);
  animateNode.setAttribute("values", values);
  animateNode.setAttribute("dur", duration);
  animateNode.setAttribute("repeatCount", "indefinite");
  return animateNode;
}

export {
  uid,
  distance,
  pointerToSvgCoords,
  eventToKeyCode,
  toast,
  logInput,
  isEditPoint,
  isEditableSVGElement,
  pathSegmentToString,
  createAnimateNode
};
