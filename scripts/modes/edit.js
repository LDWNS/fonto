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
      this.isEditing = true;
      this.originalPoints = this.currentPath.getEditPoints();
      let prevEditPoint = {};
      for (const key in this.originalPoints) {
        const { x, y, x1, y1, x2, y2 } = this.originalPoints[key];
        this.updatedPoints[key] = new EditPoint(x, y, key);
        if (x1 !== undefined && y1 !== undefined) {
          let bpKey1 = key + "-bp-0";
          this.updatedPoints[bpKey1] = new EditPoint(
            x1,
            y1,
            bpKey1,
          ).setAnchorPoint(prevEditPoint);
        }
        if (x2 !== undefined && y2 !== undefined) {
          let bpKey2 = key + "-bp-1";
          this.updatedPoints[bpKey2] = new EditPoint(
            x2,
            y2,
            bpKey2,
          ).setAnchorPoint(this.updatedPoints[key]);
        }
        prevEditPoint = this.updatedPoints[key];
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
      const dx = x - this.movingPoint.x;
      const dy = y - this.movingPoint.y;
      this.movingPoint.setOrigin({ x, y }).update({ x, y }, () => {});
      this.movingPoint.updateAnchoredPoints(dx, dy);
      this.currentPath.edit(
        { x, y, id: this.movingPoint.attributes["data-point"] },
        (item) => this.gs.save(item),
      );
    }
    if (event.type === "mouseup" && this.movingPoint) {
      this.movingPoint = null;
    }
    if (event.type === "dblclick") {
      const key = event.target.getAttribute("data-point");
      const targetPoint = this.updatedPoints[key];
      let newPoints = this.currentPath.editNode({ id: key }, (item) =>
        this.gs.save(item),
      );
      if (newPoints.length === 0) {
        let nKey0 = targetPoint.id + "-bp-" + 0;
        this.svg.removeChild(this.updatedPoints[nKey0].circle);
        let nKey1 = targetPoint.id + "-bp-" + 1;
        this.svg.removeChild(this.updatedPoints[nKey1].circle);
        return;
      }
      for (let i = 0; i < newPoints.length; i++) {
        let nKey = targetPoint.id + "-bp-" + i;
        const { x, y } = newPoints[i];
        this.updatedPoints[nKey] = new EditPoint(x, y, nKey).setAnchorPoint(
          targetPoint,
        );
        this.svg.appendChild(this.updatedPoints[nKey].circle);
      }
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
