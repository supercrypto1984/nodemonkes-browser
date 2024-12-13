import React, { useEffect, useRef } from 'react';
import { initializeAnimation } from '../utils/animation';
import './Header.css';

const Header: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      initializeAnimation(canvasRef.current);
    }
  }, []);

  return (
    <div className="header">
      <div className="animation-viewport">
        <canvas ref={canvasRef} id="animationCanvas"></canvas>
      </div>
    </div>
  );
};

export default Header;

