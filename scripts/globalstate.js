import { SVGCircle } from "./classes/circle.js";
import { SVGLine } from "./classes/line.js";
import { SVGPath } from "./classes/path.js";
import { Drawer } from "./modes/draw.js";
import { Tools } from "./modes/tool.js";
import { Editor } from "./modes/edit.js";
import { PathEditor } from "./modes/path-edit.js";

const loadHistory = (svg) => {
  const hydratedList = {};
  Object.entries(JSON.parse(localStorage.getItem("history") ?? "{}")).forEach(
    ([_, item]) => {
      let newItem;
      switch (item.type) {
        case "circle":
          newItem = SVGCircle.fromHistory(item);
          svg.appendChild(newItem.circle);
          break;
        case "line":
          newItem = SVGLine.fromHistory(item);
          svg.appendChild(newItem.line);
          break;
        case "path":
          newItem = SVGPath.fromHistory(item);
          svg.appendChild(newItem.path);
          break;
        default:
          break;
      }
      if (newItem) {
        hydratedList[newItem.id] = newItem;
      }
    }
  );
  return hydratedList;
};

class Store {
  constructor(initialState) {
    this.state = {
      ...initialState,
    };
    this.modeIds = {};
    Object.keys(this.modes).forEach(
      (k) => (this.modeIds[this.modes[k].id] = k)
    );
    this.state.history = loadHistory(this.state.svg);
    this.listeners = [];
    this.drawer = new Drawer(this);
    this.tools = new Tools(this);
    this.editor = new Editor(this);
    this.pathEditor = new PathEditor(this);
    this.#updateModeSpan();
  }

  modes = {
    CIRCLE: {
      id: 10,
      do: (event) => this.drawer.drawCircle(event),
      style: { color: "#206" },
    },
    "CIRCLE-EDIT": {
      id: 11,
      do: (event) => this.editor.editCircle(event),
      style: { color: "#206" },
    },
    LINE: {
      id: 5,
      do: (event) => this.drawer.drawLine(event),
      style: { color: "#920" },
    },
    "LINE-EDIT": {
      id: 6,
      do: (event) => this.editor.editLine(event),
      style: { color: "#920" },
    },
    "PATH-DRAW": {
      id: 2,
      do: (event) => this.pathEditor.edit(event),
      style: { color: "#699" },
    },
    "PATH-EDIT": {
      id: 1,
      do: (event) => this.pathEditor.edit(event),
      style: { color: "#920" },
    },
    SELECT: {
      id: 0,
      do: (event) => this.tools.select(event),
      style: { color: "#290" },
    },
    MOVE: {
      id: 3,
      do: (event) => this.tools.move(event),
      style: { color: "#029" },
    },
  };

  #updateModeSpan() {
    const modeSpan = document.querySelector("#mode");
    modeSpan.innerHTML = `${this.state.mode}`;
    modeSpan.style.color = this.modes[this.state.mode].style.color;
    modeSpan.style.fontWeight = "bold";
  }

  setMode = ({ id, mode }) => {
    if (id !== undefined) {
      mode = this.modeIds[id];
    } else if (mode) {
      id = this.modes[mode].id;
    }
    if (mode === "SELECT") {
      this.state.svg.classList = ["select-mode"];
    } else {
      this.state.svg.classList = [];
    }

    const exitPathMode =
      this.state.mode.includes("PATH") && !mode.includes("PATH");

    this.setState({ modeId: id, mode: mode });
    this.#updateModeSpan();
    if (exitPathMode) this.pathEditor.exit();
  };

  subscribe(listener) {
    this.listeners.push(listener);
  }

  unsubscribe(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener());
  }

  save = (item) => {
    if (item) {
      this.state.history[item.id] = item;
    }
    localStorage.setItem("history", JSON.stringify(this.state.history));
    this.listeners.forEach((listener) => listener());
  };

  remove = (id) => {
    if (id) {
      delete this.state.history[id];
    }
    localStorage.setItem("history", JSON.stringify(history));
    this.listeners.forEach((listener) => listener());
  };
}
export { Store };
