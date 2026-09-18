import { createEditableListItem } from "../framecreator";
import { dispatchUpdateAttribute } from "../helper";
import type { EditableSVGElement, UpdateAttributeEvent } from "../types";

export class EditableAttributeList extends HTMLElement {
  form: {
    id: string;
    key: HTMLInputElement;
    value: HTMLInputElement;
  } | null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.itemList = null;
    this.form = null;
    this.relatedAttributes = new Map();
    this.fullRender();
  }
  activated: string[] = [];
  fullRender(attrs?: NamedNodeMap) {
    const editableListContainer = document.createElement("div");

    // get attribute values from getters
    editableListContainer.classList.add("editable-list");
    const targetId = this.targetId;

    editableListContainer.innerHTML = `
        <style>
          .editable-list {
            border-radius: 2px;
            border: solid 1px #fff;
            padding: .5rem;
          }
          li {
            display: grid;
            grid-template-columns: 1.2rem 7rem 3.5rem;
            font-size: .8rem;
            align-items: center;

            .col-1 {
              grid-column: 1;
            }
            .col-2 {
              grid-column: 2;
              
            }
            .col-3 {
              grid-column: 3;
              text-align: right;
            }
          }
          div > div {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          h3{
            font-size: 1rem;
            margin-block: 0.5rem;
          }
          ul {
            margin: 0;
            padding: 0;
          }
          form {
            opacity: .8;
            &:focus-within {
              opacity: 1;
            }
          }
          input[type="text"] {
            width: 40%;
          }
          .hidden {display: none;}
        </style>
        <h3>${targetId}</h3>
        <ul class="item-list">
        </ul>
        <form>
          <input class="add-new-key" type="text">:
          <input class="add-new-value" type="text">
          <input type="submit" hidden />
        </form>
      `;
    this.itemList = editableListContainer.querySelector(
      ".item-list"
    ) as HTMLUListElement;
    // binding methods
    this.addListItem = this.addListItem.bind(this);
    this.handleAddListeners = this.handleAddListeners.bind(this);
    this.removeListItem = this.removeListItem.bind(this);

    if (attrs) this.renderList(attrs);

    this.shadowRoot!.textContent = "";
    this.shadowRoot!.appendChild(editableListContainer);
  }
  renderList(attrs: NamedNodeMap) {
    this.itemList!.textContent = ``;
    let id = "";
    for (let i = 0; i < attrs.length; i++) {
      const { name, value } = attrs.item(i)!;
      if (name === "d") continue;
      if (name === "id") {
        id = value;
        continue;
      }
      const li2 = createEditableListItem(this, this.form!.id, name, value);
      this.itemList?.appendChild(li2);
    }
  }

  updateAttribute(la: { attrs: string[]; values: number[] }) {
    for (let i = 0; i < la.attrs.length; i++) {
      const valueEl =
        this.relatedAttributes.get(la.attrs[i]) ??
        this.itemList?.querySelector(`[data-attribute=${la.attrs[i]}] .col-3`);
      if (valueEl) {
        if (la.attrs[i] === "r") {
        } else {
          valueEl.textContent = "" + la.values[i];
        }
      }
    }
  }

  static observedAttributes = ["targetId", "activateAble"];
  attributeChangedCallback(_: string, __: string, ___: string) {
    this.fullRender();
  }

  // add items to the list
  addListItem(e: SubmitEvent) {
    const li = createEditableListItem(
      this,
      this.form!.id,
      this.form!.key.value,
      this.form!.value.value
    );

    this.itemList!.appendChild(li);
    dispatchUpdateAttribute(
      li,
      this.form!.id,
      this.form!.key.value,
      this.form!.value.value,
      false
    );

    this.form!.key.value = "";
    this.form!.value.value = "";
    e.preventDefault();
  }
  itemList: HTMLUListElement | null;
  relatedAttributes: Map<string, HTMLSpanElement>;
  // fires after the element has been attached to the DOM
  connectedCallback() {
    this.fullRender();
    const removeElementButtons = [
      ...this.shadowRoot!.querySelectorAll(".editable-list-remove-item")!,
    ] as HTMLButtonElement[];
    const form = this.shadowRoot!.querySelector("form") as HTMLFormElement;
    this.itemList = this.shadowRoot!.querySelector(".item-list");
    this.form = {
      id: this.targetId,
      key: form.querySelector(".add-new-key") as HTMLInputElement,
      value: form.querySelector(".add-new-value") as HTMLInputElement,
    };

    this.addEventListener("updateattribute", (ev: UpdateAttributeEvent) => {
      const item: EditableSVGElement | null = document.querySelector(
        `#${ev.detail.id}`
      );
      if (item) {
        item.setAttribute(ev.detail.key, ev.detail.value);
        if (ev.detail.animate) {
          item.animatedProperties.add(ev.detail.key);
          this.activated.push(ev.detail.key);
        } else {
          item.animatedProperties.delete(ev.detail.key);
          this.activated = this.activated.filter((el) => el != ev.detail.key);
        }
      }
    });
    this.handleAddListeners(removeElementButtons, "click", this.removeListItem);
    this.handleAddListeners([form], "submit", this.addListItem);
  }
  get targetId() {
    return this.getAttribute("targetId") || "";
  }
  get activatable() {
    return this.getAttribute("activatable") === "true" ? true : false;
  }

  get itemAttributes() {
    const itemAttributes: Map<string, string> = new Map();

    [...this.attributes].forEach((attr) => {
      if (attr.name.includes("list-item-")) {
        const name = attr.name.substring(10); // 10th char = list-item-#
        itemAttributes.set(name, attr.value);
      }
    });

    return itemAttributes;
  }

  handleAddListeners<K extends keyof HTMLElementEventMap>(
    arrayOfElements: HTMLElement[],
    type: K,
    handler: (e: HTMLElementEventMap[K]) => void
  ) {
    arrayOfElements.forEach((element) => {
      element.addEventListener(type, handler, false);
    });
  }

  removeListItem(e: PointerEvent) {
    ((e.target as HTMLElement).parentNode as HTMLElement).remove();
  }
  handleCheckboxChangeEvent(this: HTMLInputElement, _: Event): void {
    dispatchUpdateAttribute(
      this,
      this.id,
      this.name,
      this.dataset.value,
      this.checked
    );
  }
}
