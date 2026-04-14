import { Store } from "./globalstate.js";
import { Drawer } from "./modes/draw.js";
import { Selector } from "./modes/select.js";
import { Editor } from "./modes/edit.js";

const svg = document.querySelector("svg");
const modeSpan = document.querySelector("#mode");

const { left, top } = svg.getBoundingClientRect();
const gs = new Store({ svg: svg, window: { left, top }, mode: "CIRCLE" });
const drawer = new Drawer(gs);
const selector = new Selector(gs);
const editor = new Editor(gs);

let history = gs.state.history;
let currentPath = gs.state.currentPath;
let mode = gs.state.mode;

const updateMode = (newMode) => {
  gs.setState({ mode: newMode });
  modeSpan.innerHTML = `${mode}`;
  modeSpan.style.color = modes[newMode].style.color;
  modeSpan.style.fontWeight = "bold";
  if (newMode === "SELECT") {
    svg.classList = ["select-mode"];
  } else {
    svg.classList = [];
  }
};

const modes = {
  CIRCLE: { do: (event) => drawer.drawCircle(event), style: { color: "#206" } },
  LINE: { do: (event) => drawer.drawLine(event), style: { color: "#920" } },
  // "CIRCLE-EDIT": { do: editCircle, style: { color: "#206" } },
  "LINE-EDIT": {
    do: (event) => editor.editLine(event),
    style: { color: "#920" },
  },
  SELECT: {
    do: (event) => selector.select(event, updateMode),
    style: { color: "#290" },
  },
};
updateMode("CIRCLE");
gs.subscribe(() => {
  history = gs.state.history;
  currentPath = gs.state.currentPath;
  mode = gs.state.mode;
});

// Event Listeners
svg.addEventListener("click", (event) => modes[mode].do(event));
svg.addEventListener("mousemove", (event) => modes[mode].do(event));
document.addEventListener("keydown", (event) => {
  let newMode;
  switch (event.key) {
    case "c":
      newMode = "CIRCLE";
      break;
    case "l":
      newMode = "LINE";
      break;
    case "s":
      newMode = "SELECT";
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
