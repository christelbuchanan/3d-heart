import * as THREE from 'three';

export class HeartGeometry extends THREE.BufferGeometry {
  constructor(size = 1, detail = 3) {
    super();
    
    // Start with a simple heart shape in 2D
    const heartShape = new THREE.Shape();
    
    // Draw half of the heart
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -0.5 * size, -1 * size, -0.5 * size, -1 * size, 0.3 * size);
    heartShape.bezierCurveTo(-1 * size, 1 * size, 0, 1.5 * size, 0, 2 * size);
    
    // Draw the other half
    heartShape.bezierCurveTo(0, 1.5 * size, 1 * size, 1 * size, 1 * size, 0.3 * size);
    heartShape.bezierCurveTo(1 * size, -0.5 * size, 0, -0.5 * size, 0, 0);
    
    // Extrude the 2D shape to create a 3D heart
    const extrudeSettings = {
      depth: 0.8 * size,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.1 * size,
      bevelThickness: 0.1 * size,
      curveSegments: 12
    };
    
    // Create the geometry
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    
    // Center the geometry
    geometry.center();
    
    // Copy attributes from the extruded geometry
    this.copy(geometry);
    
    // Compute vertex normals for proper lighting
    this.computeVertexNormals();
  }
}
