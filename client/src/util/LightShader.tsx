import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// Define a custom shader material
const CustomLightingMaterial = shaderMaterial(
  {
    lightPos1: new THREE.Vector3(),  // First light position
    lightPos2: new THREE.Vector3(),  // Second light position
    objectColor: new THREE.Color(0x00ff00),  // Color of the object
  },
  // Vertex shader
  `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 lightPos1;
    uniform vec3 lightPos2;
    uniform vec3 objectColor;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 lightDirection1 = normalize(lightPos1 - vPosition);
      vec3 lightDirection2 = normalize(lightPos2 - vPosition);

      // Dot product to calculate light intensity
      float intensity1 = max(dot(vNormal, lightDirection1), 0.0);
      float intensity2 = max(dot(vNormal, lightDirection2), 0.0);

      // Combine light intensity, clamping to prevent overexposure
      float combinedIntensity = min(intensity1 + intensity2, 1.0);

      // Output the object's color modified by the light intensity
      gl_FragColor = vec4(objectColor * combinedIntensity, 1.0);
    }
  `
);

// Extend it into the React Three Fiber system
extend({ CustomLightingMaterial });