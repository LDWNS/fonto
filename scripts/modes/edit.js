import { SVGCircle } from "../classes/circle.js";

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
      for (const key in this.originalPoints) {
        const { x, y, x1, y1, x2, y2 } = this.originalPoints[key];
        this.updatedPoints[key] = new SVGCircle(x, y, 5, key)
          .setAttribute("data-edit", "true")
          .setAttribute("data-point", key)
          .setAttribute("stroke-width", "2px")
          .setAttribute("fill", "transparent")
          .update({ x, y }, () => {});
        if (x1 !== undefined && y1 !== undefined) {
          let bpKey1 = key + "-bp-0";
          this.updatedPoints[bpKey1] = new SVGCircle(x1, y1, 5, bpKey1)
            .setAttribute("data-edit", "true")
            .setAttribute("data-point", bpKey1)
            .setAttribute("stroke-width", "2px")
            .setAttribute("fill", "transparent")
            .update({ x: x1, y: y1 }, () => {});
        }
        if (x2 !== undefined && y2 !== undefined) {
          let bpKey2 = key + "-bp-1";
          this.updatedPoints[bpKey2] = new SVGCircle(x2, y2, 5, bpKey2)
            .setAttribute("data-edit", "true")
            .setAttribute("data-point", bpKey2)
            .setAttribute("stroke-width", "2px")
            .setAttribute("fill", "transparent")
            .update({ x: x2, y: y2 }, () => {});
        }
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
        this.updatedPoints[nKey] = new SVGCircle(x, y, 5)
          .setAttribute("data-edit", "true")
          .setAttribute("data-point", nKey)
          .setAttribute("stroke-width", "2px")
          .setAttribute("fill", "transparent")
          .update({ x, y }, () => {});
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
