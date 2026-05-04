import { uid } from "../helper.js";
export class SVGLine {
  constructor(x, y, id = uid()) {
    this.id = id;
    this.node = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.type = "line";
    this.x1 = x;
    this.y1 = y;
    this.x2 = x;
    this.y2 = y;
    this.isDrawing = false;
    this.attributes = {};
    this.setAttribute("stroke", "#333");
    this.setAttribute("id", this.id);
  }
  static fromHistory(line) {
    const newC = new SVGLine(line.x1, line.y1);
    newC.id = line.id;
    newC.x2 = line.x2;
    newC.y2 = line.y2;
    Object.entries(line.attributes ?? {}).forEach(([field, value]) => {
      newC.setAttribute(field, value);
    });
    return newC;
  }
  setCoords({ x1, y1, x2, y2 }) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.isDrawing = false;
    return this;
  }
  setAttribute(field, value) {
    this.node.setAttribute(field, value);
    this.attributes[field] = value;
    return this;
  }
  draw() {
    this.setAttribute("x1", this.x1);
    this.setAttribute("y1", this.y1);
    this.setAttribute("x2", this.x2);
    this.setAttribute("y2", this.y2);
  }
  update({ x, y }) {
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.setAttribute("x1", this.x1);
      this.setAttribute("y1", this.y1);
      this.setAttribute("x2", this.x2);
      this.setAttribute("y2", this.y2);
    } else {
      this.x2 = x;
      this.y2 = y;
      this.setAttribute("x2", x);
      this.setAttribute("y2", y);
    }
    return this;
  }
  edit({ x, y, id }) {
    if (id === "start") {
      this.x1 = x;
      this.y1 = y;
      this.setAttribute("x1", x);
      this.setAttribute("y1", y);
    } else {
      this.x2 = x;
      this.y2 = y;
      this.setAttribute("x2", x);
      this.setAttribute("y2", y);
    }
  }
  getEditPoints() {
    return {
      start: { x: this.x1, y: this.y1 },
      end: { x: this.x2, y: this.y2 },
    };
  }
  handleKeyEvent(event) {
    // No key events for line
  }
}
