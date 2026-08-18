import type { EditableSVGElement } from "./geometry";
import type { InputHandler, LifeCycleHandlers } from "./handlermethods";

export type Mode = {
  name: string;
  inputHandlers: InputHandler | InputHandler[];
  frame: SVGElement | HTMLElement;
  events?: LifeCycleHandlers;
  color?: string;
};

export type FrameData = {
  [K in keyof AppFrames]?: AppFrames[K];
};
export interface AppFrames {
  "svg-canvas": SVGElement[];
  "bottom-bar": TimeLineData;
}
export interface TimeLineData {
  duration: number;
  keyframes?: TimeLineFrame[];
}
export interface TimeLineFrame {
  id: string;
  x: number;
  point: SVGCircleElement;
  children: EditableSVGElement[];
}
