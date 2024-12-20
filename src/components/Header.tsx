import React, { useEffect, useRef, useState } from 'react';
import './Header.css';

const PARAMS = {
  frameCount: 36,
  frameDelay: 16,
  rotationRange: 0.08,
  pressDownStrength: 30,
  insertionStrength: 40,
  insertionAngle: 0.06,
  squashStrength: 0.15,
  displayDuration: 5000,
  baseSize: 28,
  hdScale: 6,
  transitionDuration: 500,
  nodDuration: 800,
  exitDuration: 7500,
  entranceDuration: 7500,
  movementRange: 2.0,
};

const AnimationState = {
  LOADING: 'loading',
  DISPLAY: 'display',
  NOD: 'nod',
  EXIT: 'exit',
  ENTRANCE: 'entrance'
};

const Header: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null!);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      console.error('Canvas or container not found');
      return;
    }

    const ctx = canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true
    });
    if (!ctx || !container) return;

    ctx.imageSmoothingEnabled = false;

    let animationFrameId: number;
    let currentState = AnimationState.LOADING;
    let stateStartTime = 0;
    let currentImage: any = null;
    let nextImage: any = null;
    let frame = 0;

    const imageQueue: any[] = [];
    const MAX_QUEUE_SIZE = 3;

    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d', {
      willReadFrequently: true,
      alpha: true
    });
    if (!offscreenCtx) return;

    function calculateOptimalSize(containerHeight: number) {
      const scale = Math.floor(containerHeight / PARAMS.baseSize);
      return {
        width: PARAMS.baseSize * scale,
        height: PARAMS.baseSize * scale,
        scale: scale
      };
    }

    function createImageSlices(image: HTMLImageElement, scale: number) {
      const width = image.width;
      const height = image.height;
      const splitLine = Math.floor(23 * scale);

      const upperCanvas = document.createElement('canvas');
      upperCanvas.width = width;
      upperCanvas.height = splitLine;
      const upperCtx = upperCanvas.getContext('2d', {alpha: true});
      if (upperCtx) upperCtx.imageSmoothingEnabled = false;

      const lowerCanvas = document.createElement('canvas');
      lowerCanvas.width = width;
      lowerCanvas.height = height - splitLine;
      const lowerCtx = lowerCanvas.getContext('2d', {alpha: true});
      if (lowerCtx) lowerCtx.imageSmoothingEnabled = false;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d', {alpha: true});
      if (tempCtx) {
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.clearRect(0, 0, width, height);
        tempCtx.drawImage(image, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, width, height);
        const upperImageData = new ImageData(width, splitLine);
        const lowerImageData = new ImageData(width, height - splitLine);

        for (let y = 0; y < splitLine; y++) {
          for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * 4;
            const targetIndex = (y * width + x) * 4;
            upperImageData.data.set(
              imageData.data.slice(sourceIndex, sourceIndex + 4),
              targetIndex
            );
          }
        }

        for (let y = 0; y < height - splitLine; y++) {
          for (let x = 0; x < width; x++) {
            const sourceIndex = ((y + splitLine) * width + x) * 4;
            const targetIndex = (y * width + x) * 4;
            lowerImageData.data.set(
              imageData.data.slice(sourceIndex, sourceIndex + 4),
              targetIndex
            );
          }
        }

        if (upperCtx) upperCtx.putImageData(upperImageData, 0, 0);
        if (lowerCtx) lowerCtx.putImageData(lowerImageData, 0, 0);
      }

      return {
        upper: upperCanvas,
        lower: lowerCanvas,
        splitLine: splitLine
      };
    }

    function drawFrame(ctx: CanvasRenderingContext2D, slices: any, frameIndex: number, size: any, options: any = {}) {
      const { 
        opacity = 1,
        xOffset = 0,
        yOffset = 0,
        rotation = 0,
        nodRotation = 0,
        clearCanvas = false
      } = options;

      const { width, height, scale } = size;
      const { upper, lower, splitLine } = slices;
      
      if (clearCanvas) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      
      if (offscreenCtx) {
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        offscreenCtx.clearRect(0, 0, width, height);
        
        const progress = frameIndex / PARAMS.frameCount * Math.PI * 2;
        const baseRotation = Math.sin(progress) * PARAMS.rotationRange;
        const pressDownPhase = Math.max(0, Math.sin(progress));

        const pressDownOffset = Math.round(pressDownPhase * (PARAMS.pressDownStrength * scale / 28));
        const insertionOffset = Math.round(pressDownPhase * (PARAMS.insertionStrength * scale / 28));
        const insertionRotation = pressDownPhase * PARAMS.insertionAngle;
        const compressionFactor = pressDownPhase * PARAMS.squashStrength;

        offscreenCtx.globalAlpha = opacity;

        offscreenCtx.save();
        offscreenCtx.translate(width/2, height/2);
        offscreenCtx.rotate(rotation);
        offscreenCtx.translate(-width/2, -height/2);

        // Draw lower half
        offscreenCtx.save();
        offscreenCtx.translate(width/2, height);
        offscreenCtx.scale(1 + (compressionFactor * 0.2), 1 - compressionFactor);
        offscreenCtx.translate(-width/2, -height);
        offscreenCtx.drawImage(lower, 0, splitLine);
        offscreenCtx.restore();

        // Draw upper half
        offscreenCtx.save();
        const pivotX = Math.round(width * 3/7);
        const pivotY = splitLine;
        offscreenCtx.translate(pivotX, pivotY);
        offscreenCtx.rotate(baseRotation + nodRotation);
        offscreenCtx.translate(-pivotX, -pivotY);

        if (pressDownPhase > 0) {
          offscreenCtx.translate(0, pressDownOffset);
          offscreenCtx.translate(pivotX, pivotY);
          offscreenCtx.rotate(insertionRotation);
          offscreenCtx.translate(-pivotX, -pivotY);
        }

        offscreenCtx.drawImage(upper, 0, 0);
        offscreenCtx.restore();
        offscreenCtx.restore();

        // Clear specific area if needed
        if (!clearCanvas) {
          const clearX = Math.max(0, xOffset - 5);
          const clearWidth = width + 10;
          ctx.clearRect(clearX, 0, clearWidth, ctx.canvas.height);
        }

        ctx.drawImage(offscreenCanvas, xOffset, (ctx.canvas.height - height) / 2);
      }
    }

    async function loadNextImage() {
      if (!container) return null;
      const index = Math.floor(Math.random() * 10000);
      const baseId = '0000077c4851b026f4d19c25bf80de7b5b44b856da50d67ae8da304bd3be6999i';
      const imageUrl = `https://ordinals.com/content/${baseId}${index}`;
      try {
        const originalImg = await loadImage(imageUrl);
        const size = calculateOptimalSize(container.clientHeight);
        const hdImage = await createHDImage(originalImg, size);
        return createImageSlices(hdImage, size.scale);
      } catch (error) {
        console.error('Failed to load image:', error);
        return null;
      }
    }

    async function preloadImages() {
      while (imageQueue.length < MAX_QUEUE_SIZE) {
        const image = await loadNextImage();
        if (image) {
          imageQueue.push(image);
        }
      }
    }

    function getNextImageFromQueue() {
      if (imageQueue.length > 0) {
        const image = imageQueue.shift();
        preloadImages();
        return image;
      }
      return null;
    }

    function loadImage(url: string): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    }

    async function createHDImage(originalImage: HTMLImageElement, targetSize: any) {
      const hdCanvas = document.createElement('canvas');
      const hdCtx = hdCanvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: true
      });
      
      if (hdCtx) {
        hdCanvas.width = targetSize.width;
        hdCanvas.height = targetSize.height;
        
        hdCtx.imageSmoothingEnabled = false;
        hdCtx.clearRect(0, 0, hdCanvas.width, hdCanvas.height);
        hdCtx.drawImage(originalImage, 
          0, 0, PARAMS.baseSize, PARAMS.baseSize,
          0, 0, targetSize.width, targetSize.height
        );
        
        const hdImage = new Image();
        hdImage.src = hdCanvas.toDataURL('image/png');
        
        return new Promise<HTMLImageElement>((resolve) => {
          hdImage.onload = () => resolve(hdImage);
        });
      } else {
        throw new Error('Failed to create HD image context');
      }
    }

    async function initializeAnimation() {
      // Load first image and wait for it to be ready
      const firstImage = await loadNextImage();
      if (firstImage) {
        currentImage = firstImage;
        setIsInitialized(true);
        currentState = AnimationState.ENTRANCE;
        stateStartTime = Date.now();
        // Start preloading next images after first one is ready
        preloadImages();
      }
    }

    function animate() {
      const currentTime = Date.now();
      const stateTime = currentTime - stateStartTime;

      if (!ctx || !canvas || !container) return; 

      if (currentState === AnimationState.LOADING) {
        // Don't render anything during loading
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (!currentImage) {
        // Don't start animation until we have an image
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const size = calculateOptimalSize(container?.clientHeight ?? 168); 
      const containerWidth = container?.clientWidth ?? window.innerWidth; 
      const movementWidth = containerWidth - size.width; 

      switch (currentState) {
        case AnimationState.DISPLAY:
          drawFrame(ctx, currentImage, frame, size, { clearCanvas: true });
          
          if (stateTime >= PARAMS.displayDuration) {
            currentState = AnimationState.NOD;
            stateStartTime = currentTime;
          }
          break;

        case AnimationState.NOD:
          const nodProgress = (currentTime - stateStartTime) / PARAMS.nodDuration;
          drawFrame(ctx, currentImage, frame, size, {
            nodRotation: Math.sin(nodProgress * Math.PI * 2) * 0.15,
            clearCanvas: true
          });
          
          if (nodProgress >= 1) {
            currentState = AnimationState.EXIT;
            stateStartTime = currentTime;
            if (!nextImage) {
              nextImage = getNextImageFromQueue();
            }
          }
          break;

        case AnimationState.EXIT:
          const exitProgress = (currentTime - stateStartTime) / PARAMS.exitDuration;
          const currentImageX = Math.min(containerWidth, exitProgress * movementWidth * 2);
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          drawFrame(ctx, currentImage, frame, size, {
            xOffset: currentImageX,
            clearCanvas: false
          });

          if (nextImage && currentImageX > containerWidth * 0.75) {
            const nextImageStartX = -size.width;
            const nextImageEndX = 0;
            const nextImageProgress = (currentImageX - containerWidth * 0.75) / (containerWidth * 0.25);
            const nextImageX = nextImageStartX + (nextImageEndX - nextImageStartX) * nextImageProgress;
            
            drawFrame(ctx, nextImage, frame, size, {
              xOffset: nextImageX,
              clearCanvas: false
            });
          }
          
          if (exitProgress >= 1) {
            currentImage = nextImage;
            nextImage = null;
            currentState = AnimationState.DISPLAY;
            stateStartTime = currentTime;
          }
          break;

        case AnimationState.ENTRANCE:
          const entranceProgress = (currentTime - stateStartTime) / PARAMS.entranceDuration;
          const entranceX = (1 - entranceProgress) * -size.width;
          
          drawFrame(ctx, currentImage, frame, size, {
            xOffset: entranceX,
            clearCanvas: true
          });
          
          if (entranceProgress >= 1) {
            currentState = AnimationState.DISPLAY;
            stateStartTime = currentTime;
          }
          break;
      }

      frame = (frame + 1) % PARAMS.frameCount;
      animationFrameId = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize animation only once
    initializeAnimation();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="header-container" ref={containerRef}>
      <div className="animation-viewport">
        <canvas ref={canvasRef} id="animationCanvas"></canvas>
        {!isInitialized && (
          <div className="loading-overlay">
            <span>Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;

