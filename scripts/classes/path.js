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
    for (let i = 0; i < this.list.length / 2; i++) {
      const a = i * 2;
      const b = a + 1;
      output += ` ${this.list[a]} ${this.list[b]}${needsCommas && b + 1 < this.list.length ? "," : ""}`;
    }
    return output;
  }
  getPoint() {
    switch (this.type) {
      case "L":
      case "M":
        return { id: this.id, y: this.list[1], x: this.list[0] };
      case "C":
        return { id: this.id, y: this.list[5], x: this.list[4] };
      default:
        break;
    }
  }
  toggleType() {
    let x, y;
    switch (this.type) {
      case "M":
        break;
      case "L":
        this.type = "C";
        x = this.list[0];
        y = this.list[1];
        this.list = [x + 15, y + 15, x - 15, y - 15, x, y];
        this.newPoints = [
          { x: x + 15, y: y + 15 },
          { x: x - 15, y: y - 15 },
        ];
        break;
      case "C":
        this.type = "L";
        x = this.list[4];
        y = this.list[5];
        this.list = [x, y];
        this.newPoints = [];
        break;
    }
    return this;
  }

  setOrigin(x, y) {
    switch (this.type) {
      case "M":
      case "L":
        this.list[0] = x;
        this.list[1] = y;
        break;
      case "C":
        this.list[4] = x;
        this.list[5] = y;
        break;
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
    let newPoints = [];
    this.moves = this.moves.map((item) => {
      if (id === item.id) {
        item.toggleType();
        newPoints = item.newPoints;
      }
      return item;
    });
    this.moveString = this.moves.map((move) => move.toString()).join(" ");
    this.setAttribute("d", this.moveString);
    save(this);
    return newPoints;
  }
  getEditPoints() {
    const output = {};
    this.moves.forEach((el) => (output[el.id] = el.getPoint()));
    return output;
  }
}
