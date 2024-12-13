import React from 'react';
import Header from '../components/Header';
import MonkesList from '../components/MonkesList';

const Home: React.FC = () => {
  return (
    <div className="app">
      <div className="header-container">
        <Header />
      </div>
      <div className="content-container">
        <MonkesList />
      </div>
    </div>
  );
};

export default Home;

