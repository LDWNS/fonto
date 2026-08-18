import { createSVGFrame } from "../framecreator";
import { isEditableSVGElement } from "../helper";
import type {
  ClickInputHandler,
  EditableSVGElement,
  KeydownInputHandler,
} from "../types";
import type { Mode } from "../types/mode";

let selectedNodes: EditableSVGElement[] = [];
const CLICK: ClickInputHandler = {
  type: "click",
  desc: "(de)select item",
  validator: (e, s) =>
    isEditableSVGElement(e.target) &&
    s.activeMainFrameMode.frame.contains(e.target),
  handler: (e, _) => {
    const target = e.target as EditableSVGElement;
    const wasSelected = target.classList.toggle("selected");
    if (wasSelected) {
      selectedNodes.push(target);
    } else {
      selectedNodes = selectedNodes.filter((x) => x !== target);
    }
  },
};
const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "Escape",
  desc: "switch mode -> NEUTRAL",
  handler: (_, s) => s.setActiveModeId("NEUTRAL"),
};
const e: KeydownInputHandler = {
  type: "keydown",
  keyCode: "e",
  desc: "switch mode -> EDIT",
  handler: (_, s) => s.setActiveModeId("EDIT"),
};

const frame = createSVGFrame();
export const SELECT_MODE: Mode = {
  name: "SELECT",
  frame: frame,
  events: {
    modeEnter(s) {
      selectedNodes = s.selectedNodes;
    },
    modeExit(s) {
      s.selectedNodes = selectedNodes;
    },
  },
  inputHandlers: [ESC, CLICK, e],
  color: "blue",
};
