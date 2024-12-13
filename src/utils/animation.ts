export function initializeAnimation(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }

  // Animation parameters
  const PARAMS = {
    frameCount: 36,
    frameDelay: 16,
    // ... other parameters ...
  };

  // Animation states
  enum AnimationState {
    DISPLAY,
    NOD,
    EXIT,
    ENTRANCE
  }

  let currentState = AnimationState.ENTRANCE;
  let frame = 0;

  // Now TypeScript knows ctx is not null
  ctx.imageSmoothingEnabled = false;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Simplified animation logic
    switch (currentState) {
      case AnimationState.DISPLAY:
        // Draw monke
        break;
      case AnimationState.NOD:
        // Animate nod
        break;
      case AnimationState.EXIT:
        // Animate exit
        break;
      case AnimationState.ENTRANCE:
        // Animate entrance
        break;
    }

    frame = (frame + 1) % PARAMS.frameCount;
    requestAnimationFrame(animate);
  }

  animate();
}

