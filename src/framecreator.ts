import { dispatchUpdateAttribute, uid } from "./helper";
import type { Coord, CoordPair } from "./types";
import type { EditableAttributeList } from "./elements/EditableAttributeList";
import { createLine } from "./shapes/line";
export function createSVGFrame() {
  const frame = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  frame.setAttribute("id", "svg-canvas");
  frame.setAttribute("width", "500");
  frame.setAttribute("height", "500");
  frame.setAttribute("draggable", "false");

  return frame;
}
export function createRightContainer() {
  const frame = document.createElement("div");
  return frame;
}
export function createRightContainerElement(id: string) {
  const frame = document.createElement("div");
  frame.setAttribute("id", "rce-" + id);
  return frame;
}
export function createTextAreaFrame() {
  const frame = document.createElement("textarea");
  frame.setAttribute("id", "text-area");
  frame.setAttribute("width", "500");
  frame.setAttribute("height", "500");
  frame.setAttribute("draggable", "false");
  return frame;
}
function createMarker(id: string, attributes: string[], lines: CoordPair[]) {
  const marker = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "marker"
  );
  marker.id = id;
  for (let i = 0; i < attributes.length; i += 2) {
    const key = attributes[i];
    const value = attributes[i + 1];
    marker.setAttribute(key, value);
  }
  lines.forEach((line) => {
    const lineEl = createLine(line);
    lineEl.setAttribute("stroke-width", "1px");
    marker.append(lineEl);
  });
  return marker;
}
const tickMarker = createMarker(
  "tick",
  [
    "viewBox",
    "0 0 2 10",
    "refX",
    "1",
    "refY",
    "5",
    "markerUnits",
    "strokeWidth",
    "markerWidth",
    "2",
    "markerHeight",
    "10",
  ],
  [{ x1: 1, y1: 0, x2: 1, y2: 10 }]
);
const arrowMarker = createMarker(
  "arrow",
  [
    "viewBox",
    "0 0 10 10",
    "refX",
    "5",
    "refY",
    "5",
    "markerUnits",
    "strokeWidth",
    "markerWidth",
    "10",
    "markerHeight",
    "10",
  ],
  [
    { x1: 0, y1: 5, x2: 10, y2: 5 },
    { x1: 10, y1: 5, x2: 0, y2: 10 },
    { x1: 0, y1: 0, x2: 10, y2: 5 },
  ]
);
export function createTimelineSVG() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "timeline";
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.append(tickMarker, arrowMarker);
  const line = createLine({ x1: 5, y1: 8, x2: 415, y2: 8 });
  line.setAttribute("stroke", "#333");
  line.setAttribute("stroke-width", "1.5px");
  line.setAttribute("marker-start", "url(#tick)");
  line.setAttribute("marker-end", "url(#arrow)");
  svg.append(defs, line);
  return svg;
}
function createInputField(type: string, name: string, value = "") {
  const input = document.createElement("input");
  input.id = name;
  input.type = type;
  input.name = name;
  input.value = value;
  return input;
}
function createSpan(text: string) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}
function createLabel(text: string, link: string) {
  const label = document.createElement("label");
  label.setAttribute("for", link);
  const span = createSpan(text);
  label.appendChild(span);
  return label;
}
export function createTimelineFrame(duration: number) {
  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.flexDirection = "row";
  div.style.width = "500px";
  div.style.alignItems = "center";
  div.style.justifyContent = "space-between";
  const span = document.createElement("span");
  span.id = "animationDuration";
  span.innerText = `${duration}ms`;
  div.appendChild(createTimelineSVG());
  div.appendChild(span);
  const inputField = createInputField(
    "number",
    "animationDurationInput",
    "2000"
  );
  const label = createLabel("ms", "animationDurationInput");
  label.className = "hidden";
  label.prepend(inputField);
  div.appendChild(label);
  return div;
}
export function createText(initCoord: Coord) {
  let text = document.createElementNS("http://www.w3.org/2000/svg", "text");

  text.id = uid();
  text.setAttribute("x", `${initCoord.x}`);
  text.setAttribute("y", `${initCoord.y}`);
  text.setAttribute("stroke", "#333");
  text.setAttribute("fill", "#333");

  return text;
}

export function createEditableListItem(
  ela: EditableAttributeList,
  id: string,
  name: string,
  value: string
) {
  const li = document.createElement("li");
  const isPinned =
    name.match(/x\d/) != null || name.match(/y\d/) != null || name === "r";
  const isAnimated = ela.activated.includes(name);
  if (isPinned) {
    const col3 = document.createElement("span");
    col3.className = "col-3";
    col3.innerText = value;
    ela.relatedAttributes.set(name, col3);
    li.append(col3);
  } else {
    li.innerHTML = `<edit-word class="col-3" data-id="${id}" data-key="${name}" data-animate="${isAnimated}" data-value>${value}</edit-word>`;
  }
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "col-1";
  checkbox.name = `${id}-${name}`;
  checkbox.id = `${id}-${name}`;
  checkbox.checked = isAnimated;
  checkbox.dataset.value = value;
  checkbox.disabled = !ela.activatable || isPinned;
  checkbox.addEventListener("change", (_) => {
    dispatchUpdateAttribute(checkbox, id, name, value, checkbox.checked);
  });
  const label = document.createElement("label");
  label.className = "col-2";
  label.setAttribute("for", `${id}-${name}`);
  label.innerText = name + ": ";

  li.prepend(checkbox, label);
  return li;
}
