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
  view(event) {
    if (event.type !== "click") {
      return;
    }
    // list and order all frames
    const orderedTPoints = Object.values(this.gs.timeline.getPoints())
      .sort((a, b) => a.x - b.x)
      .filter((a) => a.type !== "line");

    this.gs.state.canvas.svg.innerHTML = "";
    const animations = {};
    orderedTPoints.forEach((tpoint) => {
      const frame = this.gs.state.frames[tpoint.id];
      Object.values(frame).forEach((path) => {
        const hyphenIndex = path.id.indexOf("-");
        const id =
          hyphenIndex === -1 ? path.id : path.id.substring(0, hyphenIndex);
        const moveString =
          path.moves.map((el) => el.toString()).join(" ") + "Z";
        if (!animations[id]) {
          animations[id] = { d: "", initState: moveString };
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
      pathNode.setAttribute("stroke", "#333");
      pathNode.setAttribute("fill", "#333");
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
    });
    // construct an animation for each of the elements in the animation
    console.log();
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
