/**
 * Three.js Essentials
 * Award-winning 3D graphics utilities using Three.js
 */

import * as THREE from 'three';

export class ThreeJSScene {
  constructor(options = {}) {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.animationId = null;
    this.clock = new THREE.Clock();
    this.options = options;
  }

  /**
   * Initialize Three.js scene with best practices
   */
  init(canvas) {
    this.canvas = canvas;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.backgroundColor || 0x000000);
    
    // Add fog for depth
    if (this.options.fog) {
      this.scene.fog = new THREE.Fog(0x000000, 1, 100);
    }

    // Create camera
    const aspect = canvas.width / canvas.height;
    this.camera = new THREE.PerspectiveCamera(
      this.options.fov || 75,
      aspect,
      this.options.near || 0.1,
      this.options.far || 1000
    );
    this.camera.position.z = this.options.cameraZ || 5;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.options.antialias !== false,
      alpha: this.options.alpha || false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enable shadows for realism
    if (this.options.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    if (this.options.shadows) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
    }
    this.scene.add(directionalLight);

    return this;
  }

  /**
   * Add mesh to scene with award-winning material
   */
  addMesh(geometry, materialOptions = {}) {
    const material = new THREE.MeshStandardMaterial({
      color: materialOptions.color || 0xffffff,
      metalness: materialOptions.metalness !== undefined ? materialOptions.metalness : 0.5,
      roughness: materialOptions.roughness !== undefined ? materialOptions.roughness : 0.5,
      emissive: materialOptions.emissive || 0x000000,
      emissiveIntensity: materialOptions.emissiveIntensity || 0,
      ...materialOptions
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    if (this.options.shadows) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }

    this.scene.add(mesh);
    return mesh;
  }

  /**
   * Start animation loop
   */
  animate(callback) {
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();
      
      if (callback) {
        callback(delta, elapsed, this);
      }
      
      this.renderer.render(this.scene, this.camera);
    };
    
    loop();
  }

  /**
   * Stop animation
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Resize handler
   */
  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stop();
    this.renderer.dispose();
    
    // Dispose of geometries and materials
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}

/**
 * Award-winning geometry creators
 */
export const ThreeJSGeometry = {
  /**
   * Create an animated particle system
   */
  createParticleSystem(count = 1000) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random positions in sphere
      const radius = Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Random colors
      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();

      sizes[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geometry, material);
  },

  /**
   * Create a glow sphere (for award-winning effects)
   */
  createGlowSphere(radius = 1, color = 0x00ff00) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    
    return new THREE.Mesh(geometry, material);
  },

  /**
   * Create animated torus knot
   */
  createTorusKnot() {
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xff6b6b,
      emissiveIntensity: 0.2
    });
    
    return new THREE.Mesh(geometry, material);
  }
};

/**
 * Custom shaders for Three.js
 */
export const ThreeJSShaders = {
  // Vertex shader for wavy effect
  wavyVertex: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normal;
      
      vec3 pos = position;
      pos.z += sin(pos.x * 2.0 + uTime) * 0.5;
      pos.z += cos(pos.y * 2.0 + uTime) * 0.5;
      
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vPosition = worldPosition.xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,

  // Fragment shader for holographic effect
  holographicFragment: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec3 color = vec3(0.0);
      
      // Rainbow effect
      color.r = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
      color.g = sin(vUv.y * 10.0 + uTime * 0.5) * 0.5 + 0.5;
      color.b = cos(vUv.x * vUv.y * 10.0 + uTime) * 0.5 + 0.5;
      
      // Add fresnel effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - dot(normalize(vNormal), viewDirection), 3.0);
      color += fresnel * 0.5;
      
      gl_FragColor = vec4(color, 0.8);
    }
  `
};

/**
 * Camera controls helper
 */
export class CameraController {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.isMouseDown = false;
    this.previousMousePosition = { x: 0, y: 0 };
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    const canvas = this.renderer.domElement;
    
    canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
      if (!this.isMouseDown) return;
      
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;
      
      this.camera.rotation.y += deltaX * 0.01;
      this.camera.rotation.x += deltaY * 0.01;
      
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.position.z += e.deltaY * 0.01;
    });
  }
}
