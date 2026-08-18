import { EditPoint } from "../classes/editpoint.js";
import { pointerToSvgCoords } from "../helper.js";

export class Editor {
  constructor(gs) {
    this.gs = gs;
    this.currentPath = null;
    this.top = gs.state.canvas.window.top;
    this.left = gs.state.canvas.window.left;
    this.isEditing = false;
    this.currentPathPoints = {};
    this.updatedPoints = {};
    this.movingPoint = null;
    gs.subscribe(() => {
      this.svg = gs.state.canvas.svg;
      this.currentPath = gs.state.currentPath;
      this.top = gs.state.canvas.window.top;
      this.left = gs.state.canvas.window.left;
    });
  }
  exitEditMode() {
    if (!this.isEditing) {
      return;
    }
    this.isEditing = false;
    this.currentPathPoints = {};
    this.updatedPoints = {};
    this.svg.querySelectorAll("[data-edit]").forEach((elem) => {
      this.svg.removeChild(elem);
    });
    this.gs.setState({ currentPath: null });
  }
  edit(event, type) {
    if (!this.currentPath || this.currentPath.type !== type) {
      return;
    }
    if (!this.isEditing) {
      this.#startEditing();
    }
    if (event.type === "mousedown" && !this.movingPoint) {
      const key = event.target.getAttribute("data-point");
      this.movingPoint = this.updatedPoints[key];
      return;
    }
    if (event.type === "mousemove" && this.isEditing && this.movingPoint) {
      const { x, y } = pointerToSvgCoords(event);
      const dx = x - this.movingPoint.x;
      const dy = y - this.movingPoint.y;
      this.movingPoint.setOrigin({ x, y }).update({ x, y }, () => {});
      this.movingPoint.updateAnchoredPoints(dx, dy);

      this.currentPath.edit(
        { x, y, dx, dy, id: this.movingPoint.attributes["data-point"] },
        (item) => this.gs.save(item)
      );
      return;
    }
    if (event.type === "mouseup" && this.movingPoint) {
      this.movingPoint = null;
      return;
    }
    if (event.type === "dblclick") {
      return;
    }
  }
  #startEditing() {
    this.isEditing = true;
    this.currentPathPoints = this.currentPath.getEditPoints();
    let prevEditPoint = {};
    for (const key in this.currentPathPoints) {
      const currentPathPoint = this.currentPathPoints[key];
      const editPoints = EditPoint.create(key, currentPathPoint, prevEditPoint);

      editPoints.forEach((ePoint) => {
        this.updatedPoints[ePoint.id] = ePoint;
        this.svg.appendChild(ePoint.node);
        if (ePoint.anchorLine) {
          this.svg.appendChild(ePoint.anchorLine.node);
        }
      });

      prevEditPoint = editPoints[0];
    }
    return;
  }
  editCircle(event) {
    this.edit(event, "circle");
  }
  editLine(event) {
    this.edit(event, "line");
  }
}
