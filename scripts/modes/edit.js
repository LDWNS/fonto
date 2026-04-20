import { SVGCircle } from "../classes/circle.js";
import { EditPoint } from "../classes/editpoint.js";

export class Editor {
  constructor(gs) {
    this.gs = gs;
    this.svg = gs;
    this.currentPath = null;
    this.top = gs.state.window.top;
    this.left = gs.state.window.left;
    this.isEditing = false;
    this.currentPathPoints = {};
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
      const { x, y } = this.#pointerToSvgCoords(event);
      const dx = x - this.movingPoint.x;
      const dy = y - this.movingPoint.y;
      this.movingPoint.setOrigin({ x, y }).update({ x, y }, () => {});
      this.movingPoint.updateAnchoredPoints(dx, dy);
      this.currentPath.edit(
        { x, y, id: this.movingPoint.attributes["data-point"] },
        (item) => this.gs.save(item),
      );
      return;
    }
    if (event.type === "mouseup" && this.movingPoint) {
      this.movingPoint = null;
      return;
    }
    if (event.type === "dblclick") {
      this.#pathDoubleClick(event);
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
        this.svg.appendChild(ePoint.circle);
        if (ePoint.anchorLine) {
          this.svg.appendChild(ePoint.anchorLine.line);
        }
      });

      prevEditPoint = editPoints[0];
    }
    return;
  }
  #pathDoubleClick(event) {
    const key = event.target.getAttribute("data-point");
    if (!key || key.includes("-a-")) {
      return;
    }
    const targetPoint = this.updatedPoints[key];
    let newPoints = this.currentPath.editNode({ id: key }, (item) =>
      this.gs.save(item),
    );
    if (newPoints.length === 0) {
      let nKey0 = key + "-a-" + 0;
      this.svg.removeChild(this.updatedPoints[nKey0].circle);
      let nKey1 = key + "-a-" + 1;
      this.svg.removeChild(this.updatedPoints[nKey1].circle);
      this.svg.querySelectorAll(`[data-point*="${key}-a-"]`).forEach((elem) => {
        this.svg.removeChild(elem);
      });
      return;
    }
    for (let i = 0; i < newPoints.length; i++) {
      let nKey = targetPoint.id + "-a-" + i;
      const { x, y } = newPoints[i];
      // todo: this can start if edit points have forward and backward references
      // const anchorPoint = i === 0 ? targetPoint.prevEditPoint : targetPoint;
      this.updatedPoints[nKey] = new EditPoint(x, y, nKey, 3)
        // .setAnchorPoint(anchorPoint)
        .setAttribute("fill", "#333")
        .createAnchorLine();
      this.svg.appendChild(this.updatedPoints[nKey].circle);
      this.svg.appendChild(this.updatedPoints[nKey].anchorLine.line);
    }
  }
  editCircle(event) {
    this.edit(event, "circle");
  }
  editLine(event) {
    this.edit(event, "line");
  }
  editPath(event) {
    this.edit(event, "path");
  }
}
