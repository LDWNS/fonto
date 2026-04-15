import { uid } from "../helper.js";
import { SVGLine } from "./line.js";

class SVGPathElement {
  constructor(type, list) {
    this.id = uid();
    this.type = type;
    this.list = list;
  }
  static fromString(str) {
    const arr = str?.split(" ") ?? [];
    return new SVGPathElement(
      arr[0],
      arr.slice(1).map((x) => parseFloat(x.replaceAll(/,/g, ""))),
    );
  }
  toString() {
    let output = `${this.type}`;
    const needsCommas = this.list.length > 2;
    this.list.forEach((x, i) => {
      output += ` ${x}${needsCommas && i % 2 === 1 ? "," : ""}`;
    });
    return output;
  }
  getPoint() {
    switch (this.type) {
      case "L":
      case "M":
        return { id: this.id, y: this.list[1], x: this.list[0] };
      default:
        break;
    }
  }
  toggleType() {
    switch (this.type) {
      case "M":
        break;
      case "L":
        this.type = "C";
        break;
      case "C":
        this.type = "L";
        break;
    }
  }
  setOrigin(x, y) {
    switch (this.type) {
      case "M":
      case "L":
        this.list[0] = x;
        this.list[1] = y;
    }
  }
}

export class SVGPath {
  constructor(x, y) {
    this.id = uid();
    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.type = "path";
    this.x = x;
    this.y = y;
    this.moves = [new SVGPathElement("M", [x, y])];
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
    newC.moveString = path.moveString;
    newC.moves = path.moves;
    Object.entries(path.attributes).forEach(([field, value]) => {
      newC.setAttribute(field, value);
    });
    newC.moves = newC.moveString
      .split(/ (?=[a-zA-Z])/)
      .map((x) => SVGPathElement.fromString(x));
    return newC;
  }
  setAttribute(field, value) {
    this.path.setAttribute(field, value);
    this.attributes[field] = value;
    return this;
  }
  preview({ x: newX, y: newY }) {
    const [x, y, rest] = this.moves[this.moves.length - 1].list;
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
      const temp = new SVGPathElement("L", [x, y]);
      this.moves.push(temp);
      this.moveString += ` ${temp.toString()}`;
      this.setAttribute("d", this.moveString);
    }
    // TODO: implement path drawing logic
    save(this);
    return this;
  }
  edit({ x, y, id }, save) {
    this.moves = this.moves.map((item) => {
      if (id !== item.id) {
        return item;
      }
      item.setOrigin(x, y);
      return item;
    });
    this.moveString = this.moves.join(" ");
    this.setAttribute("d", this.moveString);
    save(this);
  }
  editNode({ id }, save) {
    this.moves = this.moves.map((item) => {
      if (id !== item.id) {
        return item;
      }
      item.toggleType();
      return item;
    });
    this.moveString = this.moves.join(" ");
    this.setAttribute("d", this.moveString);
    save(this);
  }
  getEditPoints() {
    const output = {};
    this.moves.forEach((el) => (output[el.id] = el.getPoint()));
    return output;
  }
}
