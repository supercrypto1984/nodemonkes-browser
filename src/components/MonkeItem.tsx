import React from 'react';
import { Monke } from '../types';
import { getImageColors } from '../utils/api';
import { formatScriptPubkey, calculatePercentage } from '../utils/helpers';
import './MonkeItem.css';

interface MonkeItemProps {
  monke: Monke;
  index: number; // Add index prop to determine if image is above fold
}

const MonkeItem: React.FC<MonkeItemProps> = ({ monke, index }) => {
  const imageUrl = `https://raw.githubusercontent.com/supercrypto1984/nodemonkes-gallery/main/images/${monke.id}.png`;
  
  // Only use lazy loading for images below the first 3 rows
  const shouldLazyLoad = index >= 3;

  const handleImageLoad = async (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    const colorBarElement = document.getElementById(`color-bar-${monke.id}`);
    
    if (!colorBarElement) return;

    try {
      const colors = await getImageColors(imageUrl);
      const colorBarHtml = `
        <div class="color-cell">
          <div class="color-count">${colors.length}</div>
          <div class="color-bar">
            ${colors.map(color => 
              `<div class="color-segment" style="background-color: rgb(${color.r},${color.g},${color.b});"></div>`
            ).join('')}
          </div>
        </div>`;
      colorBarElement.innerHTML = colorBarHtml;
    } catch (error) {
      console.error('Failed to analyze image colors:', error);
      colorBarElement.innerHTML = '<div class="color-cell"><div class="color-count">Error</div></div>';
    }
  };

  return (
    <tr className="monke-item">
      <td className="monke-id">{monke.id}</td>
      <td className="monke-image-cell">
        <img 
          src={imageUrl} 
          alt={`Nodemonke ${monke.id}`}
          className="monke-image"
          loading={shouldLazyLoad ? "lazy" : "eager"}
          onLoad={handleImageLoad}
          onError={(e) => (e.currentTarget.classList.add('error'))}
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
              const countKey = `${key}Count` as keyof typeof monke.attributes;
              const count = monke.attributes[countKey] as number;
              const percentage = calculatePercentage(count);
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

