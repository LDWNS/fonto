export class Tools {
  constructor(gs) {
    this.gs = gs;
    this.history = gs.state.history;
    gs.subscribe(() => {
      this.history = gs.state.history;
    });
  }
  select(event) {
    switch (event.type) {
      case "click":
        switch (event.target.nodeName) {
          case "circle":
            this.gs.setState({ currentPath: this.history[event.target.id] });
            this.gs.setMode({ mode: "CIRCLE-EDIT" });
            break;
          case "line":
            this.gs.setState({ currentPath: this.history[event.target.id] });
            this.gs.setMode({ mode: "LINE-EDIT" });
            break;
          case "path":
            this.gs.setState({ currentPath: this.history[event.target.id] });
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
  #pointerToSvgCoords({ clientX, clientY }) {
    return { x: clientX - this.left, y: clientY - this.top };
  }
  move(event) {
    let target = this.history[event.target?.id];
    if (!target) {
      return;
    }
    const newCoords = this.#pointerToSvgCoords(event);
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
