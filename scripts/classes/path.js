import { uid } from "../helper.js";
import { SVGLine } from "./line.js";

class SVGPathElement {
  constructor(type, list, prevNode) {
    this.id = uid();
    this.type = type;
    this.list = list;
    this.prevNode = prevNode;
  }
  // todo: figure out why prevNode is always the last dblclick'ed mf
  static fromString(str, prevNode) {
    const arr = str?.split(" ") ?? [];
    return new SVGPathElement(
      arr[0],
      arr.slice(1).map((x) => parseFloat(x.replaceAll(/,/g, ""))),
      prevNode,
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
        return {
          id: this.id,
          x1: this.list[0],
          y1: this.list[1],
          x2: this.list[2],
          y2: this.list[3],
          y: this.list[5],
          x: this.list[4],
        };
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
        let { x: x1, y: y1 } = this.prevNode.getPoint();
        x = this.list[0];
        y = this.list[1];
        let x2 = x + 15;
        let y2 = y + 15;
        this.list = [x1 + 15, y1 + 15, x2, y2, x, y];
        this.newPoints = [
          { x: x1 + 15, y: y1 + 15 },
          { x: x2, y: y2 },
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
    this.moves = [new SVGPathElement("M", [x, y], undefined)];
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
    newC.moves = [];
    const split = newC.moveString.split(/ (?=[a-zA-Z])/);
    for (let i = 0; i < split.length; i++) {
      newC.moves.push(
        SVGPathElement.fromString(
          split[i],
          i > 0 ? newC.moves[i - 1] : undefined,
        ),
      );
    }

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
      const prev = this.moves[this.moves.length - 1];
      const temp = new SVGPathElement("L", [x, y], prev);
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
