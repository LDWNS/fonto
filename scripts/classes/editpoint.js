import { SVGCircle } from "./circle.js";

export class EditPoint extends SVGCircle {
  constructor(x, y, id) {
    super(x, y, 5, id);
    this.setAttribute("data-edit", "true")
      .setAttribute("data-point", id)
      .setAttribute("stroke-width", "2px")
      .setAttribute("fill", "transparent")
      .setAttribute("cx", x)
      .setAttribute("cy", y)
      .setAttribute("r", 5);
    this.anchorPoint = null;
    this.anchoredPoints = [];
  }

  static create(key, { x, y, x1, y1, x2, y2, type }, prevEPoint) {
    const eps = [];
    const ep = new EditPoint(x, y, key);
    if (x1 != undefined && y1 != undefined) {
      const a1 = new EditPoint(x1, y1, `${key}-a-0`);
      a1.setAttribute("fill", "#333");
      a1.setAnchorPoint(prevEPoint);
      eps.push(a1);
    }
    if (x2 != undefined && y2 != undefined) {
      const a2 = new EditPoint(x2, y2, `${key}-a-1`);
      a2.setAttribute("fill", "#333");
      a2.setAnchorPoint(ep);
      eps.push(a2);
    }
    return [ep, ...eps];
  }

  #anchorPointUpdateStrategy(anchoredPoint, dx, dy) {
    anchoredPoint
      .setOrigin({ x: anchoredPoint.x + dx, y: anchoredPoint.y + dy })
      .update({ x: anchoredPoint.x + dx, y: anchoredPoint.y + dy }, () => {});
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

  setAnchorPoint(anchorPoint) {
    this.anchorPoint = anchorPoint;
    anchorPoint.addAnchoredPoint(this);
    return this;
  }
}
