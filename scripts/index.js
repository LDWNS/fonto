import { SVGCircle, SVGLine } from "./classes.js";
import { Store } from "./globalstate.js";

const svg = document.querySelector("svg");
const modeSpan = document.querySelector("#mode");

const gs = new Store({ svg: svg });

let history = gs.state.history;
let currentPath = gs.state.currentPath;

gs.subscribe(() => {
  history = gs.state.history;
  currentPath = gs.state.currentPath;
});

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
      gs.setState({ currentPath: null });
      return;
    }
  }
  currentPath.draw({ x, y }, (item) => gs.save(item));
};
const drawCircle = (event) => {
  draw(event, (x, y) => {
    const temp = new SVGCircle(x, y, 4);
    gs.setState({ currentPath: temp });
    svg.appendChild(temp.circle);
  });
};
const drawLine = (event) => {
  draw(event, (x, y) => {
    const temp = new SVGLine(x, y);
    gs.setState({ currentPath: temp });
    svg.appendChild(temp.line);
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
          gs.setState({ currentPath: history[event.target.id] });
          updateMode("CIRCLE");
          break;
        case "line":
          gs.setState({ currentPath: history[event.target.id] });
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
        gs.remove(currentPath.id);
      }
      gs.setState({ currentPath: null });
      break;
    default:
      return;
  }
  updateMode(newMode ?? mode);
});
