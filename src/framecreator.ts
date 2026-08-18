import DOMPurify from "dompurify";
export function createSVGFrame() {
  const frame = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  frame.setAttribute("id", "svg-canvas");
  frame.setAttribute("width", "500");
  frame.setAttribute("height", "500");
  frame.setAttribute("draggable", "false");
  return frame;
}
export function createTextAreaFrame() {
  // <textarea rows="30" cols="20" class="hidden"></textarea>
  const frame = document.createElement("textarea");
  frame.setAttribute("id", "text-area");
  frame.setAttribute("width", "500");
  frame.setAttribute("height", "500");
  frame.setAttribute("draggable", "false");
  return frame;
}
const timelineSVG = DOMPurify.sanitize(
  `<svg 
          id="timeline"
          xmlns="http://www.w3.org/2000/svg" width="420" height="15">
          <defs>
            <marker
              id="tick"
              viewBox="0 0 2 10"
              refX=".5"
              refY="5"
              markerUnits="strokeWidth"
              markerWidth="2"
              markerHeight="10"
            >
              <line x1="1" y1="0" x2="1" y2="10" stroke="#333"></line>
            </marker>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerUnits="strokeWidth"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <line x1="0" y1="0" x2="10" y2="5" stroke="#333"></line>
              <line x1="10" y1="5" x2="0" y2="10" stroke="#333"></line>
              <line x1="0" y1="5" x2="10" y2="5" stroke="#333"></line>
            </marker>
          </defs>
          <line 
            x1="0" 
            y1="8" 
            x2="420" 
            y2="8" 
            stroke="#333" 
            stroke-width="1.5px"
            marker-start="url(#tick)"
            marker-end="url(#arrow)"
            ></line>
          <text x="10" y="13" stroke="var(--background)" stroke-width="2px" style="font-weight: bold">Timeline</text>
          <text x="10" y="13" stroke="#333">Timeline</text>
        </svg>`,
  {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "style", "foreignObject"],
    FORBID_ATTR: ["xlink:href", "href"], // Only if you don't use <use> tags
    ADD_ATTR: ["id"], // SVGs heavily rely on IDs for masks, gradients, and defs
    RETURN_DOM: true,
  }
).firstChild as SVGElement;
const inputField = DOMPurify.sanitize(
  `<label id="animationDurationInput" class="hidden">
  <span class="hidden"> animation duration</span>
  <input type="number" name="animationDurationInput" value="1000">
  <span>ms</span>
</label>`,
  {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "foreignObject"],
    FORBID_ATTR: ["xlink:href", "href"], // Only if you don't use <use> tags
    ADD_ATTR: ["id", "class"], // SVGs heavily rely on IDs for masks, gradients, and defs
    RETURN_DOM: true,
  }
).firstChild as HTMLInputElement;
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
  timelineSVG.id = "timeline";
  div.appendChild(timelineSVG);
  div.appendChild(span);
  div.appendChild(inputField);
  return div;
}
