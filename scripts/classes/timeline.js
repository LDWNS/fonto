import { pointerToSvgCoords, uid } from "../helper.js";
import { SVGCircle } from "./circle.js";
import { SVGLine } from "./line.js";

export class TimeLine {
  #gs;
  #svg;
  #currentTimeLinePoints;
  #movingPoint;
  #window;
  #y;
  constructor(gs) {
    this.#gs = gs;
    this.#currentTimeLinePoints = {};
    this.#movingPoint = null;
    this.#svg = gs.state.timeline.svg;
    this.#window = gs.state.timeline.window;
    gs.subscribe(() => {
      this.#window = gs.state.timeline.window;
    });
    this.init();
  }

  // todo: from storage
  init() {
    this.#currentTimeLinePoints = {
      line: new SVGLine(null, null)
        .setAttribute("stroke", "#333")
        .setAttribute("stroke-width", "1px")
        .setCoords({
          x1: 0,
          y1: 8,
          x2: this.#window.width,
          y2: 8,
        })
        .update({ x: undefined, y: undefined }),
    };
    this.#addPoint()
    this.draw();
  }

  draw() {
    this.#svg.innerHtml = "";
    Object.keys(this.#currentTimeLinePoints).forEach((key) => {
      this.#svg.appendChild(this.#currentTimeLinePoints[key].node);
    });
  }
  #addPoint(event) {
    const id = uid();
    const { x } = event ? pointerToSvgCoords(event, this.#window) : { x: 8 };
    this.#currentTimeLinePoints[id] = new SVGCircle(x, 8, 5, id)
      .update({ x, y: 8 })
      .setAttribute("stroke", "#333")
      .setAttribute("fill", "#333");
  }

  edit(event) {
    switch (event.type) {
      case "click":
        this.#addPoint(event)
        break;
      default:
        break;
    }
    this.draw();
  }
}
