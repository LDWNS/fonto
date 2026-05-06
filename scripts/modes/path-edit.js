import { EditPoint } from "../classes/editpoint.js";
import { SVGLine } from "../classes/line.js";
import { SVGPath } from "../classes/path.js";
import { pointerToSvgCoords, uid } from "../helper.js";

const DRAW = 2;
const EDIT = 1;
const SELECT = 0;
export class PathEditor {
  #editPoints = {};
  #gs;
  #svg;
  #currentPath;
  #currentEP;
  #window;
  #modeId;
  #previewLine;
  #lastClick;
  #isDrawing;

  constructor(gs) {
    this.#gs = gs;
    gs.subscribe(() => {
      this.#svg = gs.state.canvas.svg;
      this.#currentPath = gs.state.currentPath;
      this.#window = gs.state.canvas.window;
      this.#modeId = gs.state.modeId;
    });
  }
  exit() {
    this.#currentEP = null;
    this.#isDrawing = false;
    if (this.#previewLine) {
      this.#svg.removeChild(this.#previewLine.node);
      this.#previewLine = null;
    }
    if (this.#modeId === DRAW) {
      // todo: better mode changing
      this.#gs.setMode({ id: EDIT });
      return;
    }
    this.#editPoints = {};
    this.#svg.querySelectorAll("[data-edit]").forEach((elem) => {
      this.#svg.removeChild(elem);
    });
    this.#gs.setState({ currentPath: null });
    this.#gs.setMode({ id: SELECT });
  }
  #startDrawing({ x, y, targetPoint }) {
    if (!this.#currentPath) {
      const newP = SVGPath.create(x, y);
      this.#gs.setState({ currentPath: newP });
      this.#svg.appendChild(newP.path);
      this.#lastClick = { x, y, id: newP.moves[0].id };
    } else {
      if (targetPoint) {
        ({ x, y } = targetPoint);
      }
      let pe = this.#currentPath.addOriginNode({ x, y });
      this.#lastClick = { x, y, id: pe.id };
    }
    this.#previewLine = new SVGLine(x, y).setAttribute("id", "path-preview");
    this.#svg.appendChild(this.#previewLine.node);
    this.#isDrawing = true;
  }
  #drawLine({ x, y, targetPoint }) {
    if (this.#currentPath) {
      let pe;
      if (targetPoint) {
        pe = this.#currentPath.addPoint(targetPoint);
      } else {
        pe = this.#currentPath.addPoint({ x, y });
      }
      this.#lastClick = { x, y, id: pe.id };
    }
  }
  #setCurrentEditPoint({ targetPoint }) {
    if (targetPoint) {
      this.#lastClick = {
        x: targetPoint.x,
        y: targetPoint.y,
        id: targetPoint.id,
      };
      this.#currentEP = targetPoint;
      this.#currentEP.setAttribute("stroke", "#00F");
    }
  }
  #moveEditPoint({ x, y }) {
    if (this.#currentEP) {
      const dx = x - this.#currentEP.x;
      const dy = y - this.#currentEP.y;
      this.#currentEP.update({ x, y });
      this.#currentEP.updateAnchoredPoints(dx, dy);
      this.#currentPath.edit({ x, y, dx, dy, id: this.#currentEP.id });
    }
  }
  #unsetCurrentEditPoint() {
    if (this.#currentEP) {
      this.#currentEP.setAttribute("stroke", "#333");
      this.#currentEP = null;
    }
  }
  #drawPreview({ x, y }) {
    if (this.#previewLine) {
      this.#previewLine
        .setCoords({
          x1: this.#lastClick.x,
          y1: this.#lastClick.y,
          x2: x,
          y2: y,
        })
        .draw();
    }
  }
  #toggleNodeType({ targetPoint }) {
    if (!targetPoint || targetPoint.id.includes("-a-")) {
      return;
    }
    let nPts = this.#currentPath.editNode(targetPoint);
    if (nPts.length === 0) {
      for (let i = 0; i < 2; i++) {
        const a = this.#editPoints[targetPoint.id + "-a-" + i];
        this.#svg.removeChild(a.node);
        if (a.anchorLine) {
          this.#svg.removeChild(a.anchorLine.node);
        }
      }
      return;
    }
    for (let i = 0; i < nPts.length; i++) {
      let nId = targetPoint.id + "-a-" + i;
      const { x, y } = nPts[i];
      const anchorPoint = i === 0 ? targetPoint.prevEP : targetPoint;
      this.#editPoints[nId] = new EditPoint(x, y, nId, 3)
        .setAnchorPoint(anchorPoint)
        .createAnchorLine();
      this.#svg.appendChild(this.#editPoints[nId].node);
      this.#svg.appendChild(this.#editPoints[nId].anchorLine.node);
    }
  }
  #addEPoint() {
    let { x, y, id } = this.#lastClick;
    // potentionally get the last move from currentPath
    const [ep] = EditPoint.create({ x, y, id }, this.#currentEP);
    this.#editPoints[ep.id] = ep;
    this.#currentEP = ep;
    this.#svg.appendChild(ep.node);
  }
  #drawEPoints() {
    let lastEP;
    this.#editPoints = {};
    Object.values(this.#currentPath.getEditPoints()).forEach((ep) => {
      const editPoints = EditPoint.create(ep, lastEP);
      editPoints.forEach((ePoint) => {
        this.#editPoints[ePoint.id] = ePoint;
        this.#svg.appendChild(ePoint.node);
        if (ePoint.anchorLine) {
          this.#svg.appendChild(ePoint.anchorLine.node);
        }
      });
      lastEP = editPoints[0];
    });
    this.#currentEP = null;
  }
  #validateTarget(_) {
    return true;
  }
  #enrichEvent(event) {
    const { x, y } = pointerToSvgCoords(event, this.#window);
    let targetPoint;
    if (
      (event.type === "mousedown" || event.type === "dblclick") &&
      event.target?.attributes["data-edit"]
    ) {
      const id = event.target?.getAttribute("data-point");
      targetPoint = this.#editPoints[id];
    }
    return {
      type: event.type,
      target: event.target,
      key: event.key,
      x: x,
      y: y,
      targetPoint: targetPoint,
    };
  }
  edit(event) {
    if (!this.#validateTarget(event)) {
      return;
    }
    event = this.#enrichEvent(event);
    if (event.type === "mousedown") {
      if (this.#modeId === DRAW) {
        if (!this.#isDrawing) {
          this.#startDrawing(event);
        } else {
          this.#drawLine(event);
        }
        this.#addEPoint();
      }
      if (this.#modeId === EDIT) {
        this.#setCurrentEditPoint(event);
      }
    }
    if (event.type === "mousemove") {
      if (this.#modeId === DRAW) {
        this.#drawPreview(event);
      }
      if (this.#modeId === EDIT) {
        this.#moveEditPoint(event);
      }
    }
    if (event.type === "mouseup") {
      if (this.#modeId === EDIT) {
        this.#unsetCurrentEditPoint();
      }
      this.#gs.save(this.#currentPath);
    }
    if (event.type === "dblclick") {
      if (this.#modeId === EDIT) {
        this.#toggleNodeType(event);
      }
      this.#gs.save(this.#currentPath);
    }
    if (event.key === "Escape") {
      this.exit();
    }

    if (
      this.#modeId === EDIT &&
      this.#currentPath &&
      Object.keys(this.#editPoints).length === 0
    ) {
      this.#drawEPoints();
    }
  }
}
