import { createTextAreaFrame } from "../framecreator";
import { toast } from "../helper";
import { setCircleMethods } from "../shapes/circle";
import { setLineMethods } from "../shapes/line";
import { createPath, setPathMethods } from "../shapes/path";
import type { Mode, KeydownInputHandler, EditableSVGElement } from "../types";
import DOMPurify from "dompurify";

const ESC: KeydownInputHandler = {
  type: "keydown",
  keyCode: "Escape",
  desc: "switch mode -> NEUTRAL",
  handler: (_, s) => s.setActiveModeId("NEUTRAL"),
};

const frame = createTextAreaFrame();
export const TEXT_INPUT: Mode = {
  name: "TEXT_INPUT",
  frame: frame,
  inputHandlers: [ESC],
  events: {
    modeEnter(s) {
      if (s.data["svg-canvas"]) {
        frame.innerText = (s.data["svg-canvas"] as SVGElement[])
          .map((x) => x.outerHTML)
          .join("\n");
      }
    },
    modeExit(s) {
      const x1 = DOMPurify.sanitize(
        `<svg>${
          (s.activeMainFrameMode.frame as HTMLTextAreaElement).value
        }</svg>`,
        {
          USE_PROFILES: { svg: true, svgFilters: true },
          FORBID_TAGS: ["script", "style", "foreignObject"],
          FORBID_ATTR: ["xlink:href", "href"], // Only if you don't use <use> tags
          ADD_ATTR: ["id"], // SVGs heavily rely on IDs for masks, gradients, and defs
          RETURN_DOM: true,
        }
      ).firstChild as SVGElement; // returns <body><svg>...</svg></body> => firstChild
      s.data["svg-canvas"] = x1.childNodes
        .entries()
        .map(([_, node]) => {
          switch ((node as SVGElement).tagName.toLowerCase()) {
            case "line":
              return setLineMethods(node as SVGLineElement);
            case "circle":
              return setCircleMethods(node as SVGCircleElement);
            case "path":
              return setPathMethods(node as SVGPathElement);
            default:
              toast(
                `Tag not supported by text-input: <${
                  (node as SVGElement).tagName
                }>`
              );
          }
        })
        .filter((node) => !!node)
        .toArray();
    },
  },
};
