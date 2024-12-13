import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (searchTerm: string, bodyType: string) => void;
  bodyTypes: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, bodyTypes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bodyType, setBodyType] = useState('all');

  const handleSearch = () => {
    onSearch(searchTerm, bodyType);
  };

  return (
    <div className="search-container">
      <select 
        value={bodyType} 
        onChange={(e) => setBodyType(e.target.value)}
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
        placeholder="Search ID or Inscription..."
        onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;

