import { Monke, ColorInfo } from '../types';

const JSON_URL = 'https://nodemonkes.4everland.store/transformed_metadata.json';

export async function fetchMonkes(): Promise<Monke[]> {
  try {
    const response = await fetch(JSON_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch monkes data');
    }
    const data = await response.json();
    return data.nodemonkes || data;
  } catch (error) {
    console.error('Error fetching monkes:', error);
    throw error;
  }
}

export async function getImageColors(imageUrl: string): Promise<ColorInfo[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colorMap = new Map<string, number>();

      // Analyze each pixel
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a === 0) continue;

        const colorKey = `${r},${g},${b}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }

      // Convert to array and sort by count
      const colors = Array.from(colorMap.entries())
        .map(([color, count]) => {
          const [r, g, b] = color.split(',').map(Number);
          return { r, g, b, count };
        })
        .sort((a, b) => b.count - a.count);

      resolve(colors);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

