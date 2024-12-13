import React from 'react';
import Header from './components/Header';
import MonkesList from './components/MonkesList';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <MonkesList />
    </div>
  );
};

export default App;

