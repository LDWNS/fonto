import { createTextAreaFrame } from "../framecreator";
import { toast } from "../helper";
import { ESC } from "../keyhelper";
import { setCircleMethods } from "../shapes/circle";
import { setLineMethods } from "../shapes/line";
import { setPathMethods } from "../shapes/path";
import type { Mode } from "../types";

const frame = createTextAreaFrame();
export const TEXT_INPUT: Mode = {
  name: "TEXT_INPUT",
  frame: frame,
  modeKey: "i",
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
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.innerHTML = (
        s.activeMainFrameMode.frame as HTMLTextAreaElement
      ).value;
      s.data["svg-canvas"] = svg.childNodes
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
