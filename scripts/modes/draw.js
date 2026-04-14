import { SVGCircle, SVGLine } from "../classes.js";

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
    this.currentPath.draw({ x, y }, (item) => this.gs.save(item));
  }
  drawCircle = (event) => {
    this.#draw(event, (x, y) => {
      const temp = new SVGCircle(x, y, 4);
      this.gs.setState({ currentPath: temp });
      svg.appendChild(temp.circle);
    });
  };
  drawLine = (event) => {
    this.#draw(event, (x, y) => {
      const temp = new SVGLine(x, y);
      this.gs.setState({ currentPath: temp });
      svg.appendChild(temp.line);
    });
  };
}
