import { DRAW_CIRCLE_MODE } from "./modes/DRAW_CIRCLE";
import { DRAW_LINE_MODE } from "./modes/DRAW_LINE";
import { DRAW_PATH_MODE } from "./modes/DRAW_PATH";
import { EDIT_MODE } from "./modes/EDIT";
import { NEUTRAL_MODE } from "./modes/NEUTRAL";
import { SELECT_MODE } from "./modes/SELECT";
import { TEXT_INPUT } from "./modes/TEXT_INPUT";
import { TIMELINE } from "./modes/TIMELINE";
import { VIEW } from "./modes/VIEW";
import { App } from "./state";

new App({
  mainFrame: [
    NEUTRAL_MODE,
    SELECT_MODE,
    DRAW_LINE_MODE,
    EDIT_MODE,
    DRAW_CIRCLE_MODE,
    DRAW_PATH_MODE,
    TEXT_INPUT,
    VIEW,
  ],
  bottomBar: [TIMELINE],
});
