import type { EditableSVGElement, UpdateAttributeEvent } from "../types";

export class EditableAttributeList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.itemList = null;
    this.relatedAttributes = new Map();
    this.fullRender();
  }
  activated: string[] = [];
  fullRender(attrs?: NamedNodeMap) {
    const editableListContainer = document.createElement("div");

    // get attribute values from getters
    editableListContainer.classList.add("editable-list");
    const name = this.title;

    editableListContainer.innerHTML = `
        <style>
          .editable-list {
            margin-right: .5rem; 
            border-radius: 2px;
            border: solid 1px #fff;
            padding: .5rem;
          }
          li {
            display: grid;
            grid-template-columns: 1.2rem 7rem 3.5rem;
            .col-1 {
              grid-column: 1;
            }
            .col-2 {
              grid-column: 2;
            }
            .col-3 {
              grid-column: 3;
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
          .hidden {display: none;}
        </style>
        <h3>${name}</h3>
        <ul class="item-list">
        </ul>
        <div class="hidden">
          <label>add</label>
          <input class="add-new-list-item-input" type="text">
          <button class="editable-list-add-item icon">&oplus;</button>
        </div>
      `;
    this.itemList = editableListContainer.querySelector(
      ".item-list"
    ) as HTMLUListElement;
    // binding methods
    this.addListItem = this.addListItem.bind(this);
    this.handleRemoveItemListeners = this.handleRemoveItemListeners.bind(this);
    this.removeListItem = this.removeListItem.bind(this);
    document.addEventListener("updateattribute", (ev: UpdateAttributeEvent) => {
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
        this.renderList(item.attributes);
      }
    });

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
      const li = document.createElement("li");
      const isPinned = name.includes("x") || name.includes("y") || name === "r";
      const isAnimated = this.activated.includes(name);
      if (isPinned) {
        const col3 = document.createElement("span");
        col3.className = "col-3";
        col3.innerText = value;
        this.relatedAttributes.set(name, col3);
        li.append(col3);
      } else {
        li.innerHTML = `<edit-word class="col-3" data-id="${id}" data-key="${name}" data-animate="${isAnimated}" data-value>${value}</edit-word>`;
      }
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "col-1";
      checkbox.name = `${id}-${name}`;
      checkbox.id = `${id}-${name}`;
      checkbox.checked = isAnimated;
      checkbox.addEventListener("change", (_) => {
        const customEvent = new CustomEvent("updateattribute", {
          bubbles: true,
          composed: true,
          detail: {
            id: id,
            key: name,
            value: value,
            animate: checkbox.checked,
          },
        } as UpdateAttributeEvent);
        checkbox.dispatchEvent(customEvent);
      });
      checkbox.disabled = !this.activatable || isPinned;
      const label = document.createElement("label");
      label.className = "col-2";
      label.setAttribute("for", `${id}-${name}`);
      label.innerText = name + ": ";

      li.prepend(checkbox, label);
      this.itemList?.appendChild(li);
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

  static observedAttributes = ["title", "activateAble"];
  attributeChangedCallback(_: string, __: string, ___: string) {
    this.fullRender();
  }

  // add items to the list
  addListItem(_: PointerEvent) {
    const textInput = this.shadowRoot!.querySelector(
      ".add-new-list-item-input"
    ) as HTMLInputElement;

    if (textInput.value) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      const childrenLength = this.itemAttributes.size;

      li.textContent = textInput.value;
      button.classList.add("editable-list-remove-item", "icon");
      button.innerHTML = "&ominus;";

      this.itemList!.appendChild(li);
      this.itemList!.children[childrenLength].appendChild(button);

      this.handleRemoveItemListeners([button]);

      textInput.value = "";
    }
  }
  itemList: HTMLUListElement | null;
  relatedAttributes: Map<string, HTMLSpanElement>;
  // fires after the element has been attached to the DOM
  connectedCallback() {
    const removeElementButtons = [
      ...this.shadowRoot!.querySelectorAll(".editable-list-remove-item")!,
    ] as HTMLButtonElement[];
    const addElementButton = this.shadowRoot!.querySelector(
      ".editable-list-add-item"
    ) as HTMLButtonElement;

    this.itemList = this.shadowRoot!.querySelector(".item-list");

    this.handleRemoveItemListeners(removeElementButtons);
    addElementButton.addEventListener("click", this.addListItem, false);
  }

  get title() {
    return this.getAttribute("title") || "";
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

  handleRemoveItemListeners(arrayOfElements: HTMLElement[]) {
    arrayOfElements.forEach((element) => {
      element.addEventListener("click", this.removeListItem, false);
    });
  }

  removeListItem(e: PointerEvent) {
    ((e.target as HTMLElement).parentNode as HTMLElement).remove();
  }
}
