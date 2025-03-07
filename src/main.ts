import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HeartGeometry } from './HeartGeometry';
import { ParticleSystem } from './ParticleSystem';

// Initialize the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('app')?.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Create ambient light
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Create directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Create point lights for the glowing effect
const pointLight1 = new THREE.PointLight(0x4facfe, 2, 10);
pointLight1.position.set(2, 0, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x6a82fb, 2, 10);
pointLight2.position.set(-2, 0, -2);
scene.add(pointLight2);

// Create heart geometry - using a simpler, more recognizable approach
const heartGeometry = new HeartGeometry(1, 4);

// Create heart material with gradient
const heartMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    colorA: { value: new THREE.Color(0x4facfe) }, // Light blue
    colorB: { value: new THREE.Color(0x6a82fb) }, // Purple
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    uniform float time;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Add pulsating effect
      float pulse = 1.0 + 0.1 * sin(time * 2.0);
      vec3 newPosition = position * pulse;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float time;
    
    void main() {
      // Gradient based on position
      vec3 gradient = mix(colorA, colorB, vUv.y);
      
      // Add rim lighting effect
      float rimLight = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
      rimLight = pow(rimLight, 2.0) * 1.5;
      
      // Add pulsating glow
      float glow = 0.5 + 0.5 * sin(time * 2.0);
      
      // Combine effects
      vec3 finalColor = gradient + vec3(rimLight) * 0.5 + vec3(0.3, 0.4, 1.0) * glow * 0.3;
      
      gl_FragColor = vec4(finalColor, 0.9);
    }
  `,
  transparent: true,
  side: THREE.DoubleSide,
});

// Create heart mesh
const heart = new THREE.Mesh(heartGeometry, heartMaterial);
// Adjust initial rotation to show the heart from its best angle
heart.rotation.x = Math.PI / 2; // Rotate to show the heart properly
scene.add(heart);

// Add particle system
const particles = new ParticleSystem(scene, heart);

// Add info text
const infoElement = document.createElement('div');
infoElement.className = 'info';
infoElement.textContent = 'Click on the heart to interact';
document.body.appendChild(infoElement);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Handle mouse click
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(heart);
  
  if (intersects.length > 0) {
    // Change interaction mode
    particles.changeMode();
    
    // Create ripple effect
    const ripple = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      })
    );
    ripple.position.copy(intersects[0].point);
    scene.add(ripple);
    
    // Animate ripple
    const expandRipple = () => {
      if (ripple.scale.x < 3) {
        ripple.scale.x += 0.1;
        ripple.scale.y += 0.1;
        ripple.scale.z += 0.1;
        ripple.material.opacity -= 0.02;
        requestAnimationFrame(expandRipple);
      } else {
        scene.remove(ripple);
      }
    };
    expandRipple();
  }
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  
  // Update heart material
  heartMaterial.uniforms.time.value = elapsedTime;
  
  // Rotate heart slowly
  heart.rotation.z = elapsedTime * 0.2;
  
  // Update particles
  particles.update(elapsedTime);
  
  // Update controls
  controls.update();
  
  // Render scene
  renderer.render(scene, camera);
}

animate();
