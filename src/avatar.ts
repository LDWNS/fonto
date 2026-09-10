function stringToHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}
export function getHashColor(str: string) {
  return getColor(stringToHash(str));
}
function getColor(input: number) {
  return `hsl(${input % 360}, 45%, 50%)`;
}
export function generateAvatar(str: string, canvasId: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (canvas == null) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  if (ctx == null) return;
  ctx.clearRect(0, 0, size, size);

  if (!str.trim()) return;

  const hash = stringToHash(str);

  const mainColor = getColor(hash);

  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, size, size);

  const gridCount = 5;
  const cellSize = size / gridCount;
  ctx.fillStyle = mainColor;
  ctx.strokeStyle = mainColor;
  ctx.imageSmoothingEnabled = false;
  const symmNumber = Math.ceil(gridCount / 2); // so avatar is symmetrical

  // Use bits of the hash to decide whether a cell is filled
  for (let row = 0; row < gridCount; row++) {
    for (let col = 0; col < symmNumber; col++) {
      // Pick a pseudo-random bit from the hash based on position
      const bitPosition = row * symmNumber + col;
      const isFilled = (hash >> bitPosition) & 1;

      if (isFilled) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        // Mirror to the right bottom side (col 4 matches col 0, col 3 matches col 1)
        if (col < symmNumber) {
          ctx.fillRect(
            (gridCount - 1 - col) * cellSize,
            (gridCount - 1 - row) * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  }
}
