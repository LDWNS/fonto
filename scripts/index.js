import { SVGCircle } from "./classes.js";
import { SVGLine } from "./classes.js";
import { Store } from "./globalstate.js";

const svg = document.querySelector("svg");
const modeSpan = document.querySelector("#mode");

const globalState = new Store({ svg: svg });

const save = (item) => {
  if (item) {
    history[item.id] = item;
  }
  localStorage.setItem("history", JSON.stringify(history));
};
const history = loadHistory();

let currentPath = null;

const { left, top } = svg.getBoundingClientRect();
const clickToCanvasCoords = ({ clientX, clientY }) => {
  return { x: clientX - left, y: clientY - top };
};
const draw = (event, objCreator) => {
  let toggle = event.type === "click";
  if (!toggle && !currentPath) {
    return;
  }
  const { x, y } = clickToCanvasCoords(event);
  if (toggle) {
    if (!currentPath) {
      objCreator(x, y);
    } else {
      currentPath = null;
      return;
    }
  }
  currentPath.draw({ x, y }, save);
};
const drawCircle = (event) => {
  draw(event, (x, y) => {
    currentPath = new SVGCircle(x, y, 4);
    svg.appendChild(currentPath.circle);
  });
};
const drawLine = (event) => {
  draw(event, (x, y) => {
    currentPath = new SVGLine(x, y);
    svg.appendChild(currentPath.line);
  });
};
const updateMode = (newMode) => {
  mode = newMode;
  modeSpan.innerHTML = `${mode}`;
  modeSpan.style.color = modes[newMode].style.color;
  modeSpan.style.fontWeight = "bold";
};
const select = (event) => {
  switch (event.type) {
    case "click":
      switch (event.target.nodeName) {
        case "circle":
          currentPath = history[event.target.id];
          updateMode("CIRCLE");
          break;
        case "line":
          currentPath = history[event.target.id];
          updateMode("LINE");
          break;

        default:
          break;
      }
      break;
    default:
      break;
  }
};
const modes = {
  CIRCLE: { do: drawCircle, style: { color: "#206" } },
  LINE: { do: drawLine, style: { color: "#920" } },
  // "CIRCLE-EDIT": { do: editCircle, style: { color: "#206" } },
  // "LINE-EDIT": { do: editLine, style: { color: "#920" } },
  SELECT: { do: select, style: { color: "#290" } },
};
let mode;
updateMode("CIRCLE");
modeSpan.innerHTML = mode;
svg.addEventListener("click", (event) => modes[mode].do(event));
svg.addEventListener("mousemove", (event) => modes[mode].do(event));
document.addEventListener("keydown", (event) => {
  let newMode;
  switch (event.key) {
    case "c":
      newMode = "CIRCLE";
      svg.classList = [];
      break;
    case "l":
      newMode = "LINE";
      svg.classList = [];
      break;
    case "s":
      newMode = "SELECT";
      svg.classList = ["select-mode"];
      break;
    case "Escape":
      if (mode !== "SELECT") {
        const x = svg.querySelector(`#${currentPath.id}`);
        svg.removeChild(x);
        delete history[currentPath.id];
        save();
      }
      currentPath = null;
      break;
    default:
      return;
  }
  updateMode(newMode ?? mode);
});
