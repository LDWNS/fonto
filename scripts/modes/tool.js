import { SVGPath } from "../classes/path.js";
import { SVGPathElement } from "../classes/pathelement.js";
import { distance, pointerToSvgCoords, uid } from "../helper.js";

export class Tools {
  constructor(gs) {
    this.gs = gs;
    this.frame = gs.state.activeFrame;
    gs.subscribe(() => {
      this.frame = gs.state.activeFrame;
    });
  }
  #groupIds = [];
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
    const frame = {};
    this.gs.state.canvas.svg.innerHTML = "";
    // todo: add animation rendering
    // todo: make this safe: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, "text/html");
    const paths = doc.querySelectorAll("path");
    paths.forEach((p) => {
      const d = p.getAttribute("d");
      const [_, x, y] = d.match(/^M *([0-9.]+) ([0-9.]+)/);
      const newP = new SVGPath(parseInt(x), parseInt(y), p.getAttribute("id")).setAttribute(
        "stroke",
        "none"
      );
      newP.moveString = d;
      newP.moves = [];
      Object.values(p.attributes).forEach(({ nodeName, nodeValue }) => {
        // if (nodeName === "id") {
        //   return;
        // }
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
      frame[newP.id] = newP;
      this.gs.state.canvas.svg.appendChild(newP.node);
      // Object.values(doc.querySelector("svg").attributes).forEach(
      //   ({ nodeName, nodeValue }) =>
      //     this.gs.state.canvas.svg.setAttribute(nodeName, nodeValue)
      // );
    });
    this.gs.state.frames[this.gs.timeline.getActiveTPoint()] = frame;
    this.gs.state.activeFrame = frame;
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
      const paths = Object.values(frame);
      paths.forEach((path) => {
        if (!path.id) {
          // it's probably "groups"
          return;
        }
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
  group(event) {
    let target = this.frame[event.target?.id];
    if (!target || event.type !== "click") {
      return;
    }
    const groups = this.frame.groups ?? {};
    const activeGroup = this.gs.state.activeGroup ?? { id: uid() };
    const isInActiveGroup = Object.keys(activeGroup).includes(target.id);
    if (isInActiveGroup) {
      delete activeGroup[target.id];
      this.frame[event.target?.id].setAttribute("data-group", null);
      let pNode = this.gs.state.canvas.svg.querySelector(`#${target.id}`);
      const gNode = this.gs.state.canvas.svg.querySelector(
        `#${activeGroup.id}`
      );
      pNode = gNode.removeChild(pNode);
      this.gs.state.canvas.svg.appendChild(pNode);
      if (Object.keys(activeGroup).length === 1) {
        delete groups[activeGroup.id];
        this.gs.state.canvas.svg.removeChild(gNode);
      }
    } else {
      activeGroup[target.id] = target;
      this.frame[event.target?.id].setAttribute("data-group", activeGroup.id);
      let pNode = this.gs.state.canvas.svg.querySelector(`#${target.id}`);
      let gNode = this.gs.state.canvas.svg.querySelector(`#${activeGroup.id}`);
      if (!gNode) {
        gNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gNode.setAttribute("id", activeGroup.id);
        this.gs.state.canvas.svg.appendChild(gNode);
      }
      pNode = this.gs.state.canvas.svg.removeChild(pNode);
      gNode.appendChild(pNode);
      groups[activeGroup.id] = activeGroup;
    }
    this.frame.groups = groups;
    this.gs.setState({
      frame: {
        ...this.frame,
        groups: groups,
      },
      activeGroup: activeGroup,
    });
  }
  #lastClick;
  move(event) {
    const coords = pointerToSvgCoords(event, this.gs.state.canvas.window);
    switch (event.type) {
      case "mousedown":
        let target = this.frame[event.target?.id];
        if (!target) {
          return;
        }
        const groupId = event.target.getAttribute("data-group");
        if (!groupId) {
          return;
        }
        // toggle relative
        this.gs.setState({ currentGroup: this.frame.groups[groupId] });
        this.#lastClick = coords;
        break;
      case "mousemove":
        if (this.gs.state.currentGroup) {
          console.log(
            coords.x - this.#lastClick.x,
            coords.y - this.#lastClick.y
          );
        }
        break;
      case "mouseup":
        if (this.gs.state.currentGroup) {
          Object.entries(this.gs.state.currentGroup).forEach(([key, value]) => {
            if (key === "id") {
              return;
            }
            value.move(
              coords.x - this.#lastClick.x,
              coords.y - this.#lastClick.y
            );
          });
          this.#lastClick = null;
        }
        this.gs.setState({ currentGroup: null });
        break;
    }
  }
  scale(event) {
    const coords = pointerToSvgCoords(event, this.gs.state.canvas.window);
    switch (event.type) {
      case "mousedown":
        let target = this.frame[event.target?.id];
        if (!target) {
          return;
        }
        const groupId = event.target.getAttribute("data-group");
        if (!groupId) {
          return;
        }
        // toggle relative
        this.gs.setState({ currentGroup: this.frame.groups[groupId] });
        this.#lastClick = coords;
        break;
      case "mousemove":
        if (this.gs.state.currentGroup) {
          console.log(
            coords.x - this.#lastClick.x,
            coords.y - this.#lastClick.y
          );
        }
        break;
      case "mouseup":
        if (this.gs.state.currentGroup) {
          Object.entries(this.gs.state.currentGroup).forEach(([key, value]) => {
            if (key === "id") {
              return;
            }
            const factor =
              distance({
                x1: this.#lastClick.x,
                y1: this.#lastClick.y,
                x2: coords.x,
                y2: coords.y,
              }) / 100;
            value.scale(factor);
          });
          this.#lastClick = null;
        }
        this.gs.setState({ currentGroup: null });
        break;
    }
  }
}
