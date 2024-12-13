import React, { useEffect, useRef } from 'react';

const Header: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = 168;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up animation parameters
    const params = {
      frameCount: 36,
      frameDelay: 16,
      baseSize: 28,
      hdScale: 6
    };

    // Animation state
    let frame = 0;
    let currentImage: HTMLImageElement | null = null;

    // Load and draw the monke image
    const loadImage = () => {
      const img = new Image();
      img.src = '/monke-sprite.png'; // Replace with your actual sprite sheet
      img.onload = () => {
        currentImage = img;
      };
    };

    // Animation loop
    const animate = () => {
      if (currentImage) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the current frame
        const frameWidth = currentImage.width / params.frameCount;
        const frameHeight = currentImage.height;
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          currentImage,
          frame * frameWidth,
          0,
          frameWidth,
          frameHeight,
          0,
          0,
          params.baseSize * params.hdScale,
          params.baseSize * params.hdScale
        );

        frame = (frame + 1) % params.frameCount;
      }

      setTimeout(() => {
        requestAnimationFrame(animate);
      }, params.frameDelay);
    };

    // Start the animation
    loadImage();
    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="header-canvas"
      style={{
        imageRendering: 'pixelated',
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default Header;

