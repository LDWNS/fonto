import { SVGCircle } from "./classes/circle.js";
import { SVGLine } from "./classes/line.js";
import { SVGPath } from "./classes/path.js";
import { Drawer } from "./modes/draw.js";
import { Tools } from "./modes/tool.js";
import { Editor } from "./modes/edit.js";
import { PathEditor } from "./modes/path-edit.js";
import { TimeLine } from "./classes/timeline.js";

class Store {
  constructor(initialState) {
    this.state = {
      ...initialState,
    };
    this.modeIds = {};
    Object.keys(this.modes).forEach(
      (k) => (this.modeIds[this.modes[k].id] = k)
    );

    this.listeners = [];

    this.drawer = new Drawer(this);
    this.tools = new Tools(this);
    this.editor = new Editor(this);
    this.pathEditor = new PathEditor(this);
    this.#updateModeSpan();
    this.timeline = new TimeLine(this);

    this.state.frames = {};
    // todo: add all points, sets frames & activePoints
    this.#loadFrame(this.state.canvas.svg);

    const firstKey = Object.keys(this.state.frames)[0];
    if (!firstKey) {
      const point = this.timeline.addPoint().setAttribute("fill", "#333");
      this.state.frames[point.id] = {};
      this.state.activeFrame = {};
    } else {
      this.state.activeFrame = this.state.frames[firstKey];
    }
    this.timeline.draw();
    Object.values(this.state.activeFrame).forEach((path) =>
      this.state.canvas.svg.appendChild(path.node)
    );
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
    VIEW: {
      id: 8,
      do: (event) => this.tools.view(event),
      style: { color: "#980" },
    },
    MOVE: {
      id: 3,
      do: (event) => this.tools.move(event),
      style: { color: "#029" },
    },
  };

  #loadFrame = () => {
    const frames = Object.entries(
      JSON.parse(localStorage.getItem("frames") ?? "{}")
    );
    frames.forEach(([key, frame]) => {
      Object.entries(frame).forEach(([_, item]) => {
        let newItem;
        switch (item.type) {
          case "circle":
            newItem = SVGCircle.fromHistory(item);
            break;
          case "line":
            newItem = SVGLine.fromFrame(item);
            break;
          case "path":
            newItem = SVGPath.fromHistory(item);
            break;
          default:
            break;
        }
        if (newItem) {
          if (!this.state.frames[key]) {
            this.state.frames[key] = {};
          }
          this.state.frames[key][newItem.id] = newItem;
        }
      });
    });
    if (frames.length === 0) {
      return;
    }
    const tpoints = Object.entries(
      JSON.parse(localStorage.getItem("tpoints") ?? "{}")
    );
    tpoints.forEach(([key, value]) => {
      if (key === "line") {
        return;
      }
      this.timeline.addPoint(value);
    });
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
      this.state.canvas.svg.classList = ["select-mode"];
    } else {
      this.state.canvas.svg.classList = [];
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
      this.state.activeFrame[item.id] = item;
    }
    const activeFrameId = this.timeline.getActiveTPoint();
    this.state.frames[activeFrameId] = this.state.activeFrame;
    localStorage.setItem("frames", JSON.stringify(this.state.frames));
    localStorage.setItem("tpoints", JSON.stringify(this.timeline.getPoints()));
    this.listeners.forEach((listener) => listener());
  };

  remove = (id) => {
    if (id) {
      delete this.state.frames[id];
      // this.state.frames[this.state.timeline.activePoint] = this.state.frame;
    }
    localStorage.setItem("frames", JSON.stringify(frame));
    this.listeners.forEach((listener) => listener());
  };
}
export { Store };
