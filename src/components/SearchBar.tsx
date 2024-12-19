import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import { Camera } from 'lucide-react';

interface SearchBarProps {
  onSearch: (searchTerm: string, bodyType: string) => void;
  bodyTypes: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, bodyTypes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bodyType, setBodyType] = useState('all');

  useEffect(() => {
    if (searchTerm === '') {
      onSearch('', bodyType);
    }
  }, [searchTerm, bodyType, onSearch]);

  const handleSearch = () => {
    onSearch(searchTerm, bodyType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <select 
        value={bodyType}
        onChange={(e) => {
          setBodyType(e.target.value);
          onSearch(searchTerm, e.target.value);
        }}
        aria-label="Filter by body type"
      >
        <option value="all">All Monkes</option>
        {bodyTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyUp={handleKeyPress}
        placeholder="Search ID or Inscription..."
        aria-label="Search by ID or Inscription"
      />
      <button onClick={handleSearch}>Search</button>
      <a 
        href="https://supercrypto1984.github.io/nodemonkes-gif/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="gif-tool-link"
      >
        <Camera className="gif-icon" />
        <span>Make GIF</span>
      </a>
    </div>
  );
};

export default SearchBar;

