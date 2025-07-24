import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Slide } from './slideTypes';

export interface ThreeInstance {
  animationId: number;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
}

export function initPointCloud(
  canvas: HTMLCanvasElement,
  slideIndex: number,
  slideData: Slide[],
  threeJSInstances: Record<number, ThreeInstance>,
  isModal = false
): void {
  if (!isModal && threeJSInstances[slideIndex]) return;

  const src = (canvas as HTMLElement).dataset.src;
  if (src && !slideData[slideIndex].pointData) {
    fetch(src)
      .then(res => res.text())
      .then(text => {
        const vertices: number[] = [];
        const colors: number[] = [];
        text.split(/\r?\n/).forEach(line => {
          const parts = line.trim().split(/[\s,]+/).map(Number);
          if (parts.length >= 3 && parts.slice(0, 3).every(n => !isNaN(n))) {
            vertices.push(parts[0], parts[1], parts[2]);
            if (parts.length >= 6 && parts.slice(3, 6).every(n => !isNaN(n))) {
              let [r, g, b] = parts.slice(3, 6);
              if (r > 1 || g > 1 || b > 1) {
                r /= 255;
                g /= 255;
                b /= 255;
              }
              colors.push(r, g, b);
            }
          }
        });
        slideData[slideIndex].pointData = { vertices, colors } as any;
        if (colors.length > 0) {
          (canvas as HTMLElement).dataset.useVertexColors = 'true';
        }
        initPointCloud(canvas, slideIndex, slideData, threeJSInstances, isModal);
      })
      .catch(err => console.error(`failed to load ${src}`, err));
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const pointsCount = parseInt((canvas as HTMLElement).dataset.points || '0');
  let useVertexColors = (canvas as HTMLElement).dataset.useVertexColors === 'true';

  const vertices = slideData[slideIndex].pointData?.vertices || [];
  const colors = slideData[slideIndex].pointData?.colors || [];
  if (!useVertexColors && colors.length > 0) {
    useVertexColors = true;
    (canvas as HTMLElement).dataset.useVertexColors = 'true';
  }

  if (pointsCount > 0 && vertices.length === 0) {
    for (let i = 0; i < pointsCount; i++) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * 2;
      const d = 1 / Math.sqrt(x * x + y * y + z * z);
      vertices.push(x * d, y * d, z * d);

      if (useVertexColors) {
        const color = new THREE.Color();
        color.setHSL(0.5 + y * 0.2, 1.0, 0.5);
        colors.push(color.r, color.g, color.b);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  if (vertices.length > 0) {
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    if (useVertexColors && colors.length > 0) {
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
  }

  const material = new THREE.PointsMaterial({ size: 0.012, vertexColors: useVertexColors });
  if (!useVertexColors) {
    material.color.set(0x00bfff);
  }

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  geometry.computeBoundingSphere();
  const bsphere = geometry.boundingSphere;
  if (bsphere) {
    const fov = (camera.fov * Math.PI) / 180;
    const distance = (bsphere.radius / Math.sin(fov / 2)) * 1.1;
    camera.position.set(bsphere.center.x, bsphere.center.y, bsphere.center.z + distance);
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
    controls.target.copy(bsphere.center);
    controls.update();
  }

  let animationId: number;
  function animate() {
    animationId = requestAnimationFrame(animate);
    points.rotation.y += 0.0002;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  if (!isModal) {
    threeJSInstances[slideIndex] = { animationId, camera, renderer, canvas };
  }
}
