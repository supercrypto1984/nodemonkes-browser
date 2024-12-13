interface AnimationParams {
  frameCount: number;
  frameDelay: number;
  rotationRange: number;
  pressDownStrength: number;
  insertionStrength: number;
  insertionAngle: number;
  squashStrength: number;
  displayDuration: number;
  baseSize: number;
  hdScale: number;
  transitionDuration: number;
  nodDuration: number;
  exitDuration: number;
  entranceDuration: number;
  movementRange: number;
}

const PARAMS: AnimationParams = {
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

enum AnimationState {
  DISPLAY = 'display',
  NOD = 'nod',
  EXIT = 'exit',
  ENTRANCE = 'entrance'
}

interface DrawFrameOptions {
  xOffset?: number;
  nodRotation?: number;
}

function drawFrame(context: CanvasRenderingContext2D, frameIndex: number, options: DrawFrameOptions = {}): void {
  const { xOffset = 0, nodRotation = 0 } = options;
  
  const width = PARAMS.baseSize * PARAMS.hdScale;
  const height = PARAMS.baseSize * PARAMS.hdScale;
  
  const progress = frameIndex / PARAMS.frameCount * Math.PI * 2;
  const baseRotation = Math.sin(progress) * PARAMS.rotationRange;
  
  context.save();
  context.translate(xOffset + width/2, height/2);
  context.rotate(baseRotation + nodRotation);
  context.translate(-width/2, -height/2);
  
  context.fillStyle = '#666';
  context.fillRect(0, 0, width, height);
  
  context.restore();
}

export function initializeAnimation(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  if (!context) {
    console.error('Could not get canvas context');
    return;
  }

  let currentState = AnimationState.ENTRANCE;
  let stateStartTime = Date.now();
  let frame = 0;

  context.imageSmoothingEnabled = false;

  function animate(): void {
    const currentTime = Date.now();
    const stateTime = currentTime - stateStartTime;

    context.clearRect(0, 0, canvas.width, canvas.height);

    switch (currentState) {
      case AnimationState.DISPLAY:
        if (stateTime >= PARAMS.displayDuration) {
          currentState = AnimationState.NOD;
          stateStartTime = currentTime;
        }
        drawFrame(context, frame);
        break;

      case AnimationState.NOD:
        {
          const nodProgress = stateTime / PARAMS.nodDuration;
          if (nodProgress >= 1) {
            currentState = AnimationState.EXIT;
            stateStartTime = currentTime;
          }
          drawFrame(context, frame, {
            nodRotation: Math.sin(nodProgress * Math.PI * 2) * 0.15
          });
        }
        break;

      case AnimationState.EXIT:
        {
          const exitProgress = stateTime / PARAMS.exitDuration;
          if (exitProgress >= 1) {
            currentState = AnimationState.ENTRANCE;
            stateStartTime = currentTime;
          }
          drawFrame(context, frame, {
            xOffset: Math.min(canvas.width, exitProgress * canvas.width * 2)
          });
        }
        break;

      case AnimationState.ENTRANCE:
        {
          const entranceProgress = stateTime / PARAMS.entranceDuration;
          if (entranceProgress >= 1) {
            currentState = AnimationState.DISPLAY;
            stateStartTime = currentTime;
          }
          drawFrame(context, frame, {
            xOffset: (1 - entranceProgress) * -canvas.width
          });
        }
        break;
    }

    frame = (frame + 1) % PARAMS.frameCount;
    requestAnimationFrame(animate);
  }

  animate();
}

