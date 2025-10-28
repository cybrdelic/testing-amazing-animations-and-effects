/**
 * Modern Animation Demos
 * Main entry point for WebGPU, WebGL, Three.js, and GSAP utilities
 */

// WebGPU Essentials
export { 
  WebGPURenderer, 
  WebGPUShaders,
  isWebGPUSupported 
} from './webgpu/webgpu-core.js';

// WebGL Essentials
export { 
  WebGLRenderer, 
  WebGLShaders,
  isWebGLSupported,
  isWebGL2Supported 
} from './webgl/webgl-core.js';

// Advanced WebGL Shaders
export {
  AdvancedWebGLShaders
} from './webgl/advanced-shaders.js';

// Three.js Essentials
export { 
  ThreeJSScene, 
  ThreeJSGeometry,
  ThreeJSShaders,
  CameraController 
} from './threejs/threejs-core.js';

// Advanced Three.js Effects
export {
  MorphingBlob,
  FlowingParticles,
  createHolographicMaterial
} from './threejs/advanced-effects.js';

// GSAP Essentials
export { 
  GSAPAnimator, 
  GSAPPresets,
  CustomEasing,
  TimelineBuilder,
  createScrollAnimation,
  enablePerformanceMode 
} from './gsap/gsap-core.js';

// Advanced GSAP Animations
export {
  createLiquidButton,
  createCursorSpotlight,
  createMorphingText,
  createSpringFollow,
  createPageTransition,
  createInfiniteMarquee
} from './gsap/advanced-animations.js';

/**
 * Feature detection for all technologies
 */
export const FeatureDetection = {
  hasWebGPU: () => 'gpu' in navigator,
  hasWebGL: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch (e) {
      return false;
    }
  },
  hasWebGL2: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  },
  getBestRenderer: () => {
    if ('gpu' in navigator) return 'webgpu';
    const canvas = document.createElement('canvas');
    if (canvas.getContext('webgl2')) return 'webgl2';
    if (canvas.getContext('webgl')) return 'webgl';
    return 'none';
  }
};

/**
 * Best practices configuration
 */
export const BestPractices = {
  // Recommended canvas settings
  canvasSettings: {
    alpha: false,
    antialias: true,
    powerPreference: 'high-performance',
    depth: true
  },

  // Performance optimization tips
  performance: {
    useRequestAnimationFrame: true,
    enableGPUAcceleration: true,
    limitFrameRate: 60,
    useWebWorkers: true,
    optimizeAssets: true
  },

  // Accessibility considerations
  accessibility: {
    provideAlternatives: true,
    respectMotionPreferences: true,
    ensureKeyboardNavigation: true
  }
};

/**
 * Check user's motion preferences
 */
export function respectsReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Auto-select best available technology
 */
export function createOptimalRenderer(canvas, options = {}) {
  const best = FeatureDetection.getBestRenderer();
  
  switch (best) {
    case 'webgpu':
      return import('./webgpu/webgpu-core.js').then(module => {
        const renderer = new module.WebGPURenderer();
        return renderer.init(canvas);
      });
    
    case 'webgl2':
    case 'webgl':
      return import('./webgl/webgl-core.js').then(module => {
        const renderer = new module.WebGLRenderer();
        return renderer.init(canvas, options);
      });
    
    default:
      throw new Error('No compatible rendering technology available');
  }
}
