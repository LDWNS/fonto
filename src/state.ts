import type {
  FrameData,
  BaseInputHandler,
  EditableSVGElement,
  InputHandler,
  KeydownInputHandler,
  Mode,
} from "./types";
import { eventToKeyCode, logInput, toast } from "./helper";
import { generateAvatar, getHashColor } from "./avatar";

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
    this.cycle(this.loadedBottomBarModes[0], false);
    this.cycle(this.loadedMainFrameModes[0], true);

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

  bbCycle(newMode = this.activeBottomBarMode) {
    this.activeBottomBarMode = newMode;

    bottomBar.appendChild(this.activeBottomBarMode.frame);

    this.#activateListeners(
      this.activeBottomBarMode,
      this.bbKeyHandlers,
      this.bbMouseHandlers,
      bottomBarInputHelp
    );
  }

  mfCycle(newMode = this.activeMainFrameMode) {
    generateAvatar(newMode.name, "modeAvatar");
    this.activeMainFrameMode = newMode;
    modeIndicator.innerText = newMode.name;
    modeIndicator.style.color =
      this.activeMainFrameMode.color ?? getHashColor(newMode.name);
    root.style.setProperty("--c-accent", newMode.color ?? "#555");
    app.appendChild(newMode.frame);
    this.#activateListeners(
      newMode,
      this.mfKeyHandlers,
      this.mfMouseHandlers,
      mainInputHelp
    );

    const currentFrameData = this.data["svg-canvas"];
    if (currentFrameData) {
      for (const node of currentFrameData) {
        this.activeMainFrameMode.frame.appendChild(node);
      }
    }
  }

  cycle(newMode?: Mode, mf = true) {
    if (newMode?.events?.preModeEnter && !newMode.events.preModeEnter(this)) {
      return;
    }
    if (newMode?.events?.modeExit) {
      newMode.events.modeExit(this);
    }
    if (mf) {
      this.mfCycle(newMode);
    } else {
      this.bbCycle(newMode);
    }

    if (newMode?.events?.modeEnter) {
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
    this.cycle(newMode);
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
    { inputHandlers, subModes }: Mode,
    keyHandlers: Map<string, KeydownInputHandler[]>,
    mouseHandlers: Map<keyof DocumentEventMap, InputHandler[]>,
    target: HTMLElement
  ) {
    const ihs: InputHandler[] = [];
    target.textContent = "";
    if (subModes) {
      subModes
        .filter(
          (mode) =>
            mode.alwaysAvailable ||
            this.data["bottom-bar"]?.currentKeyFrameIndex === 0
        )
        .forEach((mode) => {
          if (!mode.modeKey) {
            toast(`Mode: ${mode.name} doesn't support the modekey shortcut;`);
            return;
          }
          const ih = {
            type: "keydown",
            keyCode: mode.modeKey,
            desc: "~> " + mode.name.toLowerCase().replaceAll("_", " "),
            handler: (_, s) => s.setActiveModeId(mode.name),
          } as KeydownInputHandler;
          const key = ih.type + "_" + ih.keyCode.toLowerCase();
          const handlerArr = keyHandlers.get(key) ?? [];
          handlerArr.push(ih);
          keyHandlers.set(key, handlerArr);
          ihs.push(ih);
        });
    }
    if (inputHandlers) {
      inputHandlers.forEach((ih) => {
        if (ih.type === "keydown") {
          const kih = ih as KeydownInputHandler;
          const key = kih.type + "_" + kih.keyCode.toLowerCase();
          const handlerArr = keyHandlers.get(key) ?? [];
          handlerArr.push(kih);
          keyHandlers.set(key, handlerArr);
        } else {
          const handlerArr = mouseHandlers.get(ih.type) ?? [];
          handlerArr.push(ih);
          mouseHandlers.set(ih.type, handlerArr);
        }
        if (ih.desc) {
          ihs.push(ih);
        }
      });
    }
    this.generalMFKeyHandlers.forEach((ih) => {
      const key = ih.type + "_" + ih.keyCode.toLowerCase();
      const handlerArr = keyHandlers.get(key) ?? [];
      handlerArr.push(ih);
      keyHandlers.set(key, handlerArr);
      if (ih.desc) {
        ihs.push(ih);
      }
    });
    ihs
      .map((ih) =>
        this.#createInputHelpItem(
          ih.type === "keydown"
            ? `${(ih as KeydownInputHandler).keyCode}`
            : `${ih.type}`,
          ih.desc!
        )
      )
      .forEach((node) => target.appendChild(node));
  }
  #createInputHelpItem(input: string, desc: string) {
    const li = document.createElement("li");
    li.classList.add("inputField");
    const span1 = document.createElement("span");
    span1.innerText = input;
    const span2 = document.createElement("span");
    span2.innerText = desc;
    li.appendChild(span1);
    li.appendChild(span2);
    return li;
  }

  #asArray(a: any | any[]) {
    return Array.isArray(a) ? a : [a];
  }
}
