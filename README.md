# 🎨 Modern Animation Demos

A collection of interactive animation demos showcasing **WebGPU**, **WebGL**, **Three.js**, and **GSAP**. This repository demonstrates modern web animation techniques and provides example code for creating engaging visual experiences.

## 🚀 Features

- **WebGPU Demos** - Next-generation GPU-accelerated graphics examples
- **WebGL Demos** - Interactive shader-based graphics with fluid simulation
- **Three.js Demos** - 3D particle systems and morphing geometry
- **GSAP Demos** - Smooth animations with interactive elements

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/cybrdelic/testing-amazing-animations-and-effects.git
cd testing-amazing-animations-and-effects

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Quick Start

### WebGPU Example

```javascript
import { WebGPURenderer, WebGPUShaders } from './src/webgpu/webgpu-core.js';

const canvas = document.getElementById('canvas');
const renderer = new WebGPURenderer();
await renderer.init(canvas);

// Create shaders and render
const vertexShader = renderer.createShaderModule(WebGPUShaders.fullscreenVertex);
const fragmentShader = renderer.createShaderModule(WebGPUShaders.gradientFragment);
```

### WebGL Example

```javascript
import { WebGLRenderer, WebGLShaders } from './src/webgl/webgl-core.js';

const canvas = document.getElementById('canvas');
const renderer = new WebGLRenderer();
renderer.init(canvas);

// Create program and render
const program = renderer.createProgram(
  WebGLShaders.basicVertex,
  WebGLShaders.phongFragment
);
```

### Three.js Example

```javascript
import { ThreeJSScene, ThreeJSGeometry } from './src/threejs/threejs-core.js';

const canvas = document.getElementById('canvas');
const scene = new ThreeJSScene({ shadows: true });
scene.init(canvas);

// Add geometries
const particles = ThreeJSGeometry.createParticleSystem(1000);
scene.scene.add(particles);

// Animate
scene.animate((delta, elapsed) => {
  particles.rotation.y = elapsed * 0.1;
});
```

### GSAP Example

```javascript
import { GSAPPresets, TimelineBuilder } from './src/gsap/gsap-core.js';

// Fade in elements
GSAPPresets.fadeIn('.element', 1, 0);

// Create complex timeline
const timeline = new TimelineBuilder();
timeline
  .to('.box', { x: 100, duration: 1 })
  .to('.box', { y: 100, duration: 1 })
  .play();

// Magnetic effect
GSAPPresets.magnetic(document.querySelector('.button'), 0.3);
```

## 🎨 Live Examples

Open `index.html` in your browser to see all examples:

- **WebGPU Demo** - `/examples/webgpu.html` - Next-gen GPU rendering
- **WebGL Demo** - `/examples/webgl.html` - Rotating 3D cube with lighting
- **Three.js Demo** - `/examples/threejs.html` - Particle system with animated geometries
- **GSAP Demo** - `/examples/gsap.html` - Professional animation techniques

## 📚 Documentation

### WebGPU Core (`src/webgpu/webgpu-core.js`)

- `WebGPURenderer` - WebGPU renderer class
- `WebGPUShaders` - Collection of WGSL shaders
- `isWebGPUSupported()` - Feature detection utility

### WebGL Core (`src/webgl/webgl-core.js`)

- `WebGLRenderer` - WebGL/WebGL2 renderer class
- `WebGLShaders` - GLSL shaders for various effects
- `isWebGLSupported()`, `isWebGL2Supported()` - Feature detection

### Three.js Core (`src/threejs/threejs-core.js`)

- `ThreeJSScene` - Scene management wrapper
- `ThreeJSGeometry` - Geometry creation utilities
- `ThreeJSShaders` - Custom shader effects
- `CameraController` - Interactive camera controls

### GSAP Core (`src/gsap/gsap-core.js`)

- `GSAPAnimator` - Animation controller
- `GSAPPresets` - Common animation presets
- `TimelineBuilder` - Timeline creation helper
- `CustomEasing` - Easing functions
- `enablePerformanceMode()` - GPU acceleration helper

## 🎯 Best Practices

### Performance Optimization

```javascript
import { enablePerformanceMode } from './src/gsap/gsap-core.js';

// Enable GPU acceleration for GSAP
enablePerformanceMode();

// Use requestAnimationFrame for smooth animations
function animate() {
  // Your animation code
  requestAnimationFrame(animate);
}
```

### Feature Detection

```javascript
import { FeatureDetection } from './src/index.js';

const renderer = FeatureDetection.getBestRenderer();
console.log('Best available:', renderer); // 'webgpu', 'webgl2', 'webgl', or 'none'
```

### Accessibility

```javascript
import { respectsReducedMotion } from './src/index.js';

if (!respectsReducedMotion()) {
  // Apply animations only if user hasn't requested reduced motion
  GSAPPresets.fadeIn('.element', 1);
}
```

## 🎯 Demonstration Techniques

This repository demonstrates various animation techniques:

1. **Particle Systems** - GPU-accelerated particle effects
2. **Shader Effects** - Custom GLSL and WGSL shaders
3. **Interactive Elements** - Mouse-responsive animations
4. **Timeline Animations** - Coordinated animation sequences
5. **3D Graphics** - Real-time 3D rendering and morphing
6. **Fluid Simulation** - Dynamic shader-based effects

## 🛠️ Technologies

- **Vite** - Fast development server and build tool
- **WebGPU** - Next-generation graphics API
- **WebGL/WebGL2** - Industry-standard 3D graphics
- **Three.js v0.168.0** - Popular 3D library
- **GSAP v3.12.5** - Professional animation platform

## 📖 Browser Support

- **WebGPU**: Chrome/Edge 113+, with flags enabled
- **WebGL2**: Chrome 56+, Firefox 51+, Safari 15+
- **WebGL**: All modern browsers
- **Three.js**: All modern browsers
- **GSAP**: All browsers including IE11+

## ⚠️ Security Notes

**Development Server**: The Vite development server has a known moderate-severity vulnerability (GHSA-67mh-4wv8-2f99) that only affects development environments. This does NOT affect production builds.

**Mitigation**:
- Never expose the development server to public internet
- Always use `npm run build` for production deployments
- Run development server only in trusted environments

For more details, see [SECURITY.md](./SECURITY.md).

## 🤝 Contributing

Contributions are welcome! This repository showcases best practices for:

- GPU-accelerated graphics
- Performance-optimized animations
- Accessibility-friendly interactions
- Modern web standards

## 📄 License

MIT License - Feel free to use in your projects!

## 🌟 Credits

Built with the best tools in the industry:
- WebGPU working group
- Khronos Group (WebGL)
- Three.js team
- GreenSock (GSAP)

---

**Made with modern web technologies**