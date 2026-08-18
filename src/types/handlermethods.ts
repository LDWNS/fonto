import { App } from "../state";

export interface BaseInputHandler<K extends keyof DocumentEventMap> {
  type: K;
  desc?: string;
  validator?: (event: DocumentEventMap[K], state: App) => boolean;
  handler: (event: DocumentEventMap[K], state: App) => void;
}
export type InputHandler = {
  [K in keyof DocumentEventMap]: BaseInputHandler<K>;
}[keyof DocumentEventMap];

export interface ClickInputHandler extends BaseInputHandler<"click"> {}
export interface DblClickInputHandler extends BaseInputHandler<"dblclick"> {}
export interface MousedownInputHandler extends BaseInputHandler<"mousedown"> {}
export interface MousemoveInputHandler extends BaseInputHandler<"mousemove"> {}
export interface MouseupInputHandler extends BaseInputHandler<"mouseup"> {}

export interface KeydownInputHandler extends BaseInputHandler<"keydown"> {
  keyCode: string;
}

export interface LifeCycleHandlers {
  modeExit?: (state: App) => boolean | void;
  modeEnter?: (state: App) => boolean | void;
}
