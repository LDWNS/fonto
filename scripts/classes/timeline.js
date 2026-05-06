import { pointerToSvgCoords, uid } from "../helper.js";
import { SVGCircle } from "./circle.js";
import { SVGLine } from "./line.js";

export class TimeLine {
  #gs;
  #svg;
  points;
  #window;
  constructor(gs) {
    this.#gs = gs;
    this.points = {};
    this.#svg = gs.state.timeline.svg;
    this.#window = gs.state.timeline.window;
    gs.subscribe(() => {
      this.#window = gs.state.timeline.window;
    });
    this.init();
  }

  // todo: from storage
  init() {
    this.points = {
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
    this.draw();
  }

  draw() {
    this.#svg.innerHtml = "";
    Object.keys(this.points).forEach((key) => {
      this.#svg.appendChild(this.points[key].node);
    });
  }
  addPoint(event) {
    const id = uid();
    const { x } = event ? pointerToSvgCoords(event, this.#window) : { x: 8 };
    const newPoint = new SVGCircle(x, 8, 5, id)
      .update({ x, y: 8 })
      .setAttribute("stroke", "#333");
    this.points[id] = newPoint;
    return newPoint;
  }

  edit(event) {
    switch (event.type) {
      case "click":
        const id = event.target.id;
        let targetPoint = this.#gs.state.timeline.points[id];
        if (targetPoint.id === this.#gs.state.timeline.activePoint) {
          break;
        }
        if (!targetPoint) {
          targetPoint = this.addPoint(event);
        }
        targetPoint.setAttribute("fill", "#333");
        this.#setActiveTPoint(targetPoint);

        break;
      default:
        break;
    }
    this.draw();
  }
  #setActiveTPoint(point) {
    this.state.timeline.points[this.state.timeline.activePoint].setAttribute(
      "fill",
      "transparent"
    );
    this.state.frames[point.id] = { ...this.state.frame };
    this.state.frame = this.state.frames[point.id];
    this.state.timeline.points[point.id] = point;
    this.setState({
      timeline: {
        ...this.state.timeline,
        activePoint: point.id,
        points: this.state.timeline.points,
      },
      frames: this.state.frames,
      frame: this.state.frame,
    });
  }
}
