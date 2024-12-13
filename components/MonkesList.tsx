import React, { useState, useEffect, useCallback } from 'react';
import { Monke } from '../types';

const GITHUB_REPO = 'supercrypto1984/nodemonkes-gallery';
const JSON_URL = 'https://nodemonkes.4everland.store/transformed_metadata.json';
const IMAGE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/images`;
const ITEMS_PER_PAGE = 50;
const TOTAL_MONKES = 10000;

const MonkesList: React.FC = () => {
  const [allMonkes, setAllMonkes] = useState<Monke[]>([]);
  const [filteredMonkes, setFilteredMonkes] = useState<Monke[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBody, setSelectedBody] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonkes = async () => {
      try {
        const response = await fetch(JSON_URL);
        if (!response.ok) throw new Error('Failed to load data');
        const jsonData = await response.json();
        const monkes = jsonData.nodemonkes || jsonData;
        setAllMonkes(monkes);
        setFilteredMonkes(monkes);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoading(false);
      }
    };

    fetchMonkes();
  }, []);

  const analyzeColors = useCallback((imageElement: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const colorCounts: { [key: string]: number } = {};

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue;

      const color = `${r},${g},${b}`;
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }

    const sortedColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const totalPixels = canvas.width * canvas.height;
    return sortedColors.map(([color, count]) => {
      const percentage = (count / totalPixels) * 100;
      return [color, percentage];
    });
  }, []);

  const createTableRow = useCallback((monke: Monke) => {
    const imageUrl = `${IMAGE_URL}/${monke.id}.png`;
    
    const traitsHtml = Object.entries(monke.attributes)
      .filter(([key]) => !key.endsWith('Count') && key !== 'Count')
      .map(([key, value]) => {
        const count = monke.attributes[`${key}Count`];
        const percentage = ((count as number) / TOTAL_MONKES * 100).toFixed(1);
        const isRare = parseFloat(percentage) < 1;
        return `<div class="trait-item ${isRare ? 'rare' : ''}">${key}: ${value} (${percentage}%)</div>`;
      })
      .join('');

    const countValue = monke.attributes.Count;
    const countHtml = `<div class="trait-item">Count: ${countValue}</div>`;

    const colorBarId = `color-bar-${monke.id}`;
    
    return (
      <tr key={monke.id}>
        <td className="id-cell">{monke.id}</td>
        <td>
          <img 
            src={imageUrl} 
            className="monke-image" 
            alt={`Nodemonke ${monke.id}`} 
            loading="lazy" 
            onLoad={(e) => {
              const colors = analyzeColors(e.target as HTMLImageElement);
              const colorBar = document.getElementById(colorBarId);
              if (colorBar && colors) {
                colorBar.innerHTML = `
                  <div class="color-cell">
                    <div class="color-count">${colors.length}</div>
                    <div class="color-bar">
                      ${colors.map(([color, percentage]) => 
                        `<div class="color-segment" style="background-color: rgb(${color}); height: ${percentage}%"></div>`
                      ).join('')}
                    </div>
                  </div>
                `;
              }
            }}
          />
        </td>
        <td id={colorBarId}><div className="color-cell"><div className="color-count">Loading...</div></div></td>
        <td>
          <div className="traits-list" dangerouslySetInnerHTML={{ __html: traitsHtml + countHtml }} />
        </td>
        <td className="rank-cell">{monke.rank || '-'}</td>
        <td className="inscription-cell">{monke.inscription}</td>
        <td className="block-cell">{monke.block}</td>
        <td className="script-cell">
          <div className="script-content">
            {monke.scriptPubkey?.split(' ').map((part, i) => (
              <div key={i}>{part}</div>
            ))}
          </div>
        </td>
      </tr>
    );
  }, [analyzeColors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let filtered = allMonkes;

    if (searchTerm) {
      const searchNumber = parseInt(searchTerm);
      filtered = allMonkes.filter(monke => 
        monke.id === searchNumber || monke.inscription === searchNumber
      );
    }

    if (selectedBody !== 'all') {
      filtered = filtered.filter(monke => 
        (monke.attributes?.Body || monke.body) === selectedBody
      );
    }

    filtered.sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
    setFilteredMonkes(filtered);
    setCurrentPage(1);
  };

  const bodyTypes = [...new Set(allMonkes.map(m => m.attributes?.Body || m.body))].sort();

  const pageCount = Math.ceil(filteredMonkes.length / ITEMS_PER_PAGE);
  const pageMonkes = filteredMonkes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) {
    return <div className="loading">Loading NODEMONKES...</div>;
  }

  // 确保网格布局正确
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
    padding: '1rem',
  };

  return (
    <div style={gridStyle}>
      {pageMonkes.map((monke) => (
        <tr key={monke.id}>
          <td className="id-cell">{monke.id}</td>
          <td>
            <img 
              src={`${IMAGE_URL}/${monke.id}.png`} 
              className="monke-image" 
              alt={`Nodemonke ${monke.id}`} 
              loading="lazy" 
            />
          </td>
          <td></td>
          <td></td>
          <td>{monke.rank || '-'}</td>
          <td>{monke.inscription}</td>
          <td>{monke.block}</td>
          <td>
            <div className="script-content">
              {monke.scriptPubkey?.split(' ').map((part, i) => (
                <div key={i}>{part}</div>
              ))}
            </div>
          </td>
        </tr>
      ))}
    </div>
  );
};

export default MonkesList;
