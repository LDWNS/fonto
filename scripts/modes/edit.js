import { SVGCircle } from "../classes.js";

export class Editor {
  constructor(gs) {
    this.gs = gs;
    this.svg = gs;
    this.currentPath = null;
    this.top = gs.state.window.top;
    this.left = gs.state.window.left;
    this.isEditing = false;
    this.points = {};
    gs.subscribe(() => {
      this.svg = gs.state.svg;
      this.currentPath = gs.state.currentPath;
      this.top = gs.state.window.top;
      this.left = gs.state.window.left;
    });
  }
  #pointerToSvgCoords({ clientX, clientY }) {
    return { x: clientX - this.left, y: clientY - this.top };
  }
  editLine() {
    if (!this.currentPath || this.currentPath.type !== "LINE") {
      return;
    }
    if (!this.isEditing) {
      this.isEditing = true;
      this.points = this.currentPath.getEditPoints();
      this.svg = new SVGCircle(this.points["a"].x, this.points["a"].y, 4)
        .setAttribute("data-edit", "true")
        .draw({ x: this.points["a"].x, y: this.points["a"].y }, () => {});
      this.svg = new SVGCircle(this.points["b"].x, this.points["b"].y, 4)
        .setAttribute("data-edit", "true")
        .draw({ x: this.points["b"].x, y: this.points["b"].y }, () => {});
    }
  }
}
