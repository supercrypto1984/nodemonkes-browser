import React from 'react';
import { Monke } from '../utils/api';
import './MonkeItem.css';

interface MonkeItemProps {
  monke: Monke;
}

const MonkeItem: React.FC<MonkeItemProps> = ({ monke }) => {
  const imageUrl = `https://raw.githubusercontent.com/supercrypto1984/nodemonkes-gallery/main/images/${monke.id}.png`;

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

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

    const colorBarElement = document.getElementById(`color-bar-${monke.id}`);
    if (colorBarElement) {
      colorBarElement.innerHTML = `
        <div class="color-cell">
          <div class="color-count">${sortedColors.length}</div>
          <div class="color-bar">
            ${sortedColors.map(([color, percentage]) => 
              `<div class="color-segment" style="background-color: rgb(${color}); height: ${percentage}%"></div>`
            ).join('')}
          </div>
        </div>
      `;
    }
  };

  const formatScriptPubkey = (pubkey: string) => {
    const parts = pubkey.split(' ');
    if (parts.length < 4) return pubkey;
    
    const op1 = parts[0];
    const op2 = parts[1] + ' ' + parts[2];
    const hash = parts[3];
    
    const chunkSize = 32;
    const hashChunks = [];
    for (let i = 0; i < hash.length; i += chunkSize) {
      hashChunks.push(hash.slice(i, i + chunkSize));
    }
    
    return `${op1}\n${op2}\n${hashChunks.join('\n')}`;
  };

  return (
    <tr className="monke-item">
      <td className="monke-id">{monke.id}</td>
      <td>
        <img 
          src={imageUrl} 
          alt={`Nodemonke ${monke.id}`}
          className="monke-image"
          loading="lazy"
          onLoad={handleImageLoad}
        />
      </td>
      <td id={`color-bar-${monke.id}`}>
        <div className="color-cell">
          <div className="color-count">Loading...</div>
        </div>
      </td>
      <td>
        <div className="traits-list">
          {Object.entries(monke.attributes)
            .filter(([key]) => !key.endsWith('Count') && key !== 'Count')
            .map(([key, value]) => {
              const count = monke.attributes[`${key}Count`] as number;
              const percentage = ((count / 10000) * 100).toFixed(1);
              const isRare = parseFloat(percentage) < 1;
              return (
                <div key={key} className={`trait-item ${isRare ? 'rare' : ''}`}>
                  {key}: {value} ({percentage}%)
                </div>
              );
            })}
          <div className="trait-item">Count: {monke.attributes.Count}</div>
        </div>
      </td>
      <td className="monke-rank">{monke.rank || '-'}</td>
      <td className="monke-inscription">{monke.inscription}</td>
      <td className="monke-block">{monke.block}</td>
      <td>
        <div className="script-pubkey">{formatScriptPubkey(monke.scriptPubkey)}</div>
      </td>
    </tr>
  );
};

export default MonkeItem;

