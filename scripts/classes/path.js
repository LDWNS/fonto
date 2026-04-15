import { uid } from "../helper.js";
import { SVGLine } from "./line.js";
export class SVGPath {
  constructor(x, y) {
    this.id = uid();
    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.type = "path";
    this.x = x;
    this.y = y;
    this.moves = [];
    this.moveString = `M ${x} ${y}`;
    this.isDrawing = false;
    this.attributes = {};
    this.setAttribute("stroke", "#333");
    this.setAttribute("stroke-width", "2px");
    this.setAttribute("fill", "none");
    this.setAttribute("id", this.id);
  }
  static fromHistory(path) {
    const newC = new SVGPath(path.x, path.y);
    newC.id = path.id;
    Object.entries(path.attributes).forEach(([field, value]) => {
      newC.setAttribute(field, value);
    });
    return newC;
  }
  setAttribute(field, value) {
    this.path.setAttribute(field, value);
    this.attributes[field] = value;
    return this;
  }
  preview({ x: newX, y: newY }) {
    const { x, y } =
      this.moves.length > 0
        ? this.moves[this.moves.length - 1]
        : { x: this.x, y: this.y };
    this.previewLine
      .setCoords({ x1: x, y1: y, x2: newX, y2: newY })
      .update({ x: newX, y: newY }, () => {});
  }
  update({ x, y }, save) {
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.setAttribute("x", this.x);
      this.setAttribute("y", this.y);
      this.previewLine = new SVGLine(this.x, this.y).setAttribute(
        "id",
        "path-preview",
      );
      this.path.parentNode.appendChild(this.previewLine.line);
    } else {
      this.moves.push({ x, y });
      this.moveString += ` L ${x} ${y}`;
      this.setAttribute("d", this.moveString);
    }
    // todo: implement path drawing logic
    save(this);
    return this;
  }
  edit({ x, y, id }, save) {
    // if (id === "origin") {
    //   this.x = x;
    //   this.y = y;
    //   this.setAttribute("x", x);
    //   this.setAttribute("y", y);
    // } else if (id === "rx") {
    //   this.r = distance({ x1: this.x, y1: this.y, x2: x, y2: y });
    //   this.setAttribute("r", this.r);
    // }
    save(this);
  }
  getEditPoints() {
    return {
      origin: { x: this.x, y: this.y },
      rx: { x: this.x + this.r, y: this.y },
    };
  }
}
