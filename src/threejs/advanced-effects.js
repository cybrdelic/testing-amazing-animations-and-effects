/**
 * Advanced Three.js Effects for Award-Winning Animations
 * Includes: Morphing geometries, shader materials, post-processing
 */

import * as THREE from 'three';

/**
 * Morphing blob geometry with vertex displacement
 */
export class MorphingBlob {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.time = 0;
    this.createBlob();
  }

  createBlob() {
    const geometry = new THREE.IcosahedronGeometry(2, 64);
    
    // Custom shader material for organic morphing
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0x6366f1) },
        uColor2: { value: new THREE.Color(0xec4899) },
        uColor3: { value: new THREE.Color(0x8b5cf6) }
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        // 3D noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vNormal = normal;
          vPosition = position;
          
          // Multi-layered noise for organic movement
          float noise1 = snoise(position * 0.5 + uTime * 0.3);
          float noise2 = snoise(position * 1.0 + uTime * 0.2);
          float noise3 = snoise(position * 2.0 - uTime * 0.4);
          
          // Combine noises
          float displacement = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
          
          // Displace vertices
          vec3 newPosition = position + normal * displacement * 0.5;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Dynamic color mixing based on position and normal
          vec3 color = mix(uColor1, uColor2, vNormal.y * 0.5 + 0.5);
          color = mix(color, uColor3, sin(vPosition.x + uTime) * 0.5 + 0.5);
          
          // Add fresnel glow
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), 3.0);
          color += fresnel * 0.5;
          
          // Add rim lighting
          float rim = 1.0 - max(dot(vNormal, viewDirection), 0.0);
          rim = smoothstep(0.6, 1.0, rim);
          color += rim * vec3(0.5, 0.3, 1.0);
          
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  update(deltaTime) {
    this.time += deltaTime;
    if (this.mesh) {
      this.mesh.material.uniforms.uTime.value = this.time;
      this.mesh.rotation.x = Math.sin(this.time * 0.3) * 0.2;
      this.mesh.rotation.y = this.time * 0.2;
    }
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.scene.remove(this.mesh);
    }
  }
}

/**
 * Flowing particles with trail effects
 */
export class FlowingParticles {
  constructor(scene, count = 5000) {
    this.scene = scene;
    this.count = count;
    this.particles = null;
    this.time = 0;
    this.createParticles();
  }

  createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);
    const colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      
      // Spiral distribution
      const angle = (i / this.count) * Math.PI * 8;
      const radius = (i / this.count) * 5;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = Math.sin(angle) * radius;

      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      sizes[i] = Math.random() * 0.1 + 0.05;

      const hue = (i / this.count) * 360;
      const color = new THREE.Color().setHSL(hue / 360, 1.0, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float size;
        attribute vec3 velocity;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          
          // Flow motion
          vec3 pos = position;
          pos += velocity * uTime * 10.0;
          
          // Circular flow
          float angle = uTime * 0.5;
          mat3 rotation = mat3(
            cos(angle), 0.0, sin(angle),
            0.0, 1.0, 0.0,
            -sin(angle), 0.0, cos(angle)
          );
          pos = rotation * pos;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * uPixelRatio * 300.0 / -mvPosition.z;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Circular particle shape with soft edges
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float dist = length(xy);
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          
          // Add glow
          alpha += (1.0 - smoothstep(0.0, 0.5, dist)) * 0.3;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  update(deltaTime) {
    this.time += deltaTime;
    if (this.particles) {
      this.particles.material.uniforms.uTime.value = this.time;
    }
  }

  dispose() {
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
      this.scene.remove(this.particles);
    }
  }
}

/**
 * Holographic material effect
 */
export function createHolographicMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFresnelPower: { value: 3.0 },
      uScanlineIntensity: { value: 0.5 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uFresnelPower;
      uniform float uScanlineIntensity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        // Fresnel effect
        vec3 viewDirection = normalize(-vPosition);
        float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), uFresnelPower);
        
        // Iridescent color shift
        float hue = fresnel + vUv.y + uTime * 0.2;
        vec3 color1 = vec3(0.0, 1.0, 1.0);  // Cyan
        vec3 color2 = vec3(1.0, 0.0, 1.0);  // Magenta
        vec3 color3 = vec3(1.0, 1.0, 0.0);  // Yellow
        
        vec3 color = mix(color1, color2, sin(hue * 3.14159) * 0.5 + 0.5);
        color = mix(color, color3, cos(hue * 3.14159 * 0.5) * 0.5 + 0.5);
        
        // Scanlines
        float scanline = sin(vUv.y * 100.0 + uTime * 5.0) * uScanlineIntensity;
        color += scanline;
        
        // Glitch effect
        float glitch = step(0.98, sin(uTime * 10.0 + vUv.y * 50.0));
        color += glitch * vec3(1.0);
        
        // Combine with fresnel
        color *= fresnel;
        
        float alpha = fresnel * 0.8 + 0.2;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });
}
