const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
const distance = ({ x1, y1, x2, y2 }) => {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};
class SVGCircle {
  constructor(x, y, r) {
    this.id = uid();
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
    this.setAttribute("fill", "none");
    this.setAttribute("id", this.id);
  }
  setAttribute(field, value) {
    this.circle.setAttribute(field, value);
    this.attributes[field] = value;
    return this;
  }
  draw({ x, y }, save) {
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.setAttribute("cx", this.x);
      this.setAttribute("cy", this.y);
      this.setAttribute("r", this.r);
    } else {
      this.setAttribute(
        "r",
        distance({ x1: this.x, y1: this.y, x2: x, y2: y }),
      );
    }
    save(this);
    return this;
  }
  static fromHistory(circle) {
    const newC = new SVGCircle(circle.x, circle.y, circle.r);
    newC.id = circle.id;
    Object.entries(circle.attributes).forEach(([field, value]) => {
      newC.setAttribute(field, value);
    });
    return newC;
  }
}
class SVGLine {
  constructor(x, y) {
    this.id = uid();
    this.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
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
  setAttribute(field, value) {
    this.line.setAttribute(field, value);
    this.attributes[field] = value;
    return this;
  }
  draw({ x, y }, save) {
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.setAttribute("x1", this.x1);
      this.setAttribute("y1", this.y1);
      this.setAttribute("x2", this.x2);
      this.setAttribute("y2", this.y2);
    } else {
      this.setAttribute("x2", x);
      this.setAttribute("y2", y);
    }
    save(this);
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
}
class SVGPath {
  constructor() {
    this.points = [];
    this.path = new Path2D();
    this.type = "path";
  }
  draw(ctx, save) {
    this.path.moveTo(this.x1, this.y1);
    this.path.lineTo(this.x2, this.y2);
    ctx.stroke(this.path);
    save(this);
  }
}

export { SVGCircle, SVGLine, SVGPath };
