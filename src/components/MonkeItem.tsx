import React from 'react';
import { Monke } from '../utils/api';
import { analyzeColors } from '../utils/colorAnalysis';
import './MonkeItem.css';

interface MonkeItemProps {
  monke: Monke;
}

const MonkeItem: React.FC<MonkeItemProps> = ({ monke }) => {
  const imageUrl = `https://raw.githubusercontent.com/supercrypto1984/nodemonkes-gallery/main/images/${monke.id}.png`;

  return (
    <tr>
      <td>{monke.id}</td>
      <td>
        <img 
          src={imageUrl} 
          alt={`Nodemonke ${monke.id}`} 
          className="monke-image"
          onLoad={(e) => analyzeColors(e.target as HTMLImageElement, monke.id)}
        />
      </td>
      <td id={`color-bar-${monke.id}`}>
        <div className="color-cell">
          <div className="color-count">Loading...</div>
        </div>
      </td>
      <td>
        {Object.entries(monke.attributes)
          .filter(([key]) => !key.endsWith('Count') && key !== 'Count')
          .map(([key, value]) => (
            <div key={key} className={`trait-item ${parseFloat(monke.attributes[`${key}Count`] as string) / 100 < 1 ? 'rare' : ''}`}>
              {key}: {value} ({((monke.attributes[`${key}Count`] as number) / 10000 * 100).toFixed(1)}%)
            </div>
          ))}
        <div className="trait-item">Count: {monke.attributes.Count}</div>
      </td>
      <td>{monke.rank || '-'}</td>
      <td>{monke.inscription}</td>
      <td>{monke.block}</td>
      <td className="script-pubkey">{formatScriptPubkey(monke.scriptPubkey)}</td>
    </tr>
  );
};

function formatScriptPubkey(pubkey: string): string {
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
}

export default MonkeItem;

