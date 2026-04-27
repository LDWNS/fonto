import { Store } from "./globalstate.js";

const svg = document.querySelector("svg");

const { left, top } = svg.getBoundingClientRect();
const gs = new Store({ svg: svg, window: { left, top }, mode: "SELECT" });

let history = gs.state.history;
let currentPath = gs.state.currentPath;
const modes = gs.modes;
let mode = gs.state.mode;

gs.subscribe(() => {
  history = gs.state.history;
  currentPath = gs.state.currentPath;
  mode = gs.state.mode;
});

// Event Listeners
svg.addEventListener("click", (event) => modes[mode].do(event));
svg.addEventListener("mousedown", (event) => modes[mode].do(event));
svg.addEventListener("mousemove", (event) => modes[mode].do(event));
svg.addEventListener("mouseup", (event) => modes[mode].do(event));
svg.addEventListener("dblclick", (event) => modes[mode].do(event));
document.addEventListener("keydown", (event) => {
  let newMode;
  switch (event.key) {
    case "c":
      newMode = "CIRCLE";
      break;
    case "p":
      newMode = "PATH-DRAW";
      break;
    case "l":
      newMode = "LINE";
      break;
    case "m":
      newMode = "MOVE";
      break;
    case "s":
      newMode = "SELECT";
      break;
    case "w":
      svg.innerHTML = "";
      localStorage.clear();
      gs.setState({ currentPath: null, svg: svg });
      break;
    case "Backspace":
      if (mode === "SELECT") {
        return;
      }
      const x = svg.querySelector(`#${currentPath.id}`);
      svg.removeChild(x);
      gs.remove(currentPath.id);
      gs.setState({ currentPath: null });
      newMode = "SELECT";
      break;
  }
  if (newMode) {
    gs.setMode({ mode: newMode });
  } else {
    modes[mode].do(event);
  }
  if (currentPath) {
    currentPath.handleKeyEvent(event, (item) => gs.save(item));
  }
});
