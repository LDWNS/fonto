import type {
  FrameData,
  BaseInputHandler,
  EditableSVGElement,
  InputHandler,
  KeydownInputHandler,
  Mode,
} from "./types";
import { eventToKeyCode, logInput, toast } from "./helper";

const modeIndicator = document.querySelector("#modeIndicator") as HTMLElement;
const mainInputHelp = document.querySelector("#mainInputHelp") as HTMLElement;
const bottomBarInputHelp = document.querySelector(
  "#bottomBarInputHelp"
) as HTMLElement;
const app = document.querySelector("#app") as HTMLElement;
const bottomBar = document.querySelector("#bottomBar") as HTMLElement;
const root = document.querySelector(":root") as HTMLElement;

export class App {
  // TODO: automate the activation, by scanning and checking which are needed
  activeMainFrameMode: Mode;
  activeBottomBarMode: Mode;
  loadedMainFrameModes: Mode[];
  loadedBottomBarModes: Mode[];

  modeListeners: any;

  data: FrameData = { "svg-canvas": [] };

  // SELECT MODE
  selectedNodes: EditableSVGElement[];

  activeModeMouseHandlers: Map<keyof DocumentEventMap, InputHandler[]> =
    new Map();
  activeModeKeyHandlers: Map<string, KeydownInputHandler[]> = new Map();
  bottomBarMouseHandlers: Map<keyof DocumentEventMap, InputHandler[]> =
    new Map();
  bottomBarKeyHandlers: Map<string, KeydownInputHandler[]> = new Map();

  constructor(modes: { mainFrame: Mode[]; bottomBar: Mode[] }) {
    this.loadedMainFrameModes = modes.mainFrame;
    this.loadedBottomBarModes = modes.bottomBar;
    this.activeMainFrameMode = this.loadedMainFrameModes[0];
    this.activeBottomBarMode = this.loadedBottomBarModes[0];
    this.selectedNodes = [];
    this.activeModeInit(this.loadedMainFrameModes[0]);
    this.bottomBarInit(this.loadedBottomBarModes[0]);

    // TODO: automate the activation, by scanning and checking which are needed
    app.addEventListener("click", (event) => {
      logInput("[click]");
      this.handleEvent(event, "click", this.activeModeMouseHandlers);
    });
    bottomBar.addEventListener("click", (event) => {
      logInput("[click]");
      this.handleEvent(event, "click", this.bottomBarMouseHandlers);
    });
    app.addEventListener("dblclick", (event) => {
      logInput("[dblclick]");
      this.handleEvent(event, "dblclick", this.activeModeMouseHandlers);
    });
    bottomBar.addEventListener("dblclick", (event) => {
      logInput("[dblclick]");
      this.handleEvent(event, "dblclick", this.bottomBarMouseHandlers);
    });
    app.addEventListener("mousedown", (event) => {
      this.handleEvent(event, "mousedown", this.activeModeMouseHandlers);
    });
    bottomBar.addEventListener("mousedown", (event) => {
      this.handleEvent(event, "mousedown", this.bottomBarMouseHandlers);
    });
    app.addEventListener("mousemove", (event) => {
      this.handleEvent(event, "mousemove", this.activeModeMouseHandlers);
    });
    bottomBar.addEventListener("mousemove", (event) => {
      this.handleEvent(event, "mousemove", this.bottomBarMouseHandlers);
    });
    app.addEventListener("mouseup", (event) => {
      this.handleEvent(event, "mouseup", this.activeModeMouseHandlers);
    });
    bottomBar.addEventListener("mouseup", (event) => {
      this.handleEvent(event, "mouseup", this.bottomBarMouseHandlers);
    });
    document.addEventListener("keydown", (event) => {
      const keyCode = eventToKeyCode(event);
      logInput(`[${keyCode}]`);
      const key = event.type + "_" + keyCode;
      let handlers;
      if (bottomBar.contains(event.target as HTMLElement | SVGElement)) {
        handlers = this.bottomBarKeyHandlers.get(key);
      } else {
        handlers = this.activeModeKeyHandlers.get(key);
      }
      if (!handlers) {
        return;
      }
      for (const handler of handlers) {
        this.#handleEvent(event, handler);
      }
    });
  }

  private handleEvent<K extends keyof DocumentEventMap>(
    event: DocumentEventMap[K],
    eventName: K,
    handlerMap: Map<keyof DocumentEventMap, InputHandler[]>
  ) {
    const handlers = handlerMap.get(eventName);
    if (handlers) {
      for (const handler of handlers) {
        this.#handleEvent(event, handler);
      }
    }
  }

