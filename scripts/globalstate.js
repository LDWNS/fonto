import { SVGCircle, SVGLine } from "./classes.js";

const loadHistory = (svg) => {
  const hydratedList = {};
  Object.entries(JSON.parse(localStorage.getItem("history") ?? "{}")).forEach(
    ([_, item]) => {
      let newItem;
      switch (item.type) {
        case "circle":
          newItem = SVGCircle.fromHistory(item);
          svg.appendChild(newItem.circle);
          break;
        case "line":
          newItem = SVGLine.fromHistory(item);
          svg.appendChild(newItem.line);
          break;
        default:
          break;
      }
      if (newItem) {
        hydratedList[newItem.id] = newItem;
      }
    },
  );
  return hydratedList;
};
class Store {
  constructor(initialState) {
    this.state = {
      ...initialState,
    };
    this.state.history = loadHistory(this.state.svg);
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  unsubscribe(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener());
  }

  save = (item) => {
    if (item) {
      this.state.history[item.id] = item;
    }
    localStorage.setItem("history", JSON.stringify(this.state.history));
    this.listeners.forEach((listener) => listener());
  };
  remove = (id) => {
    if (id) {
      delete this.state.history[id];
    }
    localStorage.setItem("history", JSON.stringify(history));
    this.listeners.forEach((listener) => listener());
  };
}
export { Store };
