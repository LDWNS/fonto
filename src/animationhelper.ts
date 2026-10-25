function createAnimateNode(
  attributeName: string,
  values: string,
  duration: string,
  keyTimes: string,
) {
  const animateNode = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animate"
  );
  animateNode.setAttribute("attributeName", attributeName);
  animateNode.setAttribute("values", values);
  animateNode.setAttribute("dur", duration);
  animateNode.setAttribute("keyTimes", keyTimes);
  animateNode.setAttribute("fill", "freeze");
  return animateNode;
}

export { createAnimateNode };