  bottomBarInit(newMode: Mode) {
    this.activeBottomBarMode = newMode;

    this.#mapInputHelp(this.activeBottomBarMode, bottomBarInputHelp);
    bottomBar.appendChild(this.activeBottomBarMode.frame);

    this.#activateListeners(
      this.activeBottomBarMode,
      this.bottomBarKeyHandlers,
      this.bottomBarMouseHandlers
    );
    if (newMode.events?.modeEnter) {
      newMode.events.modeEnter(this);
    }
  }

  activeModeInit(newMode: Mode) {
    this.activeMainFrameMode = newMode;

    modeIndicator.innerText = this.activeMainFrameMode.name;
    modeIndicator.style.color = this.activeMainFrameMode.color ?? "#333";
    this.#mapInputHelp(this.activeMainFrameMode, mainInputHelp);
    root.style.setProperty(
      "--c-accent",
      this.activeMainFrameMode.color ?? "#333"
    );
    app.appendChild(this.activeMainFrameMode.frame);

    this.#activateListeners(
      this.activeMainFrameMode,
      this.activeModeKeyHandlers,
      this.activeModeMouseHandlers
    );
    const currentFrameData = this.data["svg-canvas"];
    if (currentFrameData) {
      for (const node of currentFrameData) {
        this.activeMainFrameMode.frame.appendChild(node);
      }
    }
    if (newMode.events?.modeEnter) {
      newMode.events.modeEnter(this);
    }
  }

  setActiveModeId(newModeId: string) {
    const newMode = this.loadedMainFrameModes.find((x) => x.name === newModeId);
    if (newMode) {
      this.setActiveMode(newMode);
    } else {
      toast("Mode not loaded: " + newModeId);
    }
  }
  setActiveMode(newMode: Mode) {
    this.#removeMainFrameListeners();
    if (this.activeMainFrameMode.events?.modeExit) {
      this.activeMainFrameMode.events.modeExit(this);
    }
    app.removeChild(this.activeMainFrameMode.frame);
    this.activeModeInit(newMode);
  }
  toggleBottomBar() {
    if (bottomBar.hasChildNodes()) {
      bottomBar.childNodes.forEach((child) => child.remove());
    } else {
      bottomBar.appendChild(this.activeBottomBarMode.frame);
    }
  }
  #removeMainFrameListeners() {
    this.activeModeMouseHandlers.clear();
    this.activeModeKeyHandlers.clear();
  }
  #handleEvent(
    event: Event, // Or UIEvent, depending on your baseline
    inputHandler: InputHandler | undefined
  ) {
    if (!inputHandler) return;
    const ih = inputHandler as BaseInputHandler<any>;
    if (!ih.validator || ih.validator(event, this)) {
      ih.handler(event, this);
    }
  }

  #activateListeners(
    { inputHandlers }: Mode,
    keyHandlers: Map<string, KeydownInputHandler[]>,
    mouseHandlers: Map<keyof DocumentEventMap, InputHandler[]>
  ) {
    if (inputHandlers) {
      this.#asArray(inputHandlers).forEach((inputHandler: InputHandler) => {
        if (inputHandler.type === "keydown") {
          const ih = inputHandler as KeydownInputHandler;
          const key = ih.type + "_" + ih.keyCode.toLowerCase();
          const handlerArr = keyHandlers.get(key) ?? [];
          handlerArr.push(ih);
          keyHandlers.set(key, handlerArr);
        } else {
          const handlerArr = mouseHandlers.get(inputHandler.type) ?? [];
          handlerArr.push(inputHandler);
          mouseHandlers.set(inputHandler.type, handlerArr);
        }
      });
    }
  }
  #mapInputHelp({ inputHandlers }: Mode, target: HTMLElement): void {
    if (target) {
      target.classList.remove("hidden");
      target.textContent = "";
      this.#asArray(inputHandlers)
        .filter((ih) => ih.desc)
        .map((ih) => {
          const li = document.createElement("li");
          li.classList.add("inputField");
          const span1 = document.createElement("span");
          span1.innerText =
            ih.type === "keydown"
              ? `<${(ih as KeydownInputHandler).keyCode}>`
              : `${ih.type}`;
          const span2 = document.createElement("span");
          span2.innerText = ih.desc;
          li.appendChild(span1);
          li.appendChild(span2);
          return li;
        })
        .forEach((node) => target.appendChild(node));
      if (!target.hasChildNodes()) {
        target.classList.add("hidden");
      }
    }
  }

  #asArray(a: any | any[]) {
    return Array.isArray(a) ? a : [a];
  }
}
