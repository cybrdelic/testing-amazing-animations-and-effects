/**
 * Advanced WebGL Shaders for Award-Winning Effects
 * Includes: Fluid simulation, Ray marching, Noise-based effects
 */

export const AdvancedWebGLShaders = {
  // Fluid simulation vertex shader
  fluidVertex: `
    attribute vec2 aPosition;
    varying vec2 vUv;
    
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `,

  // Advanced fluid simulation fragment shader
  fluidFragment: `
    precision highp float;
    
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vec2 uv = vUv;
      vec2 p = (uv - 0.5) * 2.0;
      
      // Create flowing fluid effect
      float noise1 = snoise(vec2(p.x * 3.0 + uTime * 0.5, p.y * 3.0));
      float noise2 = snoise(vec2(p.x * 2.0 - uTime * 0.3, p.y * 2.0 + uTime * 0.4));
      float noise3 = snoise(vec2(p.x * 4.0 + noise1, p.y * 4.0 + noise2));
      
      // Add mouse interaction
      vec2 mouseInfluence = (uMouse - uv) * 2.0;
      float mouseDist = length(mouseInfluence);
      float mouseEffect = smoothstep(0.5, 0.0, mouseDist);
      
      // Combine noises for fluid motion
      float flow = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      flow += mouseEffect * 0.5;
      
      // Create colorful gradient based on flow
      vec3 color1 = vec3(0.1, 0.4, 0.9);  // Blue
      vec3 color2 = vec3(0.9, 0.2, 0.5);  // Pink
      vec3 color3 = vec3(0.3, 0.9, 0.8);  // Cyan
      
      vec3 finalColor = mix(color1, color2, flow);
      finalColor = mix(finalColor, color3, noise3 * 0.5 + 0.5);
      
      // Add subtle glow
      float glow = pow(1.0 - length(p) * 0.5, 2.0);
      finalColor += glow * 0.2;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,

  // Ray marching fragment shader for 3D volumetric effects
  rayMarchingFragment: `
    precision highp float;
    
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    
    #define MAX_STEPS 100
    #define MAX_DIST 100.0
    #define SURF_DIST 0.01
    
    // Smooth minimum function
    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }
    
    // SDF for sphere
    float sdSphere(vec3 p, float r) {
      return length(p) - r;
    }
    
    // SDF for torus
    float sdTorus(vec3 p, vec2 t) {
      vec2 q = vec2(length(p.xz) - t.x, p.y);
      return length(q) - t.y;
    }
    
    // Scene distance function
    float getDist(vec3 p) {
      float t = uTime * 0.5;
      
      // Rotating sphere
      vec3 spherePos = vec3(sin(t) * 2.0, cos(t * 0.7) * 1.5, 0.0);
      float sphere = sdSphere(p - spherePos, 1.0);
      
      // Animated torus
      vec3 torusPos = p;
      torusPos.y += sin(p.x * 2.0 + t) * 0.2;
      torusPos = torusPos * mat3(
        cos(t), 0, sin(t),
        0, 1, 0,
        -sin(t), 0, cos(t)
      );
      float torus = sdTorus(torusPos, vec2(1.5, 0.5));
      
      // Smooth union
      return smin(sphere, torus, 0.5);
    }
    
    // Normal calculation
    vec3 getNormal(vec3 p) {
      float d = getDist(p);
      vec2 e = vec2(0.01, 0.0);
      vec3 n = d - vec3(
        getDist(p - e.xyy),
        getDist(p - e.yxy),
        getDist(p - e.yyx)
      );
      return normalize(n);
    }
    
    // Ray marching
    float rayMarch(vec3 ro, vec3 rd) {
      float dO = 0.0;
      for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = getDist(p);
        dO += dS;
        if(dO > MAX_DIST || dS < SURF_DIST) break;
      }
      return dO;
    }
    
    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= uResolution.x / uResolution.y;
      
      // Camera setup
      vec3 ro = vec3(0.0, 0.0, 5.0);
      vec3 rd = normalize(vec3(uv.x, uv.y, -1.0));
      
      // Ray march
      float d = rayMarch(ro, rd);
      
      vec3 color = vec3(0.0);
      
      if(d < MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 n = getNormal(p);
        
        // Lighting
        vec3 lightPos = vec3(2.0, 3.0, 4.0);
        vec3 lightDir = normalize(lightPos - p);
        float diff = max(dot(n, lightDir), 0.0);
        
        // Fresnel
        float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
        
        // Color based on position and normal
        vec3 baseColor = vec3(0.2, 0.5, 1.0);
        color = baseColor * diff + fresnel * vec3(1.0, 0.3, 0.5);
        color += pow(diff, 32.0) * vec3(1.0);
        
        // Ambient occlusion
        float ao = 1.0 - (d / MAX_DIST);
        color *= ao;
      } else {
        // Background gradient
        color = mix(vec3(0.1, 0.1, 0.2), vec3(0.0, 0.0, 0.0), length(uv));
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,

  // Distortion effect for award-winning transitions
  distortionFragment: `
    precision highp float;
    
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uProgress;
    uniform vec2 uMouse;
    
    // 2D rotation
    vec2 rotate2D(vec2 v, float a) {
      float s = sin(a);
      float c = cos(a);
      mat2 m = mat2(c, -s, s, c);
      return m * v;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Create ripple distortion from mouse
      vec2 toMouse = uv - uMouse;
      float dist = length(toMouse);
      float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.5 + 0.5;
      ripple *= smoothstep(0.5, 0.0, dist);
      
      // Add swirl distortion
      float angle = ripple * 3.14159 * 0.5;
      vec2 offset = rotate2D(toMouse, angle * uProgress) - toMouse;
      
      // Apply distortion
      uv += offset * 0.1;
      
      // Chromatic aberration
      float aberration = ripple * 0.01;
      vec4 color;
      color.r = texture2D(uTexture, uv + aberration).r;
      color.g = texture2D(uTexture, uv).g;
      color.b = texture2D(uTexture, uv - aberration).b;
      color.a = 1.0;
      
      gl_FragColor = color;
    }
  `
};
