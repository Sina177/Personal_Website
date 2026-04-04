'use strict';

const particleCount = 700;
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const baseTTL = 100;
const rangeTTL = 500;
const baseSpeed = 0.1;
const rangeSpeed = 1;
const baseSize = 2;
const rangeSize = 10;
const warmHue = 32;
const hueRange = 18;
const noiseSteps = 2;
const xOff = 0.0025;
const yOff = 0.005;
const zOff = 0.0005;
let container;
let canvas;
let ctx;
let center;
let gradient;
let tick;
let particleProps;
let positions;
let velocities;
let lifeSpans;
let speeds;
let sizes;
let hues;

function getBackgroundColor() {
  const bodyStyles = getComputedStyle(document.body);
  const themeBackground = bodyStyles.getPropertyValue('--bg-black-900').trim();
  return themeBackground || 'hsla(60,50%,3%,1)';
}

function isDarkMode() {
  return document.body.classList.contains('dark');
}

function getThemeColor() {
  const bodyStyles = getComputedStyle(document.body);
  return bodyStyles.getPropertyValue('--skin-color').trim() || '#ec1839';
}

function parseColor(color) {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((value) => value + value).join('');
    }
    const int = parseInt(hex, 16);
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255
    };
  }

  const match = color.match(/\d+(\.\d+)?/g);
  if (!match || match.length < 3) {
    return { r: 236, g: 24, b: 57 };
  }

  return {
    r: Number(match[0]),
    g: Number(match[1]),
    b: Number(match[2])
  };
}

function rgbToHue({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (!delta) return 0;

  let hue;

  if (max === red) {
    hue = ((green - blue) / delta) % 6;
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return (hue * 60 + 360) % 360;
}

function blendHue(hueA, hueB, amount) {
  const delta = ((hueB - hueA + 540) % 360) - 180;
  return (hueA + delta * amount + 360) % 360;
}

function getParticleHue() {
  const themeHue = rgbToHue(parseColor(getThemeColor()));
  return blendHue(themeHue, warmHue, 0.12);
}

function setup() {
  container = document.querySelector('.main-content .content--canvas') || document.querySelector('.content--canvas');
  if (!container) return;
	createCanvas();
  resize();
  initParticles();
	draw();
}

function initParticles() {
  tick = 0;
  particleProps = new Float32Array(particlePropsLength);

  let i;
  
  for (i = 0; i < particlePropsLength; i += particlePropCount) {
    initParticle(i);
  }
}

function initParticle(i) {
  let theta, x, y, vx, vy, life, ttl, speed, size, hue;

  x = rand(canvas.a.width);
  y = rand(canvas.a.height);
  theta = angle(x, y, center[0], center[1]);
  vx = cos(theta) * 6;
  vy = sin(theta) * 6;
  life = 0;
  ttl = baseTTL + rand(rangeTTL);
  speed = baseSpeed + rand(rangeSpeed);
  size = baseSize + rand(rangeSize);
  hue = (getParticleHue() + randRange(hueRange)) % 360;
  if (hue < 0) hue += 360;

  particleProps.set([x, y, vx, vy, life, ttl, speed, size, hue], i);
}

function drawParticles() {
  let i;

  for (i = 0; i < particlePropsLength; i += particlePropCount) {
    updateParticle(i);
  }
}

function updateParticle(i) {
  let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i, i9=8+i;
  let x, y, theta, vx, vy, life, ttl, speed, x2, y2, size, hue;

  x = particleProps[i];
  y = particleProps[i2];
  theta = angle(x, y, center[0], center[1]) + 0.75 * HALF_PI;
  vx = lerp(particleProps[i3], 2 * cos(theta), 0.05);
  vy = lerp(particleProps[i4], 2 * sin(theta), 0.05);
  life = particleProps[i5];
  ttl = particleProps[i6];
  speed = particleProps[i7];
  x2 = x + vx * speed;
  y2 = y + vy * speed;
  size = particleProps[i8];
  hue = particleProps[i9];

  drawParticle(x, y, theta, life, ttl, size, hue);

  life++;

  particleProps[i] = x2;
  particleProps[i2] = y2;
  particleProps[i3] = vx;
  particleProps[i4] = vy;
  particleProps[i5] = life;

  life > ttl && initParticle(i);
}

function drawParticle(x, y, theta, life, ttl, size, hue) {
  let xRel = x - (0.5 * size), yRel = y - (0.5 * size);
  const lightness = isDarkMode() ? 60 : 42;
  
  ctx.a.save();
  ctx.a.lineCap = 'round';
  ctx.a.lineWidth = 1;
  ctx.a.strokeStyle = `hsla(${hue},100%,${lightness}%,${fadeInOut(life, ttl)})`;
  ctx.a.beginPath();
  ctx.a.translate(xRel, yRel);
  ctx.a.rotate(theta);
  ctx.a.translate(-xRel, -yRel);
  ctx.a.strokeRect(xRel, yRel, size, size);
  ctx.a.closePath();
  ctx.a.restore();
}

function createCanvas() {
	canvas = {
		a: document.createElement('canvas'),
		b: document.createElement('canvas')
	};
	canvas.b.style = `
		position: fixed;
		inset: 0 auto 0 0;
		width: 0;
		height: 0;
    pointer-events: none;
	`;
	container.appendChild(canvas.b);
	ctx = {
		a: canvas.a.getContext('2d'),
		b: canvas.b.getContext('2d')
  };
  center = [];
}

function resize() {
  if (!canvas || !container) return;
  const rect = container.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, window.innerHeight);
	
	canvas.a.width = width;
  canvas.a.height = height;

  ctx.a.drawImage(canvas.b, 0, 0);

	canvas.b.width = width;
  canvas.b.height = height;
  canvas.b.style.left = `${Math.round(rect.left)}px`;
  canvas.b.style.top = '0px';
  canvas.b.style.width = `${width}px`;
  canvas.b.style.height = `${height}px`;
  
  ctx.b.drawImage(canvas.a, 0, 0);

  center[0] = 0.5 * canvas.a.width;
  center[1] = 0.5 * canvas.a.height;
}

function renderGlow() {
  const blurStrength = isDarkMode() ? 8 : 5;
  const brightness = isDarkMode() ? 200 : 115;

  ctx.b.save();
  ctx.b.filter = `blur(${blurStrength}px) brightness(${brightness}%)`;
  ctx.b.globalCompositeOperation = isDarkMode() ? 'lighter' : 'source-over';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();

  ctx.b.save();
  ctx.b.filter = `blur(${Math.max(2, blurStrength - 3)}px) brightness(${brightness}%)`;
  ctx.b.globalCompositeOperation = isDarkMode() ? 'lighter' : 'source-over';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function render() {
  ctx.b.save();
  ctx.b.globalCompositeOperation = isDarkMode() ? 'lighter' : 'source-over';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function draw() {
  tick++;

  ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);

  ctx.b.fillStyle = getBackgroundColor();
  ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);

  drawParticles();
  renderGlow();
  render();

	window.requestAnimationFrame(draw);
}

window.addEventListener('load', setup);
window.addEventListener('resize', resize);
