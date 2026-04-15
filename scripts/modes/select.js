export class Selector {
  constructor(gs) {
    this.gs = gs;
    this.history = gs.state.history;
    gs.subscribe(() => {
      this.history = gs.state.history;
    });
  }
  select(event, updateMode) {
    switch (event.type) {
      case "click":
        switch (event.target.nodeName) {
          case "circle":
            this.gs.setState({ currentPath: this.history[event.target.id] });
            updateMode("CIRCLE-EDIT");
            break;
          case "line":
            this.gs.setState({ currentPath: this.history[event.target.id] });
            updateMode("LINE-EDIT");
            break;

          default:
            break;
        }
        break;
      default:
        break;
    }
  }
}
