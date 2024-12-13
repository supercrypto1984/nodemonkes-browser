export async function getColorData(img: HTMLImageElement): Promise<[string, number][]> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const scale = 0.1; // 缩小图像以提高性能
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colorMap = new Map<string, number>();

  // Count pixel colors
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent pixels
    if (a === 0) continue;

    const color = `${r},${g},${b}`;
    colorMap.set(color, (colorMap.get(color) || 0) + 1);
  }

  // Convert to array and sort by frequency
  const sortedColors = Array.from(colorMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([color, count]) => {
      const percentage = (count / (canvas.width * canvas.height)) * 100;
      return [color, percentage] as [string, number];
    });

  // 确保返回前5种主要颜色
  return sortedColors.slice(0, 5);
}

