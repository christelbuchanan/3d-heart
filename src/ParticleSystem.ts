import * as THREE from 'three';

export class ParticleSystem {
  private particles: THREE.Points;
  private particleCount: number = 1000;
  private mode: number = 0;
  private heart: THREE.Mesh;
  private scene: THREE.Scene;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private velocities: Float32Array;

  constructor(scene: THREE.Scene, heart: THREE.Mesh) {
    this.scene = scene;
    this.heart = heart;
    
    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    
    // Initialize particles
    for (let i = 0; i < this.particleCount * 3; i += 3) {
      this.resetParticle(i);
    }
    
    // Set positions to geometry
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    
    // Create material
    this.material = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x4facfe,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    // Create particle system
    this.particles = new THREE.Points(this.geometry, this.material);
    scene.add(this.particles);
  }

  private resetParticle(i: number): void {
    // Random position around the heart
    const radius = 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    this.positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    this.positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    this.positions[i + 2] = radius * Math.cos(phi);
    
    // Random velocities
    this.velocities[i] = (Math.random() - 0.5) * 0.02;
    this.velocities[i + 1] = (Math.random() - 0.5) * 0.02;
    this.velocities[i + 2] = (Math.random() - 0.5) * 0.02;
  }

  public update(time: number): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < this.particleCount * 3; i += 3) {
      switch (this.mode) {
        case 0: // Orbit mode
          this.updateOrbitMode(i, time);
          break;
        case 1: // Fountain mode
          this.updateFountainMode(i);
          break;
        case 2: // Spiral mode
          this.updateSpiralMode(i, time);
          break;
      }
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }

  private updateOrbitMode(i: number, time: number): void {
    const radius = 2;
    const speed = 0.5;
    const angle = time * speed + (i / 3) * 0.01;
    
    this.positions[i] = radius * Math.cos(angle);
    this.positions[i + 1] = radius * Math.sin(angle);
    this.positions[i + 2] += Math.sin(time + i) * 0.01;
  }

  private updateFountainMode(i: number): void {
    this.positions[i] += this.velocities[i];
    this.positions[i + 1] += this.velocities[i + 1];
    this.positions[i + 2] += this.velocities[i + 2];
    
    // Reset particle if it goes too far
    const distance = Math.sqrt(
      this.positions[i] ** 2 +
      this.positions[i + 1] ** 2 +
      this.positions[i + 2] ** 2
    );
    
    if (distance > 3) {
      this.resetParticle(i);
    }
  }

  private updateSpiralMode(i: number, time: number): void {
    const t = time + i * 0.01;
    const radius = 1 + Math.sin(t * 0.5) * 0.5;
    
    this.positions[i] = radius * Math.cos(t);
    this.positions[i + 1] = radius * Math.sin(t);
    this.positions[i + 2] = Math.sin(t * 2) * 0.5;
  }

  public changeMode(): void {
    this.mode = (this.mode + 1) % 3;
    
    // Reset particles on mode change
    for (let i = 0; i < this.particleCount * 3; i += 3) {
      this.resetParticle(i);
    }
  }
}
