import { SVGCircle } from "../classes.js";

export class Editor {
  constructor(gs) {
    this.gs = gs;
    this.svg = gs;
    this.currentPath = null;
    this.top = gs.state.window.top;
    this.left = gs.state.window.left;
    this.isEditing = false;
    this.originalPoints = {};
    this.updatedPoints = {};
    this.movingPoint = null;
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
  exitEditMode() {
    if (!this.isEditing) {
      return;
    }
    this.isEditing = false;
    this.originalPoints = {};
    for (const key in this.updatedPoints) {
      this.svg.removeChild(this.updatedPoints[key].circle);
    }
    this.updatedPoints = {};
    this.gs.setState({ currentPath: null });
  }
  edit(event, type) {
    if (!this.currentPath || this.currentPath.type !== type) {
      return;
    }
    if (!this.isEditing) {
      this.isEditing = true;
      this.originalPoints = this.currentPath.getEditPoints();
      for (const key in this.originalPoints) {
        const { x, y } = this.originalPoints[key];
        this.updatedPoints[key] = new SVGCircle(x, y, 5)
          .setAttribute("data-edit", "true")
          .setAttribute("data-point", key)
          .setAttribute("stroke-width", "2px")
          .setAttribute("fill", "transparent")
          .update({ x, y }, () => {});
      }
      for (const key in this.updatedPoints) {
        this.svg.appendChild(this.updatedPoints[key].circle);
      }
      return;
    }
    if (event.type === "mousedown" && !this.movingPoint) {
      const key = event.target.getAttribute("data-point");
      this.movingPoint = this.updatedPoints[key];
      return;
    }
    if (event.type === "mousemove" && this.isEditing && this.movingPoint) {
      const { x, y } = this.#pointerToSvgCoords(event);
      this.movingPoint.setOrigin({ x, y }).update({ x, y }, () => {});
      this.currentPath.edit(
        { x, y, id: this.movingPoint.attributes["data-point"] },
        (item) => this.gs.save(item),
      );
    }
    if (event.type === "mouseup" && this.movingPoint) {
      this.movingPoint = null;
    }
  }
  editCircle(event) {
    edit(event, "circle");
  }
  editLine(event) {
    edit(event, "line");
  }
}
