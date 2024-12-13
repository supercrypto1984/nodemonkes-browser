import React, { useState, useEffect } from 'react';
import { fetchMonkes, Monke } from '../utils/api';
import MonkeItem from './MonkeItem';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import './MonkesList.css';

const ITEMS_PER_PAGE = 10;

const MonkesList: React.FC = () => {
  const [monkes, setMonkes] = useState<Monke[]>([]);
  const [filteredMonkes, setFilteredMonkes] = useState<Monke[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMonkes = async () => {
      try {
        const data = await fetchMonkes();
        setMonkes(data);
        setFilteredMonkes(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load monkes. Please try again.');
        setLoading(false);
      }
    };

    loadMonkes();
  }, []);

  const handleSearch = (searchTerm: string, bodyType: string) => {
    let filtered = monkes;

    if (searchTerm) {
      const searchNumber = parseInt(searchTerm);
      filtered = monkes.filter(monke => 
        monke.id === searchNumber || monke.inscription === searchNumber
      );
    }

    if (bodyType !== 'all') {
      filtered = filtered.filter(monke => 
        (monke.attributes?.Body || monke.body) === bodyType
      );
    }

    setFilteredMonkes(filtered);
    setCurrentPage(1);
  };

  if (loading) return <div>Loading Node Monkes...</div>;
  if (error) return <div>{error}</div>;

  const pageCount = Math.ceil(filteredMonkes.length / ITEMS_PER_PAGE);
  const currentMonkes = filteredMonkes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const bodyTypes = monkes
  .map(m => m.attributes?.Body || m.body)
  .filter((body): body is string => body !== undefined)
  .sort();

  return (
    <div className="monkes-list">
      <h2>All Monkes</h2>
      <SearchBar onSearch={handleSearch} bodyTypes={bodyTypes} />
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
          {currentMonkes.map(monke => (
            <MonkeItem key={monke.id} monke={monke} />
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalPages={pageCount}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default MonkesList;
