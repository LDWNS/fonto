import { Store } from "./globalstate.js";
import { Drawer } from "./modes/draw.js";
import { Tools } from "./modes/tool.js";
import { Editor } from "./modes/edit.js";

const svg = document.querySelector("svg");
const modeSpan = document.querySelector("#mode");

const { left, top } = svg.getBoundingClientRect();
const gs = new Store({ svg: svg, window: { left, top }, mode: "SELECT" });
const drawer = new Drawer(gs);
const tools = new Tools(gs);
const editor = new Editor(gs);

let history = gs.state.history;
let currentPath = gs.state.currentPath;
let mode = gs.state.mode;

const updateMode = (newMode) => {
  if (mode.includes("EDIT") && !newMode.includes("EDIT")) {
    editor.exitEditMode();
  }
  if (mode === "PATH" && newMode !== "PATH") {
    drawer.clearPreview();
  }
  gs.setState({ mode: newMode });
  modeSpan.innerHTML = `${mode}`;
  modeSpan.style.color = modes[newMode].style.color;
  modeSpan.style.fontWeight = "bold";
  if (newMode === "SELECT") {
    svg.classList = ["select-mode"];
  } else {
    svg.classList = [];
  }

  modes[mode].do({ type: "mode-change" });
};

const modes = {
  CIRCLE: { do: (event) => drawer.drawCircle(event), style: { color: "#206" } },
  "CIRCLE-EDIT": {
    do: (event) => editor.editCircle(event),
    style: { color: "#206" },
  },
  LINE: { do: (event) => drawer.drawLine(event), style: { color: "#920" } },
  "LINE-EDIT": {
    do: (event) => editor.editLine(event),
    style: { color: "#920" },
  },
  PATH: { do: (event) => drawer.drawPath(event), style: { color: "#699" } },
  "PATH-EDIT": {
    do: (event) => editor.editPath(event),
    style: { color: "#920" },
  },
  SELECT: {
    do: (event) =>
      tools.select(event, (newMode) => {
        updateMode(newMode);
        if (newMode === "LINE-EDIT") {
          editor.editLine(event);
        } else if (newMode === "CIRCLE-EDIT") {
          editor.editCircle(event);
        }
      }),
    style: { color: "#290" },
  },
  MOVE: { do: (event) => tools.move(event), style: { color: "#029" } },
};
updateMode("SELECT");
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
      newMode = "PATH";
      break;
    case "l":
      newMode = "LINE";
      break;
    case "m":
      newMode = "MOVE";
      break;
    case "s":
      newMode = "SELECT";
    case "Escape":
      if (mode.includes("-EDIT")) {
        newMode = "SELECT";
      }
      drawer.clearPreview();
      gs.setState({ currentPath: null });
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
  updateMode(newMode ?? mode);
  if (currentPath) {
    currentPath.handleKeyEvent(event, (item) => gs.save(item));
  }
});
