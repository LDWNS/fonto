import { uid, distance } from "../helper.js";

// TODO: change circle to ellipse
export class SVGCircle {
  constructor(x, y, r, id = uid()) {
    this.id = id;
    this.circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    this.type = "circle";
    this.x = x;
    this.y = y;
    this.r = r;
    this.isDrawing = false;
    this.attributes = {};
    this.setAttribute("stroke", "#333");
    this.setAttribute("stroke-width", "2px");
    this.setAttribute("fill", "none");
    this.setAttribute("id", this.id);
  }
  static fromHistory(circle) {
    const newC = new SVGCircle(circle.x, circle.y, circle.r);
    newC.id = circle.id;
    Object.entries(circle.attributes).forEach(([field, value]) => {
      newC.setAttribute(field, value);
    });
    return newC;
  }
  setAttribute(field, value) {
    this.circle.setAttribute(field, value);
    this.attributes[field] = value;
    return this;
  }
  setOrigin({ x, y }) {
    this.x = x;
    this.y = y;
    this.isDrawing = false;
    return this;
  }
  update({ x, y }, save) {
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.setAttribute("cx", this.x);
      this.setAttribute("cy", this.y);
      this.setAttribute("r", this.r);
    } else {
      this.r = distance({ x1: this.x, y1: this.y, x2: x, y2: y });
      this.setAttribute("r", this.r);
    }
    save(this);
    return this;
  }
  edit({ x, y, id }, save) {
    if (id === "origin") {
      this.x = x;
      this.y = y;
      this.setAttribute("cx", x);
      this.setAttribute("cy", y);
    } else if (id === "rx") {
      this.r = distance({ x1: this.x, y1: this.y, x2: x, y2: y });
      this.setAttribute("r", this.r);
    }
    save(this);
  }
  getEditPoints() {
    return {
      origin: { x: this.x, y: this.y },
      rx: { x: this.x + this.r, y: this.y },
    };
  }
  handleKeyEvent(event) {
  }
}
