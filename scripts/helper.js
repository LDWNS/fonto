const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
const distance = ({ x1, y1, x2, y2 }) => {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};
const pointerToSvgCoords = ({ clientX, clientY }, { left, top }) => {
  return { x: clientX - left, y: clientY - top };
};

export { uid, distance, pointerToSvgCoords };
