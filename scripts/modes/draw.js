import { SVGCircle } from "../classes/circle.js";
import { SVGLine } from "../classes/line.js";

export class Drawer {
  constructor(gs) {
    this.gs = gs;
    this.currentPath = null;
    this.top = gs.state.canvas.window.top;
    this.left = gs.state.canvas.window.left;
    gs.subscribe(() => {
      this.svg = gs.state.canvas.svg;
      this.currentPath = gs.state.currentPath;
      this.top = gs.state.canvas.window.top;
      this.left = gs.state.canvas.window.left;
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
    this.currentPath.update({ x, y });
  }
  drawCircle = (event) => {
    this.#draw(event, (x, y) => {
      const temp = new SVGCircle(x, y, 4);
      this.gs.setState({ currentPath: temp });
      this.svg.appendChild(temp.node);
    });
  };
  drawLine = (event) => {
    this.#draw(event, (x, y) => {
      const temp = new SVGLine(x, y);
      this.gs.setState({ currentPath: temp });
      this.svg.appendChild(temp.node);
    });
  };
  clearPreview() {
    const preview = document.getElementById("path-preview");
    if (preview) {
      this.svg.removeChild(preview);
    }
  }
}
