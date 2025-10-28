/**
 * WebGL Essentials
 * High-performance WebGL utilities for award-winning graphics
 */

export class WebGLRenderer {
  constructor() {
    this.gl = null;
    this.canvas = null;
    this.programs = new Map();
  }

  /**
   * Initialize WebGL2 context with best settings
   */
  init(canvas, options = {}) {
    this.canvas = canvas;
    const contextAttributes = {
      alpha: options.alpha !== false,
      depth: options.depth !== false,
      stencil: options.stencil || false,
      antialias: options.antialias !== false,
      premultipliedAlpha: options.premultipliedAlpha !== false,
      preserveDrawingBuffer: options.preserveDrawingBuffer || false,
      powerPreference: options.powerPreference || 'high-performance',
      ...options
    };

    this.gl = canvas.getContext('webgl2', contextAttributes) || 
              canvas.getContext('webgl', contextAttributes);

    if (!this.gl) {
      throw new Error('WebGL is not supported');
    }

    // Enable best practices
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
    this.gl.frontFace(this.gl.CCW);

    return this;
  }

  /**
   * Create and compile a shader
   */
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error('Shader compilation error: ' + info);
    }

    return shader;
  }

  /**
   * Create a shader program from vertex and fragment shaders
   */
  createProgram(vertexSource, fragmentSource, name = 'default') {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error('Program linking error: ' + info);
    }

    // Clean up shaders
    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);

    this.programs.set(name, program);
    return program;
  }

  /**
   * Create a buffer
   */
  createBuffer(data, type = this.gl.ARRAY_BUFFER, usage = this.gl.STATIC_DRAW) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(type, buffer);
    this.gl.bufferData(type, data, usage);
    return buffer;
  }

  /**
   * Create a texture
   */
  createTexture(options = {}) {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, 
      options.wrapS || this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, 
      options.wrapT || this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, 
      options.minFilter || this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, 
      options.magFilter || this.gl.LINEAR);

    return texture;
  }

  /**
   * Load texture from image
   */
  loadTexture(url) {
    return new Promise((resolve, reject) => {
      const texture = this.createTexture();
      const image = new Image();
      
      image.onload = () => {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
          this.gl.TEXTURE_2D, 0, this.gl.RGBA, 
          this.gl.RGBA, this.gl.UNSIGNED_BYTE, image
        );
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        resolve(texture);
      };
      
      image.onerror = reject;
      image.src = url;
    });
  }

  /**
   * Clear the canvas
   */
  clear(r = 0, g = 0, b = 0, a = 1) {
    this.gl.clearColor(r, g, b, a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  /**
   * Resize viewport
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  /**
   * Set uniform values
   */
  setUniform(program, name, type, value) {
    const location = this.gl.getUniformLocation(program, name);
    if (!location) return;

    switch (type) {
      case '1f': this.gl.uniform1f(location, value); break;
      case '2f': this.gl.uniform2f(location, ...value); break;
      case '3f': this.gl.uniform3f(location, ...value); break;
      case '4f': this.gl.uniform4f(location, ...value); break;
      case '1i': this.gl.uniform1i(location, value); break;
      case 'matrix4fv': this.gl.uniformMatrix4fv(location, false, value); break;
      case 'matrix3fv': this.gl.uniformMatrix3fv(location, false, value); break;
    }
  }
}

/**
 * Common WebGL shaders for award-winning effects
 */
export const WebGLShaders = {
  // Basic vertex shader with transformation
  basicVertex: `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    attribute vec3 aNormal;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;
    
    varying vec2 vTexCoord;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec4 worldPosition = uModelViewMatrix * vec4(aPosition, 1.0);
      vPosition = worldPosition.xyz;
      vNormal = uNormalMatrix * aNormal;
      vTexCoord = aTexCoord;
      gl_Position = uProjectionMatrix * worldPosition;
    }
  `,

  // Advanced fragment shader with lighting
  phongFragment: `
    precision highp float;
    
    varying vec2 vTexCoord;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    uniform vec3 uLightPosition;
    uniform vec3 uLightColor;
    uniform vec3 uAmbientColor;
    uniform vec3 uDiffuseColor;
    uniform vec3 uSpecularColor;
    uniform float uShininess;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(uLightPosition - vPosition);
      vec3 viewDir = normalize(-vPosition);
      vec3 reflectDir = reflect(-lightDir, normal);
      
      // Ambient
      vec3 ambient = uAmbientColor;
      
      // Diffuse
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = diff * uLightColor * uDiffuseColor;
      
      // Specular
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
      vec3 specular = spec * uLightColor * uSpecularColor;
      
      vec3 result = ambient + diffuse + specular;
      gl_FragColor = vec4(result, 1.0);
    }
  `,

  // Post-processing fragment shader
  postProcessFragment: `
    precision highp float;
    
    varying vec2 vTexCoord;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec2 uResolution;
    
    void main() {
      vec2 uv = vTexCoord;
      
      // Chromatic aberration
      float amount = 0.005;
      vec2 offset = vec2(amount * sin(uTime), amount * cos(uTime));
      
      float r = texture2D(uTexture, uv + offset).r;
      float g = texture2D(uTexture, uv).g;
      float b = texture2D(uTexture, uv - offset).b;
      
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,

  // Full-screen quad vertex shader
  fullscreenVertex: `
    attribute vec2 aPosition;
    varying vec2 vTexCoord;
    
    void main() {
      vTexCoord = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `
};

/**
 * Utility functions
 */
export function isWebGLSupported() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

export function isWebGL2Supported() {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch (e) {
    return false;
  }
}
