import React, { useState, useEffect } from 'react';
import { fetchMonkes } from '../utils/api';
import type { Monke } from '../utils/api';
import './MonkesList.css';

const MonkesList: React.FC = () => {
  const [monkes, setMonkes] = useState<Monke[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMonkes = async () => {
      try {
        const data = await fetchMonkes();
        setMonkes(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load monkes. Please try again.');
        setLoading(false);
      }
    };

    loadMonkes();
  }, []);

  if (loading) return <div className="loading">Loading NODEMONKES...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="monkes-container">
      <table className="monkes-table">
        <thead>
          <tr>
            <th>#</th>
            <th>NODEMONKE</th>
            <th>COLOR</th>
            <th>TRAITS</th>
            <th>RANK</th>
            <th>INSCRIPTION #</th>
            <th>BLOCK HEIGHT</th>
            <th>SCRIPT PUBKEY</th>
          </tr>
        </thead>
        <tbody>
          {monkes.map((monke) => (
            <tr key={monke.id} className="monke-row">
              <td className="id-cell">{monke.id}</td>
              <td className="image-cell">
                <img
                  src={`https://raw.githubusercontent.com/supercrypto1984/nodemonkes-gallery/main/images/${monke.id}.png`}
                  alt={`Nodemonke ${monke.id}`}
                  className="monke-image"
                  loading="lazy"
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
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

                    const colorBar = document.getElementById(`color-bar-${monke.id}`);
                    if (colorBar) {
                      colorBar.innerHTML = `
                        <div class="color-bar">
                          ${sortedColors.map(([color]) => 
                            `<div class="color-segment" style="background-color: rgb(${color})"></div>`
                          ).join('')}
                        </div>
                      `;
                    }
                  }}
                />
              </td>
              <td className="color-cell" id={`color-bar-${monke.id}`}>
                <div className="color-bar loading"></div>
              </td>
              <td className="traits-cell">
                {Object.entries(monke.attributes)
                  .filter(([key]) => !key.endsWith('Count') && key !== 'Count')
                  .map(([key, value]) => {
                    const count = monke.attributes[`${key}Count`] as number;
                    const percentage = ((count / 10000) * 100).toFixed(1);
                    return (
                      <div key={key} className="trait">
                        {key}: {value} ({percentage}%)
                      </div>
                    );
                  })}
                <div className="trait">Count: {monke.attributes.Count}</div>
              </td>
              <td className="rank-cell">{monke.rank || '-'}</td>
              <td className="inscription-cell">{monke.inscription}</td>
              <td className="block-cell">{monke.block}</td>
              <td className="script-cell">{monke.scriptPubkey}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonkesList;

