import { pointerToSvgCoords, uid } from "../helper.js";
import { SVGCircle } from "./circle.js";
import { SVGLine } from "./line.js";

export class TimeLine {
  #gs;
  #svg;
  #canvas;
  #points;
  #activePoint;
  // state deps
  #window;
  #frames;
  constructor(gs) {
    this.#gs = gs;
    this.#points = {};
    this.#svg = gs.state.timeline.svg;
    this.#canvas = gs.state.canvas.svg;
    this.#window = gs.state.timeline.window;
    this.#frames = {};
    gs.subscribe(() => {
      this.#window = gs.state.timeline.window;
      this.#frames = gs.state.frames;
    });
    this.init();
  }

  // todo: from storage
  init() {
    this.#points = {
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
    Object.keys(this.#points).forEach((key) => {
      this.#svg.appendChild(this.#points[key].node);
    });
  }
  addPoint(event) {
    let newPoint;
    let id;
    switch (event?.type) {
      case "click":
        id = uid();
        const { x } = pointerToSvgCoords(event, this.#window);
        newPoint = new SVGCircle(x, 8, 5, id)
          .update({ x, y: 8 })
          .setAttribute("stroke", "#333");
        const copyFrame = {};
        this.#canvas.innerHTML = "";
        Object.values(this.#gs.state.activeFrame).forEach((path) => {
          const newId = uid();
          copyFrame[newId] = path.copyWithId(newId);
        });
        this.#frames[id] = copyFrame;
        this.#drawActiveFrame(copyFrame);
        break;
      case "circle":
        newPoint = SVGCircle.fromHistory(event);
        id = newPoint.id;
        break;
      default:
        id = uid();
        newPoint = new SVGCircle(8, 8, 5, id)
          .update({ x: 8, y: 8 })
          .setAttribute("stroke", "#333");
        this.#activePoint = id;
    }
    this.#points[id] = newPoint;
    return newPoint;
  }

  edit(event) {
    switch (event.type) {
      case "click":
        const id = event.target.id;
        let targetPoint = this.#points[id];
        if (!targetPoint) {
          targetPoint = this.addPoint(event);
        } else if (targetPoint?.id === this.#activePoint) {
          break;
        }
        targetPoint.setAttribute("fill", "#333");
        this.#setActiveTPoint(targetPoint);
        this.#drawActiveFrame();
        break;
      default:
        break;
    }
    this.draw();
  }
  #setActiveTPoint(point) {
    if (this.#activePoint) {
      this.#points[this.#activePoint].setAttribute("fill", "transparent");
    }
    this.#points[point.id] = point;
    this.#activePoint = point.id;
    this.#gs.setState({
      activeFrame: this.#frames[point.id],
      frames: this.#frames,
    });
  }
  #drawActiveFrame(frame = this.#gs.state.activeFrame) {
    this.#canvas.innerHTML = "";
    Object.values(frame).forEach((path) => {
      this.#canvas.appendChild(path.node);
    });
  }

  getActiveTPoint() {
    return this.#activePoint;
  }

  getPoints() {
    return this.#points;
  }
}
