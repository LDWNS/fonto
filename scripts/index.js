import { Store } from "./globalstate.js";

const canvas = document.querySelector("svg#canvas");
const timeline = document.querySelector("svg#timeline");

const { left, top } = canvas.getBoundingClientRect();
const gs = new Store({
  canvas: { window: { left, top }, svg: canvas },
  timeline: { window: timeline.getBoundingClientRect(), svg: timeline },
  mode: "SELECT",
});

let history = gs.state.history;
let currentPath = gs.state.currentPath;
const modes = gs.modes;
let mode = gs.state.mode;

gs.subscribe(() => {
  history = gs.state.history;
  currentPath = gs.state.currentPath;
  mode = gs.state.mode;
});

timeline.addEventListener("click", (event) => gs.timeline.edit(event));
timeline.addEventListener("mousedown", (event) => gs.timeline.edit(event));
timeline.addEventListener("mousemove", (event) => gs.timeline.edit(event));
timeline.addEventListener("mouseup", (event) => gs.timeline.edit(event));

// Event Listeners
canvas.addEventListener("click", (event) => modes[mode].do(event));
canvas.addEventListener("mousedown", (event) => modes[mode].do(event));
canvas.addEventListener("mousemove", (event) => modes[mode].do(event));
canvas.addEventListener("mouseup", (event) => modes[mode].do(event));
canvas.addEventListener("dblclick", (event) => modes[mode].do(event));
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
      canvas.innerHTML = "";
      localStorage.clear();
      gs.setState({ currentPath: null, svg: canvas });
      break;
    case "Backspace":
      if (mode === "SELECT") {
        return;
      }
      const x = canvas.querySelector(`#${currentPath.id}`);
      canvas.removeChild(x);
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
    currentPath.handleKeyEvent(event);
  }
});
