export async function getColorData(img: HTMLImageElement): Promise<[string, number][]> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colorMap = new Map<string, number>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const color = `${r},${g},${b}`;
    colorMap.set(color, (colorMap.get(color) || 0) + 1);
  }

  const sortedColors = Array.from(colorMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([color, count]) => {
      const percentage = (count / (canvas.width * canvas.height)) * 100;
      return [color, percentage] as [string, number];
    });

  return sortedColors;
}
