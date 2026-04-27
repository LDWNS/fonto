import { uid } from "../helper.js";

export class SVGPathElement {
  constructor(type, list) {
    this.id = uid();
    this.type = type;
    this.list = list;
  }
  static fromString(str, prevNode) {
    const arr = str?.split(" ") ?? [];
    const moves = arr.slice(1).map((x) => parseFloat(x.replaceAll(/,/g, "")));
    return new SVGPathElement(arr[0], moves).linkPrev(prevNode);
  }
  linkPrev(prevNode) {
    if (prevNode) {
      this.prevNode = prevNode;
      prevNode.nextNode = this.id;
    }
    return this;
  }
  toString() {
    let output = `${this.type}`;
    const needsCommas = this.list.length > 2;
    for (let i = 0; i < this.list.length / 2; i++) {
      const a = i * 2;
      const b = a + 1;
      output += ` ${this.list[a]} ${this.list[b]}${
        needsCommas && b + 1 < this.list.length ? "," : ""
      }`;
    }
    // figma trick
    if ((this.type !== "M", this.prevNode)) {
      const { x: prevX, y: prevY } = this.prevNode.getPoint();
      output = `M ${prevX} ${prevY}` + output;
    }
    return output;
  }
  getPoint() {
    switch (this.type) {
      case "Z":
        console.error("getPoint was called on Z");
        break;
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
    }
  }
  toggleType(info) {
    let x, y;
    switch (this.type) {
      case "M":
      case "Z":
        break;
      case "L":
        this.type = "C";
        let { x: x1, y: y1 } =
          this.prevNode.type === "Z" ? info : this.prevNode.getPoint();
        x = this.list[0];
        y = this.list[1];
        this.list = [x1 + 15, y1 + 15, x + 15, y + 15, x, y];
        this.newPoints = [
          { x: x1 + 15, y: y1 + 15 },
          { x: x + 15, y: y + 15 },
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
  updateBP(x, y, index) {
    if (this.type !== "C") {
      return;
    }
    this.list[index * 2] = x;
    this.list[index * 2 + 1] = y;
  }
  moveBP(dx, dy, index) {
    if (this.type !== "C") {
      return;
    }
    this.list[index * 2] += dx;
    this.list[index * 2 + 1] += dy;
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
      case "Z":
        break;
    }
  }
}
