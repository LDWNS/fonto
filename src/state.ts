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

  mainModeHistory: Mode[];

  modeListeners: any;

  data: FrameData = { "svg-canvas": [] };

  // SELECT MODE
  selectedNodes: EditableSVGElement[];

  generalMFKeyHandlers: KeydownInputHandler[];
  mfMouseHandlers: Map<keyof DocumentEventMap, InputHandler[]> = new Map();
  mfKeyHandlers: Map<string, KeydownInputHandler[]> = new Map();
  bbMouseHandlers: Map<keyof DocumentEventMap, InputHandler[]> = new Map();
  bbKeyHandlers: Map<string, KeydownInputHandler[]> = new Map();

  constructor(modes: {
    mainFrame: Mode[];
    bottomBar: Mode[];
    mainFrameKeys: KeydownInputHandler[];
  }) {
    this.loadedMainFrameModes = modes.mainFrame;
    this.loadedBottomBarModes = modes.bottomBar;
    this.activeMainFrameMode = this.loadedMainFrameModes[0];
    this.activeBottomBarMode = this.loadedBottomBarModes[0];
    this.mainModeHistory = [];
    this.selectedNodes = [];
    this.generalMFKeyHandlers = modes.mainFrameKeys;
    this.mfModeInit(this.loadedMainFrameModes[0]);
    this.bbModeInit(this.loadedBottomBarModes[0]);

    // TODO: automate the activation, by scanning and checking which are needed
    this.addEventListener(app, "click", this.mfMouseHandlers, true);
    this.addEventListener(bottomBar, "click", this.bbMouseHandlers, true);
    this.addEventListener(app, "dblclick", this.mfMouseHandlers, true);
    this.addEventListener(bottomBar, "dblclick", this.bbMouseHandlers, true);
    this.addEventListener(app, "mousedown", this.mfMouseHandlers);
    this.addEventListener(bottomBar, "mousedown", this.bbMouseHandlers);
    this.addEventListener(app, "mousemove", this.mfMouseHandlers);
    this.addEventListener(bottomBar, "mousemove", this.bbMouseHandlers);
    this.addEventListener(app, "mouseup", this.mfMouseHandlers);
    this.addEventListener(bottomBar, "mouseup", this.bbMouseHandlers);
    document.addEventListener("keydown", (event) => {
      const keyCode = eventToKeyCode(event);
      logInput(`[${keyCode}]`);
      const key = event.type + "_" + keyCode;
      let handlers;
      if (bottomBar.contains(event.target as HTMLElement | SVGElement)) {
        handlers = this.bbKeyHandlers.get(key);
      } else {
        handlers = this.mfKeyHandlers.get(key);
      }
      if (!handlers) {
        return;
      }
      for (const handler of handlers) {
        this.#handleEvent(event, handler);
      }
    });
  }

  private addEventListener<K extends keyof DocumentEventMap>(
    target: HTMLElement,
    eventName: K,
    inputHandlers: Map<keyof DocumentEventMap, InputHandler[]>,
    log = false
  ) {
    target.addEventListener(eventName, (event) => {
      if (log) {
        logInput(`[${eventName}]`);
      }
      this.handleEvent(event as DocumentEventMap[K], eventName, inputHandlers);
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

  bbModeInit(newMode: Mode) {
    this.activeBottomBarMode = newMode;

    this.#mapInputHelp(
      this.#asArray(this.activeBottomBarMode.inputHandlers),
      bottomBarInputHelp
    );
    bottomBar.appendChild(this.activeBottomBarMode.frame);

    this.#activateListeners(
      this.activeBottomBarMode,
      this.bbKeyHandlers,
      this.bbMouseHandlers
    );
    if (newMode.events?.modeEnter) {
      newMode.events.modeEnter(this);
    }
  }

  mfModeInit(newMode: Mode) {
    if (newMode.events?.preModeEnter && !newMode.events.preModeEnter(this)) {
      return;
    }
    this.activeMainFrameMode = newMode;

    modeIndicator.innerText = this.activeMainFrameMode.name;
    modeIndicator.style.color = this.activeMainFrameMode.color ?? "#333";
    this.#mapInputHelp(
      this.#asArray(this.activeMainFrameMode.inputHandlers),
      mainInputHelp,
      true
    );
    root.style.setProperty(
      "--c-accent",
      this.activeMainFrameMode.color ?? "#333"
    );
    app.appendChild(this.activeMainFrameMode.frame);

    this.#activateListeners(
      this.activeMainFrameMode,
      this.mfKeyHandlers,
      this.mfMouseHandlers
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
      this.mainModeHistory.push(newMode);
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
    this.mfModeInit(newMode);
  }
  toggleBottomBar() {
    if (bottomBar.hasChildNodes()) {
      bottomBar.childNodes.forEach((child) => child.remove());
    } else {
      bottomBar.appendChild(this.activeBottomBarMode.frame);
    }
  }
  #removeMainFrameListeners() {
    this.mfMouseHandlers.clear();
    this.mfKeyHandlers.clear();
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
    this.generalMFKeyHandlers.forEach((ih) => {
      const key = ih.type + "_" + ih.keyCode.toLowerCase();
      const handlerArr = keyHandlers.get(key) ?? [];
      handlerArr.push(ih);
      keyHandlers.set(key, handlerArr);
    });
  }
  #mapInputHelp(
    inputHandlers: InputHandler[],
    target: HTMLElement,
    loadGeneralInputHelpers = false
  ): void {
    if (target) {
      target.classList.remove("hidden");
      target.textContent = "";
      const ihs = loadGeneralInputHelpers
        ? [...inputHandlers, ...this.generalMFKeyHandlers]
        : inputHandlers;
      ihs
        .filter((ih) => ih.desc)
        .map((ih) => {
          const li = document.createElement("li");
          li.classList.add("inputField");
          const span1 = document.createElement("span");
          span1.innerText =
            ih.type === "keydown"
              ? `${(ih as KeydownInputHandler).keyCode}`
              : `${ih.type}`;
          const span2 = document.createElement("span");
          span2.innerText = ih.desc!;
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
