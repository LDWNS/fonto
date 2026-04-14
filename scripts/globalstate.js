// import { SVGCircle } from "./SVGCircle.js";
// import { SVGLine } from "./SVGLine.js";

const loadHistory = () => {
  const hydratedList = {};
  Object.entries(JSON.parse(localStorage.getItem("history") ?? "{}")).forEach(
    ([_, item]) => {
      let newItem;
      switch (item.type) {
        case "circle":
          newItem = SVGCircle.fromHistory(item);
          break;
        case "line":
          newItem = SVGLine.fromHistory(item);
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
      history: loadHistory(),
      ...initialState,
    };
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
}
export { Store };
