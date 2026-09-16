import { EditableAttributeList } from "../elements/EditableAttributeList";
import { createRightContainer, createSVGFrame } from "../framecreator";
import {
  isEditableSVGElement,
  isEditPoint,
  pointerToSvgCoords,
} from "../helper";
import { ESC } from "../keyhelper";
import type { App } from "../state";
import {
  type MousemoveInputHandler,
  type EditPoint,
  type MousedownInputHandler,
  type EditableSVGElement,
  type MouseupInputHandler,
  type DblClickInputHandler,
  type UpdateAttributeEvent,
  type Mode,
} from "../types";
import { EditPointType } from "../types/geometry";

let movingPoint: EditPoint | null;
let currentPath: EditableSVGElement | null;

const MOVE: MousemoveInputHandler = {
  type: "mousemove",
  validator: (e, _) =>
    e.target instanceof SVGElement && !!currentPath && !!movingPoint,
  handler: (e, s) => {
    const rect = s.activeMainFrameMode.frame.getBoundingClientRect();
    const { x, y } = pointerToSvgCoords(e, rect);
    const dx = x - movingPoint!.cx.baseVal.value;
    const dy = y - movingPoint!.cy.baseVal.value;
    movingPoint!.update({ x1: x, y1: y });
    movingPoint!.updateAnchoredPoints(dx, dy);
    currentPath!.edit(movingPoint!, { x, y }, dx, dy);
    if (movingPoint!.anchorLine) {
      movingPoint!.anchorLine.update({ x2: x, y2: y });
    }
    if (dx !== 0 || dy !== 0) {
      updateRightContainer(movingPoint!);
    }
    return;
  },
};
const mousedown: MousedownInputHandler = {
  type: "mousedown",
  validator: (e, _) => isEditPoint(e.target),
  handler: (e, _) => {
    movingPoint = e.target as EditPoint;
    const [id, __] = movingPoint.targetId.split("-");
    currentPath = document.querySelector("#" + id) as EditableSVGElement;
  },
};
const mouseup: MouseupInputHandler = {
  type: "mouseup",
  validator: (e, _) =>
    e.target instanceof SVGElement && !!currentPath && !!movingPoint,
  handler: (_, __) => {
    movingPoint = null;
    currentPath = null;
  },
};

const dblclick: DblClickInputHandler = {
  type: "dblclick",
  validator: (e, _) =>
    isEditPoint(e.target) && e.target.type === EditPointType.PATH_1,
  handler: (e, s) => {
    const ep = e.target as EditPoint;
    const [id, __] = ep.targetId.split("-");
    (document.querySelector("#" + id) as SVGPathElement).toggleSegmentType(
      s,
      ep
    );
  },
};

const loadRightContainer = (
  editNodes: EditableSVGElement[],
  activatable = true
) => {
  const rightContainer = document.getElementById(
    "rightContainer"
  ) as HTMLDivElement;
  editNodes.forEach((en) => {
    // map to element to edit attributes
    // add elements to rightContainer
    // make sure to add listeners
    const el = document.createElement("editable-list") as EditableAttributeList;
    el.setAttribute("title", en.id);
    el.setAttribute("activatable", "" + activatable);
    el.activated = [...en.animatedProperties];

    rightContainer.appendChild(el);
    el.renderList(en.attributes);
  });
};

const updateRightContainer = (ep: EditPoint) => {
  if (currentPath) {
    const item = document.querySelector(
      `editable-list[title="${currentPath.id}"]`
    );
    if (item) {
      (item as EditableAttributeList).updateAttribute(
        currentPath.getRelatedAttributes(ep)
      );
    }
  }
};

const frame = createSVGFrame();
const rightContainer = createRightContainer();
export const EDIT_MODE: Mode = {
  name: "EDIT",
  frame: frame,
  modeKey: "e",
  rightContainer: rightContainer,
  alwaysAvailable: true,
  events: {
    modeEnter: (s: App) => {
      let editNodes = s.activeMainFrameMode.frame.childNodes
        .entries()
        .filter(([_, node]) => isEditableSVGElement(node))
        .map(([_, node]) => node as EditableSVGElement)
        .toArray();
      if (s.selectedNodes.length > 0) {
        editNodes = s.selectedNodes;
      }
      editNodes.forEach((node) => {
        const x = node.getEditPoints();
        x.forEach((ep) => {
          s.activeMainFrameMode.frame.appendChild(ep);
          if (ep.anchorLine) {
            s.activeMainFrameMode.frame.appendChild(ep.anchorLine);
          }
        });
      });
      loadRightContainer(
        editNodes,
        s.data["bottom-bar"]?.currentKeyFrameIndex === 0
      );
      document.addEventListener(
        "updateattribute",
        (e: UpdateAttributeEvent) => {
          const item = document.querySelector("#" + e.detail.id);
          item?.setAttribute(e.detail.key, e.detail.value);
        }
      );
    },
    modeExit: (s: App) => {
      const nodes = s.activeMainFrameMode.frame.querySelectorAll("[data-edit]");
      if (nodes) nodes.forEach((n) => n.remove());
      movingPoint = null;
      currentPath = null;
      (
        document.getElementById("rightContainer") as HTMLDivElement
      ).textContent = "";
    },
  },
  inputHandlers: [ESC, mousedown, MOVE, mouseup, dblclick],
  subModes: [],
};
