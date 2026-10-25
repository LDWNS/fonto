import type { Coord, EditableSVGElement, EditPoint } from ".";
import type { InputHandler, LifeCycleHandlers } from "./handlermethods";

export type Mode = {
  name: string;
  inputHandlers: InputHandler[];
  frame: SVGElement | HTMLElement;
  rightContainer?: SVGElement | HTMLElement;
  events?: LifeCycleHandlers;
  color?: string;
  modeKey?: string;
  subModes?: Mode[];
  alwaysAvailable?: boolean;
};

export type FrameData = {
  "svg-canvas": EditableSVGElement[];
  animation: TimeLineData;
};
export interface TimeLineData {
  width: number;
  duration: number;
  keyframes: TimeLineFrame[];
  currentKeyframe?: TimeLineFrame;
}
export interface TimeLineFrame {
  update(projCoord?: Coord): void;
  id: string;
  x: number;
  point: EditPoint;
}
