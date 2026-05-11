import { SVGPath } from "../classes/path.js";
import { SVGPathElement } from "../classes/pathelement.js";
import { pointerToSvgCoords } from "../helper.js";

export class Tools {
  constructor(gs) {
    this.gs = gs;
    this.frame = gs.state.activeFrame;
    gs.subscribe(() => {
      this.frame = gs.state.activeFrame;
    });
  }
  select(event) {
    switch (event.type) {
      case "click":
        switch (event.target.nodeName) {
          case "circle":
            this.gs.setState({
              currentPath: this.frame[event.target.id],
            });
            this.gs.setMode({ mode: "CIRCLE-EDIT" });
            break;
          case "line":
            this.gs.setState({
              currentPath: this.frame[event.target.id],
            });
            this.gs.setMode({ mode: "LINE-EDIT" });
            break;
          case "path":
            this.gs.setState({
              currentPath: this.frame[event.target.id],
            });
            this.gs.setMode({ mode: "PATH-EDIT" });
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }
  renderInput(value) {
    // todo: add animation rendering
    // todo: make this safe: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, "text/html");
    const paths = doc.querySelectorAll("path");
    paths.forEach((p) => {
      const d = p.getAttribute("d");
      const [_, x, y] = d.match(/^M *([0-9.]+) ([0-9.]+)/);
      const newP = new SVGPath(parseInt(x), parseInt(y)).setAttribute(
        "stroke",
        "none"
      );
      newP.moveString = d;
      newP.moves = [];
      Object.values(p.attributes).forEach(({ nodeName, nodeValue }) => {
        newP.setAttribute(nodeName, nodeValue);
      });
      const split = newP.moveString
        .split(/([a-zA-Z] {0,1}[-\d. ]*)/)
        .filter((el) => el.length > 0);
      for (let i = 0; i < split.length; i++) {
        newP.moves.push(
          SVGPathElement.fromString(
            split[i],
            i > 0 ? newP.moves[i - 1] : undefined
          )
        );
      }
      console.log(newP);
      this.frame[newP.id] = newP;
      this.gs.state.canvas.svg.appendChild(newP.node);
      // Object.values(doc.querySelector("svg").attributes).forEach(
      //   ({ nodeName, nodeValue }) =>
      //     this.gs.state.canvas.svg.setAttribute(nodeName, nodeValue)
      // );
    });
  }
  view() {
    // list and order all frames
    const orderedTPoints = Object.values(this.gs.timeline.getPoints())
      .sort((a, b) => a.x - b.x)
      .filter((a) => a.type !== "line");
    // TODO:
    //     get first, get last
    //     then enrich all points with "ms" information (keyTimings)

    this.gs.state.canvas.svg.innerHTML = "";
    const animations = {};
    orderedTPoints.forEach((tpoint) => {
      const frame = this.gs.state.frames[tpoint.id];
      Object.values(frame).forEach((path) => {
        const hyphenIndex = path.id.indexOf("-");
        const id =
          hyphenIndex === -1 ? path.id : path.id.substring(0, hyphenIndex);
        const moveString =
          path.moves.map((el) => el.toString({ includeMs: false })).join(" ") +
          "Z";
        if (!animations[id]) {
          animations[id] = {
            d: "",
            initState: moveString,
            attributes: path.attributes,
          };
        }
        animations[id].d += moveString + ";";
      });
    });
    Object.values(animations).forEach((el) => {
      const pathNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathNode.setAttribute("d", el.initState);
      // pathNode.setAttribute("stroke", "#333");
      // pathNode.setAttribute("fill", "#333");
      const animateNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "animate"
      );
      animateNode.setAttribute("attributeName", "d");
      animateNode.setAttribute("values", el.d);
      animateNode.setAttribute("dur", "5s");
      animateNode.setAttribute("repeatCount", "indefinite");
      pathNode.appendChild(animateNode);
      this.gs.state.canvas.svg.appendChild(pathNode);
      Object.entries(el.attributes).forEach(([field, value]) => {
        pathNode.setAttribute(field, value);
      });
    });
  }
  move(event) {
    let target = this.frame[event.target?.id];
    if (!target) {
      return;
    }
    const newCoords = pointerToSvgCoords(event);
    switch (event.type) {
      case "mousedown":
        this.gs.setState({ currentPath: target });
        break;
      case "mousemove":
        if (this.gs.currentPath) {
          // todo: finish move
          target.currentPath.move(newCoords, () => {});
        }
        break;
      case "mouseup":
        if (this.gs.currentPath) {
          this.gs.setState({ currentPath: null });
        }
        break;
    }
  }
}
