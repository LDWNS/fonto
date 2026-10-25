import { createAnimateNode } from "../animationhelper";
import type {
  Animation,
  AnimationKeyframe,
  TimeLineData,
  TimeLineFrame,
} from "../types";

export class AnimationAttribute implements Animation {
  animatedAttributes: Set<string>;
  keyframesPerAttribute: Map<string, AnimationKeyframe[]>;
  node: SVGElement;
  duration: number;
  width: number;
  constructor(node: SVGElement, props: string[], timeline: TimeLineData) {
    this.node = node;
    this.animatedAttributes = new Set(props);
    this.keyframesPerAttribute = new Map();
    this.duration = timeline.duration;
    this.width = timeline.width;
    for (const prop of props) {
      const value = node.getAttribute(prop);
      if (value) {
        this.keyframesPerAttribute.set(prop, [
          {
            id: timeline.currentKeyframe!.id,
            keytime: timeline.currentKeyframe!.x,
            attributeValue: value,
          },
        ]);
      }
    }
  }
  addAttribute(attribute: string, initValue: string): void {
    this.animatedAttributes.add(attribute);
    let vi: AnimationKeyframe[] = [];
    this.keyframesPerAttribute.entries().forEach(([_, keyframes]) => {
      if (vi.length === 0) {
        keyframes.forEach((el) => {
          vi.push({ ...el, attributeValue: initValue });
        });
      }
    });
    this.keyframesPerAttribute.set(attribute, vi);
  }
  removeAttribute(attribute: string): void {
    this.animatedAttributes.delete(attribute);
    this.keyframesPerAttribute.delete(attribute);
  }
  addKeyframe(
    currentKeyframe: TimeLineFrame,
    lastKeyframe: TimeLineFrame
  ): void {
    for (let attr of this.animatedAttributes) {
      const values = this.keyframesPerAttribute.get(attr)!;
      const lastValue = values.find(
        (el) => el.id === lastKeyframe.id
      )!.attributeValue;
      values.push({
        id: currentKeyframe.id,
        keytime: currentKeyframe.x,
        attributeValue: lastValue,
      });
      this.keyframesPerAttribute.set(
        attr,
        values.sort((a, b) => a.keytime - b.keytime)
      );
    }
  }
  updateKeytime(id: string, keytime: number) {
    for (let attr of this.animatedAttributes) {
      const values = this.keyframesPerAttribute.get(attr)!;
      this.keyframesPerAttribute.set(
        attr,
        values.map((el) => {
          if (el.id === id) {
            el.keytime = keytime;
          }
          return el;
        })
      );
    }
  }
  updateValues(id: string, attrs: string[], values: (string | number)[]) {
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      const value = values[i].toString();
      this.updateValue(id, attr, value);
    }
  }
  updateValue(keyframeId: string, attr: string, value: string) {
    const values = this.keyframesPerAttribute.get(attr)!;
    if (values) {
      this.keyframesPerAttribute.set(
        attr,
        values.map((el) => {
          if (el.id === keyframeId) {
            el.attributeValue = value;
          }
          return el;
        })
      );
    } else {
      this.addAttribute(attr, value);
    }
  }
  setAnimationNodes(): void {
    this.node.textContent = "";
    const nodes = [];
    for (const prop of this.animatedAttributes) {
      let timings = "";
      let values = "";
      const sortedValues = this.keyframesPerAttribute.get(prop)!.sort();
      const minX = sortedValues[0].keytime;
      const maxX = sortedValues[sortedValues.length - 1].keytime;
      sortedValues.forEach((el) => {
        timings += (el.keytime === 0 ? 0 : (el.keytime - minX) / maxX) + ";";
        values += el.attributeValue + ";";
      });

      nodes.push(
        createAnimateNode(
          prop,
          values,
          ((maxX - minX) / this.width) * this.duration + "ms",
          timings
        )
      );
    }
    this.node.append(...nodes);
  }

  setAttributesToKeyframe(this: AnimationAttribute, keyframeId: string) {
    this.animatedAttributes.forEach((attr) => {
      const attrKeyframes = this.keyframesPerAttribute.get(attr);
      if (attrKeyframes) {
        this.node.setAttribute(
          attr,
          attrKeyframes.find((k) => k.id === keyframeId)!.attributeValue
        );
      }
    });
  }
}
