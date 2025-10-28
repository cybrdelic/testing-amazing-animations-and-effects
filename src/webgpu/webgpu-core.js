/**
 * WebGPU Essentials
 * Advanced GPU-accelerated graphics and compute capabilities
 */

export class WebGPURenderer {
  constructor() {
    this.device = null;
    this.context = null;
    this.canvas = null;
    this.format = null;
  }

  /**
   * Initialize WebGPU with best practices
   */
  async init(canvas) {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported in this browser');
    }

    this.canvas = canvas;
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance'
    });

    if (!adapter) {
      throw new Error('No appropriate GPUAdapter found');
    }

    this.device = await adapter.requestDevice();
    this.context = canvas.getContext('webgpu');
    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'premultiplied'
    });

    return this;
  }

  /**
   * Create a shader module from WGSL code
   */
  createShaderModule(code) {
    return this.device.createShaderModule({ code });
  }

  /**
   * Create a render pipeline with modern best practices
   */
  createRenderPipeline(config) {
    return this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: config.vertexShader,
        entryPoint: 'main',
        buffers: config.vertexBuffers || []
      },
      fragment: {
        module: config.fragmentShader,
        entryPoint: 'main',
        targets: [{
          format: this.format,
          blend: config.blend || {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add'
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add'
            }
          }
        }]
      },
      primitive: {
        topology: config.topology || 'triangle-list',
        cullMode: config.cullMode || 'back'
      },
      depthStencil: config.depthStencil,
      multisample: config.multisample
    });
  }

  /**
   * Create a buffer with data
   */
  createBuffer(data, usage) {
    const buffer = this.device.createBuffer({
      size: data.byteLength,
      usage,
      mappedAtCreation: true
    });
    
    new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data.buffer || data));
    buffer.unmap();
    
    return buffer;
  }

  /**
   * Begin a render pass with clear color
   */
  beginRenderPass(commandEncoder, clearColor = { r: 0, g: 0, b: 0, a: 1 }) {
    return commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: clearColor,
        loadOp: 'clear',
        storeOp: 'store'
      }]
    });
  }

  /**
   * Render a frame
   */
  render(renderCallback) {
    const commandEncoder = this.device.createCommandEncoder();
    renderCallback(commandEncoder, this);
    this.device.queue.submit([commandEncoder.finish()]);
  }

  /**
   * Resize canvas and reconfigure context
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'premultiplied'
    });
  }
}

/**
 * Common WGSL shaders for award-winning effects
 */
export const WebGPUShaders = {
  // Vertex shader for full-screen quad
  fullscreenVertex: `
    @vertex
    fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
      var pos = array<vec2f, 6>(
        vec2f(-1.0, -1.0),
        vec2f(1.0, -1.0),
        vec2f(-1.0, 1.0),
        vec2f(-1.0, 1.0),
        vec2f(1.0, -1.0),
        vec2f(1.0, 1.0)
      );
      return vec4f(pos[vertexIndex], 0.0, 1.0);
    }
  `,

  // Fragment shader with gradient effect
  gradientFragment: `
    @fragment
    fn main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
      let uv = pos.xy / vec2f(800.0, 600.0);
      let col = vec3f(uv.x, uv.y, 0.5 + 0.5 * sin(uv.x * 10.0));
      return vec4f(col, 1.0);
    }
  `,

  // Advanced particle system vertex shader
  particleVertex: `
    struct VertexOutput {
      @builtin(position) position: vec4f,
      @location(0) color: vec4f,
    }

    @vertex
    fn main(
      @location(0) position: vec3f,
      @location(1) velocity: vec3f,
      @location(2) color: vec4f
    ) -> VertexOutput {
      var output: VertexOutput;
      output.position = vec4f(position, 1.0);
      output.color = color;
      return output;
    }
  `,

  // Compute shader for particle physics
  particleCompute: `
    struct Particle {
      position: vec3f,
      velocity: vec3f,
      color: vec4f,
    }

    @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
    @group(0) @binding(1) var<uniform> deltaTime: f32;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      let index = id.x;
      var particle = particles[index];
      
      // Simple physics
      particle.velocity.y -= 9.8 * deltaTime;
      particle.position += particle.velocity * deltaTime;
      
      // Bounce off ground
      if (particle.position.y < -1.0) {
        particle.position.y = -1.0;
        particle.velocity.y *= -0.8;
      }
      
      particles[index] = particle;
    }
  `
};

/**
 * Utility to check WebGPU support
 */
export function isWebGPUSupported() {
  return 'gpu' in navigator;
}
