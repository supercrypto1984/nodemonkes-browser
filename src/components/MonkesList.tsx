import React, { useState, useEffect, useCallback } from 'react';
import { Monke } from '../types';
import { fetchMonkes, getImageColors } from '../utils/api';
import { formatScriptPubkey, calculatePercentage } from '../utils/helpers';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import './MonkesList.css';

const ITEMS_PER_PAGE = 10;
const TOTAL_MONKES = 10000;
const IMAGE_URL = 'https://raw.githubusercontent.com/supercrypto1984/nodemonkes-gallery/main/images';

const MonkesList: React.FC = () => {
  const [allMonkes, setAllMonkes] = useState<Monke[]>([]);
  const [filteredMonkes, setFilteredMonkes] = useState<Monke[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBody, setSelectedBody] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMonkes = async () => {
      try {
        const data = await fetchMonkes();
        setAllMonkes(data);
        setFilteredMonkes(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load monkes. Please try again.');
        setLoading(false);
      }
    };

    loadMonkes();
  }, []);

  const handleSearch = useCallback((term: string, body: string) => {
    setSearchTerm(term);
    setSelectedBody(body);
    let filtered = allMonkes;

    if (term) {
      const searchNumber = parseInt(term);
      filtered = allMonkes.filter(monke => 
        monke.id === searchNumber || monke.inscription === searchNumber
      );
    }

    if (body !== 'all') {
      filtered = filtered.filter(monke => 
        (monke.attributes?.Body || monke.body) === body
      );
    }

    filtered.sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
    setFilteredMonkes(filtered);
    setCurrentPage(1);
  }, [allMonkes]);

  const updateColorBar = useCallback(async (imageUrl: string, colorBarId: string) => {
    try {
      const colors = await getImageColors(imageUrl);
      const colorBarHtml = `
        <div class="color-cell">
          <div class="color-count">${colors.length}</div>
          <div class="color-bar">
            ${colors.map(color => 
              `<div class="color-segment" 
                style="background-color: rgb(${color.r},${color.g},${color.b});"></div>`
            ).join('')}
          </div>
        </div>`;
      const colorBarElement = document.getElementById(colorBarId);
      if (colorBarElement) {
        colorBarElement.innerHTML = colorBarHtml;
      }
    } catch (error) {
      console.error('Failed to analyze image colors:', error);
    }
  }, []);

  const renderMonkeRow = useCallback((monke: Monke) => {
    const imageUrl = `${IMAGE_URL}/${monke.id}.png`;
    const colorBarId = `color-bar-${monke.id}`;
    
    const traitsHtml = Object.entries(monke.attributes)
      .filter(([key]) => !key.endsWith('Count') && key !== 'Count')
      .map(([key, value]) => {
        const count = monke.attributes[`${key}Count`] as number;
        const percentage = calculatePercentage(count);
        const isRare = percentage < 1;
        return (
          <div key={key} className={`trait-item ${isRare ? 'rare' : ''}`}>
            {key}: {value} ({percentage}%)
          </div>
        );
      });

    return (
      <tr key={monke.id}>
        <td>{monke.id}</td>
        <td>
          <img 
            src={imageUrl} 
            className="monke-image" 
            alt={`Nodemonke ${monke.id}`} 
            loading="lazy"
            onError={(e) => (e.target as HTMLImageElement).classList.add('error')}
            onLoad={() => updateColorBar(imageUrl, colorBarId)}
          />
        </td>
        <td id={colorBarId}>
          <div className="color-cell">
            <div className="color-count">Loading...</div>
          </div>
        </td>
        <td>
          <div className="traits-list">
            {traitsHtml}
            <div className="trait-item">Count: {monke.attributes.Count}</div>
          </div>
        </td>
        <td>{monke.rank || 'N/A'}</td>
        <td>{monke.inscription}</td>
        <td>{monke.block}</td>
        <td className="script-pubkey">{formatScriptPubkey(monke.scriptPubkey)}</td>
      </tr>
    );
  }, [updateColorBar]);

  if (loading) return <div className="loading">Loading NODEMONKES...</div>;
  if (error) return <div className="error">{error}</div>;

  const pageCount = Math.ceil(filteredMonkes.length / ITEMS_PER_PAGE);
  const pageMonkes = filteredMonkes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="monkes-container">
      <h2 id="bodyTitle">{selectedBody === 'all' ? 'All Monkes' : selectedBody}</h2>
      <SearchBar onSearch={handleSearch} bodyTypes={[...new Set(allMonkes.map(m => m.attributes?.Body || m.body))].sort()} />
      <div className="table-container">
        <table>
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
            {pageMonkes.map(renderMonkeRow)}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={pageCount}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default MonkesList;

