import React, { useState, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (searchTerm: string, bodyType: string) => void;
  bodyTypes: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, bodyTypes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bodyType, setBodyType] = useState('all');

  // 监听 searchTerm 的变化
  useEffect(() => {
    // 当搜索词为空时自动触发搜索
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
    </div>
  );
};

export default SearchBar;

