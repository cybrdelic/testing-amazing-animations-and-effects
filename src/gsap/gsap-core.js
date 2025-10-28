/**
 * GSAP Essentials
 * Award-winning animation utilities using GSAP (GreenSock Animation Platform)
 */

import gsap from 'gsap';

/**
 * GSAP Animation Controller
 */
export class GSAPAnimator {
  constructor() {
    this.timelines = new Map();
    this.tweens = new Map();
  }

  /**
   * Create a timeline for complex animations
   */
  createTimeline(name, options = {}) {
    const timeline = gsap.timeline({
      paused: options.paused || false,
      repeat: options.repeat !== undefined ? options.repeat : 0,
      yoyo: options.yoyo || false,
      onComplete: options.onComplete,
      onUpdate: options.onUpdate,
      ...options
    });
    
    this.timelines.set(name, timeline);
    return timeline;
  }

  /**
   * Get a timeline by name
   */
  getTimeline(name) {
    return this.timelines.get(name);
  }

  /**
   * Create a tween animation
   */
  to(target, duration, vars, name) {
    const tween = gsap.to(target, {
      duration,
      ...vars
    });
    
    if (name) {
      this.tweens.set(name, tween);
    }
    
    return tween;
  }

  /**
   * Create a from animation
   */
  from(target, duration, vars, name) {
    const tween = gsap.from(target, {
      duration,
      ...vars
    });
    
    if (name) {
      this.tweens.set(name, tween);
    }
    
    return tween;
  }

  /**
   * Kill all animations
   */
  killAll() {
    this.timelines.forEach(timeline => timeline.kill());
    this.tweens.forEach(tween => tween.kill());
    this.timelines.clear();
    this.tweens.clear();
  }

  /**
   * Pause all animations
   */
  pauseAll() {
    this.timelines.forEach(timeline => timeline.pause());
    this.tweens.forEach(tween => tween.pause());
  }

  /**
   * Resume all animations
   */
  resumeAll() {
    this.timelines.forEach(timeline => timeline.resume());
    this.tweens.forEach(tween => tween.resume());
  }
}

/**
 * Award-winning animation presets
 */
export const GSAPPresets = {
  /**
   * Fade in animation
   */
  fadeIn(element, duration = 1, delay = 0) {
    return gsap.fromTo(element, 
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration, 
        delay,
        ease: 'power3.out'
      }
    );
  },

  /**
   * Fade out animation
   */
  fadeOut(element, duration = 1, delay = 0) {
    return gsap.to(element, {
      opacity: 0,
      y: -50,
      duration,
      delay,
      ease: 'power3.in'
    });
  },

  /**
   * Scale in animation
   */
  scaleIn(element, duration = 1, delay = 0) {
    return gsap.fromTo(element,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration,
        delay,
        ease: 'elastic.out(1, 0.5)'
      }
    );
  },

  /**
   * Bounce animation
   */
  bounce(element, duration = 1) {
    return gsap.to(element, {
      y: -20,
      duration: duration / 2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1
    });
  },

  /**
   * Rotate animation
   */
  rotate(element, degrees = 360, duration = 2) {
    return gsap.to(element, {
      rotation: degrees,
      duration,
      ease: 'power2.inOut'
    });
  },

  /**
   * Stagger animation for multiple elements
   */
  staggerIn(elements, duration = 1, stagger = 0.1) {
    return gsap.fromTo(elements,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out'
      }
    );
  },

  /**
   * Text reveal animation
   */
  textReveal(element, duration = 1.5) {
    // Split text into characters for animation
    const text = element.textContent;
    element.innerHTML = text.split('').map(char => 
      `<span style="display:inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');
    
    const chars = element.querySelectorAll('span');
    
    return gsap.fromTo(chars,
      { opacity: 0, y: 20, rotationX: -90 },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration,
        stagger: 0.02,
        ease: 'back.out(1.7)'
      }
    );
  },

  /**
   * Morphing animation between states
   */
  morph(element, properties, duration = 2) {
    return gsap.to(element, {
      ...properties,
      duration,
      ease: 'elastic.out(1, 0.3)'
    });
  },

  /**
   * Parallax scroll effect
   */
  parallax(element, speed = 0.5) {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      gsap.to(element, {
        y: scrolled * speed,
        ease: 'none',
        duration: 0
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  },

  /**
   * Magnetic effect (follows mouse)
   */
  magnetic(element, strength = 0.3) {
    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }
};

/**
 * Create a scroll-triggered animation
 */
export function createScrollAnimation(element, animationProps, triggerOptions = {}) {
  return gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: triggerOptions.start || 'top 80%',
      end: triggerOptions.end || 'bottom 20%',
      scrub: triggerOptions.scrub !== undefined ? triggerOptions.scrub : true,
      markers: triggerOptions.markers || false,
      ...triggerOptions
    },
    ...animationProps
  });
}

/**
 * Custom easing functions for award-winning animations
 */
export const CustomEasing = {
  // Smooth ease
  smooth: 'power2.inOut',
  
  // Elastic bounce
  elastic: 'elastic.out(1, 0.5)',
  
  // Back ease (overshoots)
  back: 'back.out(1.7)',
  
  // Circular ease
  circular: 'circ.inOut',
  
  // Exponential ease
  expo: 'expo.inOut',
  
  // Custom cubic bezier
  customBezier: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

/**
 * Advanced timeline builder for complex sequences
 */
export class TimelineBuilder {
  constructor() {
    this.timeline = gsap.timeline();
  }

  add(animation, position) {
    this.timeline.add(animation, position);
    return this;
  }

  addLabel(label, position) {
    this.timeline.addLabel(label, position);
    return this;
  }

  to(target, vars, position) {
    this.timeline.to(target, vars, position);
    return this;
  }

  from(target, vars, position) {
    this.timeline.from(target, vars, position);
    return this;
  }

  fromTo(target, fromVars, toVars, position) {
    this.timeline.fromTo(target, fromVars, toVars, position);
    return this;
  }

  call(callback, params, position) {
    this.timeline.call(callback, params, position);
    return this;
  }

  play() {
    this.timeline.play();
    return this;
  }

  pause() {
    this.timeline.pause();
    return this;
  }

  reverse() {
    this.timeline.reverse();
    return this;
  }

  restart() {
    this.timeline.restart();
    return this;
  }

  get() {
    return this.timeline;
  }
}

/**
 * Performance optimized animations
 */
export function enablePerformanceMode() {
  gsap.config({
    force3D: true,
    nullTargetWarn: false
  });
}
