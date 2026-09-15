import type { EditableSVGElement, UpdateAttributeEvent } from "../types";

export class EditableAttributeList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.itemList = null;
    this.fullRender();
  }
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
          li, div > div {
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
    document.addEventListener("updateattribute", this.updateAttribute);

    if (attrs) this.renderList(attrs);

    this.shadowRoot!.textContent = "";
    this.shadowRoot!.appendChild(editableListContainer);
  }
  renderList(attrs: NamedNodeMap) {
    let innerHTML = ``;
    let id = "";
    for (let i = 0; i < attrs.length; i++) {
      const { name, value } = attrs.item(i)!;
      if (name === "d") continue;
      if (name === "id") {
        id = value;
        continue;
      }
      if (name.includes("x") || name.includes("y") || name === "r") {
        innerHTML += `
          <li>
            ${name}:<span data-id="${id}" data-key="${name}" data-value>${value}</span>
          </li>`;
      } else {
        innerHTML += `
          <li>
            <label for="${id}-${name}">
              <input type="checkbox" class="hidden" name="${id}-${name}" id="${id}-${name}" switch />
              ${name}:
            </label>
            <edit-word data-id="${id}" data-key="${name}" data-value>${value}</edit-word>
          </li>`;
      }
    }
    this.itemList!.innerHTML = innerHTML;
  }
  updateAttribute(ev: UpdateAttributeEvent) {
    const item: EditableSVGElement | null = document.querySelector(
      `${ev.detail.id}`
    );
    if (item) {
      item.setAttribute(ev.detail.key, ev.detail.value);
      if (ev.detail.animate) {
        item.animatedProperties.add(ev.detail.key);
      } else {
        item.animatedProperties.delete(ev.detail.key);
      }
      this.renderList(item.attributes);
    }
  }
  static observedAttributes = ["title"];
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
