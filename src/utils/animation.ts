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

class AnimationController {
  private context: CanvasRenderingContext2D;
  private currentState: AnimationState = AnimationState.ENTRANCE;
  private stateStartTime: number = Date.now();
  private frame: number = 0;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.context = ctx;
    this.context.imageSmoothingEnabled = false;
  }

  private drawFrame(options: DrawFrameOptions = {}): void {
    const { xOffset = 0, nodRotation = 0 } = options;
    
    const width = PARAMS.baseSize * PARAMS.hdScale;
    const height = PARAMS.baseSize * PARAMS.hdScale;
    
    const progress = this.frame / PARAMS.frameCount * Math.PI * 2;
    const baseRotation = Math.sin(progress) * PARAMS.rotationRange;
    
    this.context.save();
    this.context.translate(xOffset + width/2, height/2);
    this.context.rotate(baseRotation + nodRotation);
    this.context.translate(-width/2, -height/2);
    
    this.context.fillStyle = '#666';
    this.context.fillRect(0, 0, width, height);
    
    this.context.restore();
  }

  private animate = (): void => {
    const currentTime = Date.now();
    const stateTime = currentTime - this.stateStartTime;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    switch (this.currentState) {
      case AnimationState.DISPLAY: {
        if (stateTime >= PARAMS.displayDuration) {
          this.currentState = AnimationState.NOD;
          this.stateStartTime = currentTime;
        }
        this.drawFrame();
        break;
      }

      case AnimationState.NOD: {
        const nodProgress = stateTime / PARAMS.nodDuration;
        if (nodProgress >= 1) {
          this.currentState = AnimationState.EXIT;
          this.stateStartTime = currentTime;
        }
        this.drawFrame({
          nodRotation: Math.sin(nodProgress * Math.PI * 2) * 0.15
        });
        break;
      }

      case AnimationState.EXIT: {
        const exitProgress = stateTime / PARAMS.exitDuration;
        if (exitProgress >= 1) {
          this.currentState = AnimationState.ENTRANCE;
          this.stateStartTime = currentTime;
        }
        this.drawFrame({
          xOffset: Math.min(this.canvas.width, exitProgress * this.canvas.width * 2)
        });
        break;
      }

      case AnimationState.ENTRANCE: {
        const entranceProgress = stateTime / PARAMS.entranceDuration;
        if (entranceProgress >= 1) {
          this.currentState = AnimationState.DISPLAY;
          this.stateStartTime = currentTime;
        }
        this.drawFrame({
          xOffset: (1 - entranceProgress) * -this.canvas.width
        });
        break;
      }
    }

    this.frame = (this.frame + 1) % PARAMS.frameCount;
    requestAnimationFrame(this.animate);
  }

  public start(): void {
    this.animate();
  }
}

export function initializeAnimation(canvas: HTMLCanvasElement): void {
  try {
    const controller = new AnimationController(canvas);
    controller.start();
  } catch (error) {
    console.error('Failed to initialize animation:', error);
  }
}

