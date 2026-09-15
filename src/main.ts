import { DRAW_CIRCLE_MODE } from "./modes/DRAW_CIRCLE";
import { DRAW_LINE_MODE } from "./modes/DRAW_LINE";
import { DRAW_PATH_MODE } from "./modes/DRAW_PATH";
import { EDIT_MODE } from "./modes/EDIT";
import { NEUTRAL_MODE } from "./modes/NEUTRAL";
import { TEXT_INPUT } from "./modes/TEXT_INPUT";
import { TIMELINE } from "./modes/TIMELINE";
import { PLAY } from "./modes/PLAY";
import { App } from "./state";
import { EditableAttributeList } from "./elements/EditableAttributeList";
import { EditWord } from "./elements/EditWord";

customElements.define("editable-list", EditableAttributeList);
customElements.define("edit-word", EditWord);

new App({
  mainFrame: [
    NEUTRAL_MODE,
    DRAW_LINE_MODE,
    EDIT_MODE,
    DRAW_CIRCLE_MODE,
    DRAW_PATH_MODE,
    TEXT_INPUT,
    PLAY,
  ],
  bottomBar: [TIMELINE],
  mainFrameKeys: [],
});
