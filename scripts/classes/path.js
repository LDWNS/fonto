import { uid } from "../helper.js";
import { SVGPathElement } from "./pathelement.js";

export class SVGPath {
  constructor(x, y) {
    this.id = uid();
    this.node = document.createElementNS("http://www.w3.org/2000/svg", "path");
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
  static create(x, y) {
    const newP = new SVGPath(x, y);
    newP.setAttribute("d", this.moveString);
    return newP;
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
    const split = newC.moveString
      .split(/([a-zA-Z] {0,1}[-\d. ]*)/)
      .filter((el) => el.length > 0);
    for (let i = 0; i < split.length; i++) {
      newC.moves.push(
        SVGPathElement.fromString(
          split[i],
          i > 0 ? newC.moves[i - 1] : undefined
        )
      );
    }

    return newC;
  }
  setAttribute(field, value) {
    this.node.setAttribute(field, value);
    this.attributes[field] = value;
    return this;
  }
  #getLastM(zIndex = this.moves.length) {
    let x, y;
    for (let i = zIndex - 1; i >= 0; i--) {
      if (this.moves[i].type === "M") {
        x = this.moves[i].list[0];
        y = this.moves[i].list[1];
      }
    }
    return { x, y };
  }
  addPoint({ x, y }) {
    let prev = this.moves[this.moves.length - 1];
    const pe = new SVGPathElement("L", [x, y]).linkPrev(prev);
    this.moves.push(pe);
    this.moveString += ` ${pe.toString()} `;
    this.setAttribute("d", this.moveString);
    return pe;
  }
  addOriginNode({ x, y }) {
    const pe = new SVGPathElement("M", [x, y]);
    this.moves.push(pe);
    this.moveString += ` ${pe.toString()}`;
    this.setAttribute("d", this.moveString);
    return pe;
  }
  // todo: get new locations for path from ./editpoint.js
  edit({ x, y, dx, dy, id }) {
    this.moves = this.moves.map((item) => {
      if (id === item.id) {
        if (item.type === "C") {
          // update the associated bend point
          item.moveBP(dx, dy, 1);
        }
        item.setOrigin(x, y);
      } else if (id.substring(0, id.length - 1) === item.id + "-a-") {
        item.updateBP(x, y, parseInt(id.charAt(id.length - 1)));
      } else if (id === item.prevNode?.id) {
        if (item.type === "C") {
          // update the associated bend point
          item.moveBP(dx, dy, 0);
        }
      }
      return item;
    });
    this.moveString = this.moves.join(" ");
    this.setAttribute("d", this.moveString);
  }
  editNode({ id }) {
    let newPoints = [];
    this.moves = this.moves.map((item, index) => {
      if (id === item.id) {
        let info;
        if (item.prevNode.type === "Z") {
          info = this.#getLastM(index);
        }
        item.toggleType(info);
        newPoints = item.newPoints;
      }
      return item;
    });
    this.moveString = this.moves.map((move) => move.toString()).join(" ");
    this.setAttribute("d", this.moveString);
    return newPoints;
  }
  getEditPoints() {
    const output = {};
    this.moves.forEach((el) => {
      if (el.type === "Z") {
        return;
      }
      output[el.id] = el.getPoint();
    });
    return output;
  }
  copyWithId(newId) {
    const newPath = SVGPath.fromHistory(JSON.parse(JSON.stringify(this)));
    newPath.id = newId;
    newPath.setAttribute("id", newId);
    return newPath;
  }
  handleKeyEvent(event) {
    if (event.key === "z") {
      this.moves.push(
        new SVGPathElement("Z", []).linkPrev(this.moves[this.moves.length - 1])
      );
    }
    this.moveString = this.moves.map((move) => move.toString()).join(" ");
    this.setAttribute("d", this.moveString);
  }
}
