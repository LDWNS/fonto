import { SVGPath } from "../classes/path.js";
import { SVGCircle } from "../classes/circle.js";
import { SVGLine } from "../classes/line.js";

export class Drawer {
  constructor(gs) {
    this.gs = gs;
    this.svg = gs;
    this.currentPath = null;
    this.top = gs.state.window.top;
    this.left = gs.state.window.left;
    gs.subscribe(() => {
      this.svg = gs.state.svg;
      this.currentPath = gs.state.currentPath;
      this.top = gs.state.window.top;
      this.left = gs.state.window.left;
    });
  }
  #clickToCanvasCoords({ clientX, clientY }) {
    return { x: clientX - this.left, y: clientY - this.top };
  }
  #draw(event, objCreator) {
    let toggle = event.type === "click";
    if (!toggle && !this.currentPath) {
      return;
    }
    const { x, y } = this.#clickToCanvasCoords(event);
    if (toggle) {
      if (!this.currentPath) {
        objCreator(x, y);
      } else {
        this.gs.setState({ currentPath: null });
        return;
      }
    }
    this.currentPath.update({ x, y }, (item) => this.gs.save(item));
  }
  drawCircle = (event) => {
    this.#draw(event, (x, y) => {
      const temp = new SVGCircle(x, y, 4);
      this.gs.setState({ currentPath: temp });
      this.svg.appendChild(temp.circle);
    });
  };
  drawLine = (event) => {
    this.#draw(event, (x, y) => {
      const temp = new SVGLine(x, y);
      this.gs.setState({ currentPath: temp });
      this.svg.appendChild(temp.line);
    });
  };
  drawFreeHand = (event) => {
    this.#draw(event, (x, y) => {
      const temp = new SVGPath(x, y);
      this.gs.setState({ currentPath: temp });
      this.svg.appendChild(temp.path);
    });
  };
  drawPath = (event) => {
    let click = event.type === "click";
    if (!click && !this.currentPath) {
      return;
    }
    const { x, y } = this.#clickToCanvasCoords(event);
    if (click) {
      if (!this.currentPath) {
        const temp = new SVGPath(x, y);
        this.gs.setState({ currentPath: temp });
        this.svg.appendChild(temp.path);
      }
      this.currentPath.update({ x, y }, (item) => this.gs.save(item));
      return;
    }
    this.currentPath.preview({ x, y });
  };
  clearPreview() {
    const preview = document.getElementById("path-preview");
    if (preview) {
      this.svg.removeChild(preview);
    }
  }
}
