import { SVGCircle } from "./circle.js";
import { SVGLine } from "./line.js";

export class EditPoint extends SVGCircle {
  constructor(x, y, id, r = 5) {
    super(x, y, r, id);
    this.setAttribute("data-edit", "true")
      .setAttribute("data-point", id)
      .setAttribute("stroke-width", "2px")
      .setAttribute("fill", "transparent")
      .setAttribute("cx", this.x)
      .setAttribute("cy", this.y)
      .setAttribute("r", this.r);
    this.anchorPoint = null;
    this.anchoredPoints = [];
    this.anchorLine = false;
  }

  static create(key, { x, y, x1, y1, x2, y2 }, prevEPoint) {
    const eps = [];
    const ep = new EditPoint(x, y, key);
    if (x1 != undefined && y1 != undefined) {
      const a1 = new EditPoint(x1, y1, `${key}-a-0`, 3)
        .setAnchorPoint(prevEPoint)
        .createAnchorLine();
      eps.push(a1);
    }
    if (x2 != undefined && y2 != undefined) {
      const a2 = new EditPoint(x2, y2, `${key}-a-1`, 3)
        .setAnchorPoint(ep)
        .createAnchorLine();
      eps.push(a2);
    }
    ep.linkPrev(prevEPoint);
    return [ep, ...eps];
  }

  update({ x, y }) {
    this.x = x;
    this.y = y;
    this.isDrawing = true;
    this.setAttribute("cx", this.x);
    this.setAttribute("cy", this.y);
    this.setAttribute("r", this.r);
    if (this.anchorLine) {
      this.anchorLine
        .setCoords({
          x1: this.anchorPoint.x,
          y1: this.anchorPoint.y,
          x2: this.x,
          y2: this.y,
        })
        .update({ x: undefined, y: undefined }, () => {});
    }
    return this;
  }

  linkPrev(prevEPoint) {
    if (prevEPoint) {
      this.prevEP = prevEPoint;
      prevEPoint.nextEP = this;
    }
  }

  setAnchorPoint(anchorPoint) {
    this.setAttribute("fill", "#333");
    this.anchorPoint = anchorPoint;
    anchorPoint.addAnchoredPoint(this);
    return this;
  }

  addAnchoredPoint(anchoredPoint) {
    if (anchoredPoint) {
      this.anchoredPoints.push(anchoredPoint);
    }
  }
  updateAnchoredPoints(dx, dy) {
    for (const anchoredPoint of this.anchoredPoints) {
      this.#anchorPointUpdateStrategy(anchoredPoint, dx, dy);
    }
  }

  #anchorPointUpdateStrategy(anchoredPoint, dx, dy) {
    anchoredPoint.update({ x: anchoredPoint.x + dx, y: anchoredPoint.y + dy });
  }

  createAnchorLine() {
    this.anchorLine = new SVGLine(null, null, this.id + "-line")
      .setAttribute("data-edit", "true")
      .setAttribute("stroke", "#333")
      .setAttribute("stroke-dasharray", "2px")
      .setCoords({
        x1: this.anchorPoint.x,
        y1: this.anchorPoint.y,
        x2: this.x,
        y2: this.y,
      })
      .update({ x: undefined, y: undefined }, () => {});
    return this;
  }
}
