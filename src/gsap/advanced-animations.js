/**
 * Advanced GSAP Animations for Award-Winning Effects
 * Includes: Morph, liquid, physics-based, cursor-following effects
 */

import gsap from 'gsap';

/**
 * Liquid button effect with blob morphing
 */
export function createLiquidButton(element) {
  const blob = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  blob.setAttribute('viewBox', '0 0 200 60');
  blob.style.position = 'absolute';
  blob.style.top = '0';
  blob.style.left = '0';
  blob.style.width = '100%';
  blob.style.height = '100%';
  blob.style.pointerEvents = 'none';
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', 'url(#liquidGradient)');
  
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'liquidGradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '100%');
  
  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', '#667eea');
  
  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', '#764ba2');
  
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  blob.appendChild(defs);
  blob.appendChild(path);
  
  element.style.position = 'relative';
  element.insertBefore(blob, element.firstChild);
  
  // Animate blob morphing
  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  
  tl.to(path, {
    duration: 2,
    attr: {
      d: 'M 0,30 C 0,10 20,0 50,0 L 150,0 C 180,0 200,10 200,30 C 200,50 180,60 150,60 L 50,60 C 20,60 0,50 0,30 Z'
    },
    ease: 'sine.inOut'
  })
  .to(path, {
    duration: 2,
    attr: {
      d: 'M 0,30 C 0,15 15,0 40,0 L 160,0 C 185,0 200,15 200,30 C 200,45 185,60 160,60 L 40,60 C 15,60 0,45 0,30 Z'
    },
    ease: 'sine.inOut'
  });
  
  // Mouse interaction
  element.addEventListener('mouseenter', () => {
    gsap.to(path, {
      duration: 0.4,
      attr: {
        d: 'M 0,30 C 0,5 25,0 60,0 L 140,0 C 175,0 200,5 200,30 C 200,55 175,60 140,60 L 60,60 C 25,60 0,55 0,30 Z'
      },
      ease: 'elastic.out(1, 0.3)'
    });
  });
  
  element.addEventListener('mouseleave', () => {
    gsap.to(path, {
      duration: 0.6,
      attr: {
        d: 'M 0,30 C 0,10 20,0 50,0 L 150,0 C 180,0 200,10 200,30 C 200,50 180,60 150,60 L 50,60 C 20,60 0,50 0,30 Z'
      },
      ease: 'elastic.out(1, 0.3)'
    });
  });
  
  return () => {
    tl.kill();
    blob.remove();
  };
}

/**
 * Cursor-following spotlight effect
 */
export function createCursorSpotlight(container) {
  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
    pointer-events: none;
    mix-blend-mode: overlay;
    z-index: 9999;
    transform: translate(-50%, -50%);
  `;
  
  document.body.appendChild(spotlight);
  
  let mouseX = 0;
  let mouseY = 0;
  
  const handleMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  
  container.addEventListener('mousemove', handleMouseMove);
  
  // Smooth follow animation
  gsap.ticker.add(() => {
    gsap.to(spotlight, {
      x: mouseX,
      y: mouseY,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  
  return () => {
    container.removeEventListener('mousemove', handleMouseMove);
    spotlight.remove();
  };
}

/**
 * Morphing text effect with split characters
 */
export function createMorphingText(element, texts, duration = 3) {
  let currentIndex = 0;
  
  const morphToNext = () => {
    const currentText = texts[currentIndex];
    const nextIndex = (currentIndex + 1) % texts.length;
    const nextText = texts[nextIndex];
    
    const tl = gsap.timeline({
      onComplete: () => {
        currentIndex = nextIndex;
        setTimeout(morphToNext, duration * 1000);
      }
    });
    
    // Split current text into characters
    const chars = element.textContent.split('');
    element.innerHTML = '';
    
    chars.forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.display = 'inline-block';
      element.appendChild(span);
    });
    
    const charElements = element.querySelectorAll('span');
    
    // Animate out
    tl.to(charElements, {
      y: -50,
      opacity: 0,
      rotationX: -90,
      stagger: 0.03,
      duration: 0.5,
      ease: 'back.in(1.7)'
    });
    
    // Change text
    tl.call(() => {
      element.textContent = nextText;
      element.innerHTML = '';
      nextText.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        element.appendChild(span);
      });
    });
    
    // Animate in
    const newChars = element.querySelectorAll('span');
    gsap.set(newChars, { y: 50, opacity: 0, rotationX: 90 });
    
    tl.to(newChars, {
      y: 0,
      opacity: 1,
      rotationX: 0,
      stagger: 0.03,
      duration: 0.5,
      ease: 'back.out(1.7)'
    });
  };
  
  // Start the morphing
  setTimeout(morphToNext, duration * 1000);
  
  return () => {
    element.innerHTML = element.textContent;
  };
}

/**
 * Physics-based spring animation
 */
export function createSpringFollow(element, target = { x: 0, y: 0 }) {
  const position = { x: 0, y: 0 };
  const velocity = { x: 0, y: 0 };
  
  const spring = {
    stiffness: 0.15,
    damping: 0.25,
    mass: 1
  };
  
  const update = () => {
    // Spring physics
    const fx = (target.x - position.x) * spring.stiffness;
    const fy = (target.y - position.y) * spring.stiffness;
    
    velocity.x += fx / spring.mass;
    velocity.y += fy / spring.mass;
    
    velocity.x *= (1 - spring.damping);
    velocity.y *= (1 - spring.damping);
    
    position.x += velocity.x;
    position.y += velocity.y;
    
    gsap.set(element, {
      x: position.x,
      y: position.y
    });
  };
  
  gsap.ticker.add(update);
  
  return {
    setTarget: (newTarget) => {
      target.x = newTarget.x;
      target.y = newTarget.y;
    },
    cleanup: () => {
      gsap.ticker.remove(update);
    }
  };
}

/**
 * Award-winning page transition effect
 */
export function createPageTransition() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    z-index: 10000;
    pointer-events: none;
  `;
  
  // Create multiple sliding panels
  const panelCount = 5;
  for (let i = 0; i < panelCount; i++) {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: absolute;
      top: 0;
      left: ${i * (100 / panelCount)}%;
      width: ${100 / panelCount}%;
      height: 100%;
      background: linear-gradient(135deg, #667eea ${i * 20}%, #764ba2 ${100 - i * 20}%);
      transform: translateY(100%);
    `;
    overlay.appendChild(panel);
  }
  
  document.body.appendChild(overlay);
  
  const tl = gsap.timeline();
  const panels = overlay.querySelectorAll('div');
  
  // Slide in
  tl.to(panels, {
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power4.inOut'
  });
  
  // Slide out
  tl.to(panels, {
    y: '-100%',
    duration: 0.8,
    stagger: 0.1,
    ease: 'power4.inOut',
    delay: 0.3
  });
  
  // Cleanup
  tl.call(() => {
    overlay.remove();
  });
  
  return tl;
}

/**
 * Infinite marquee with smooth loop
 */
export function createInfiniteMarquee(container, items, speed = 50) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    gap: 2rem;
    width: max-content;
  `;
  
  // Clone items for seamless loop
  const allItems = [...items, ...items];
  allItems.forEach(item => {
    const clone = item.cloneNode(true);
    wrapper.appendChild(clone);
  });
  
  container.appendChild(wrapper);
  
  const totalWidth = wrapper.offsetWidth / 2;
  
  const tl = gsap.timeline({ repeat: -1 });
  tl.to(wrapper, {
    x: -totalWidth,
    duration: totalWidth / speed,
    ease: 'none'
  });
  
  return () => {
    tl.kill();
    wrapper.remove();
  };
}
