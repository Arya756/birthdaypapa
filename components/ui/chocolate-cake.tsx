"use client";

import * as React from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

interface ChocolateCakeProps {
  className?: string;
  size?: number;
}

export function ChocolateCake({ className, size = 130 }: ChocolateCakeProps) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const cakeGroupRef = React.useRef<THREE.Group | null>(null);
  const isHoveredRef = React.useRef(false);

  React.useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera angled to see both top chocolate glaze and sponge sides
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 1.4, 3.6);
    camera.lookAt(0, 0, 0);

    // Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // ── Lighting ────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xfff7ee, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.4);
    keyLight.position.set(3, 4, 3.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe8c872, 1.4);
    rimLight.position.set(-3, 2, -2.5);
    scene.add(rimLight);

    const softFill = new THREE.DirectionalLight(0xffffff, 1.0);
    softFill.position.set(0, -2, 2);
    scene.add(softFill);

    // Cake Group
    const cakeGroup = new THREE.Group();
    cakeGroupRef.current = cakeGroup;
    scene.add(cakeGroup);

    // Gentle initial tilt for attractive 3D perspective
    cakeGroup.rotation.x = 0.22;

    // ── Load Cake.obj with Cake.mtl ─────────────────────────────
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath("/models/");
    mtlLoader.load(
      "Cake.mtl",
      (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath("/models/");
        objLoader.load(
          "Cake.obj",
          (cakeObj) => {
            // Measure bounding box to center and scale
            const box = new THREE.Box3().setFromObject(cakeObj);
            const center = box.getCenter(new THREE.Vector3());
            const boxSize = box.getSize(new THREE.Vector3());

            // Center object
            cakeObj.position.x = -center.x;
            cakeObj.position.y = -center.y;
            cakeObj.position.z = -center.z;

            // Normalize scale to ~2.3 units
            const maxDim = Math.max(boxSize.x, boxSize.z);
            const scale = 2.4 / maxDim;
            cakeObj.scale.set(scale, scale, scale);

            // Enhance materials for rich chocolate gloss
            cakeObj.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                  const mats = Array.isArray(mesh.material)
                    ? mesh.material
                    : [mesh.material];
                  mats.forEach((m) => {
                    if (m instanceof THREE.MeshPhongMaterial) {
                      m.shininess = 65;
                      m.specular = new THREE.Color(0x553322);
                    }
                  });
                }
              }
            });

            cakeGroup.add(cakeObj);
          },
          undefined,
          (err) => {
            console.error("Error loading Cake.obj:", err);
          },
        );
      },
      undefined,
      (err) => {
        console.error("Error loading Cake.mtl:", err);
      },
    );

    // ── Animation Loop ──────────────────────────────────────────
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Slow, graceful continuous 3D rotation
      const speedMult = isHoveredRef.current ? 1.6 : 1.0;
      cakeGroup.rotation.y += 0.0045 * speedMult;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      className={className}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      title="Happy Birthday Cake! 🎂 Tap to celebrate"
    />
  );
}

export default ChocolateCake;
