"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function AuthHeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.08, 7);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xfffbf2, 0x2b2a28, 1.8);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff3dc, 2.6);
    keyLight.position.set(3.8, 5.2, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xb08d57, 2.4, 16);
    rimLight.position.set(-3.4, 2.4, 3.4);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x49606a, 1.3, 12);
    fillLight.position.set(3.2, -1.4, 2.6);
    scene.add(fillLight);

    const group = new THREE.Group();
    group.rotation.set(-0.08, -0.32, -0.02);
    scene.add(group);

    const paperMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfffcf4,
      roughness: 0.62,
      metalness: 0.02,
      clearcoat: 0.24,
      clearcoatRoughness: 0.55,
    });
    const warmPaperMaterial = new THREE.MeshStandardMaterial({
      color: 0xefe6d8,
      roughness: 0.74,
      metalness: 0.03,
    });
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xb08d57,
      roughness: 0.42,
      metalness: 0.28,
    });
    const deepMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b2a28,
      roughness: 0.5,
      metalness: 0.16,
    });
    const mutedMaterial = new THREE.MeshStandardMaterial({
      color: 0x9a9286,
      roughness: 0.72,
      metalness: 0.04,
    });
    const blueGreyMaterial = new THREE.MeshStandardMaterial({
      color: 0x49606a,
      roughness: 0.58,
      metalness: 0.12,
    });
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.02,
      transmission: 0.1,
      transparent: true,
      opacity: 0.34,
      clearcoat: 0.9,
      clearcoatRoughness: 0.18,
    });
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9ad78,
      roughness: 0.38,
      metalness: 0.42,
      transparent: true,
      opacity: 0.7,
    });
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x2b2a28,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });

    const addBox = (
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
      position: [number, number, number],
      rotation: [number, number, number] = [0, 0, 0],
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      mesh.castShadow = depth >= 0.08;
      mesh.receiveShadow = depth >= 0.08;
      group.add(mesh);
      return mesh;
    };

    const frame = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.018, 10, 128), ringMaterial);
    frame.scale.set(0.82, 1.08, 1);
    frame.position.set(0.08, 0.05, -0.5);
    frame.rotation.z = -0.1;
    group.add(frame);

    addBox(3.15, 4.18, 0.08, warmPaperMaterial, [-0.16, -0.08, -0.27], [0, 0, 0.045]);
    addBox(3.02, 4.02, 0.08, glassMaterial, [0.1, 0.02, -0.11], [0, 0, -0.018]);
    addBox(2.78, 3.78, 0.1, paperMaterial, [0, 0, 0.04]);

    addBox(0.72, 3.78, 0.12, goldMaterial, [-1.03, 0, 0.12]);
    addBox(0.42, 0.42, 0.04, paperMaterial, [-1.03, 1.22, 0.2]);
    addBox(0.28, 0.04, 0.04, paperMaterial, [-1.03, 0.75, 0.2]);
    addBox(0.48, 0.035, 0.04, paperMaterial, [-1.03, 0.56, 0.2]);

    addBox(1.08, 0.075, 0.04, deepMaterial, [0.42, 1.34, 0.18]);
    addBox(1.55, 0.045, 0.035, goldMaterial, [0.66, 1.08, 0.18]);
    addBox(1.28, 0.035, 0.035, mutedMaterial, [0.52, 0.9, 0.18]);

    for (let i = 0; i < 5; i += 1) {
      addBox(1.55 - i * 0.12, 0.035, 0.03, mutedMaterial, [0.62, 0.45 - i * 0.18, 0.18]);
    }

    for (let i = 0; i < 4; i += 1) {
      addBox(1.28 - (i % 2) * 0.18, 0.032, 0.03, mutedMaterial, [0.49, -0.78 - i * 0.17, 0.18]);
    }

    addBox(1.56, 0.035, 0.035, goldMaterial, [0.63, -0.48, 0.19]);
    addBox(1.12, 0.035, 0.035, goldMaterial, [0.42, -1.36, 0.19]);

    const templateA = new THREE.Group();
    templateA.position.set(-1.82, -0.9, 0.18);
    templateA.rotation.set(0.05, 0.26, -0.12);
    group.add(templateA);
    const templateACard = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.12, 0.08), paperMaterial);
    templateACard.castShadow = true;
    templateA.add(templateACard);
    const templateAAccent = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.22, 0.09), blueGreyMaterial);
    templateAAccent.position.y = 0.45;
    templateA.add(templateAAccent);
    for (let i = 0; i < 4; i += 1) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.5 - i * 0.05, 0.026, 0.09), mutedMaterial);
      line.position.set(0, 0.16 - i * 0.16, 0.04);
      templateA.add(line);
    }

    const templateB = new THREE.Group();
    templateB.position.set(1.78, -0.7, -0.02);
    templateB.rotation.set(-0.05, -0.24, 0.12);
    group.add(templateB);
    const templateBCard = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.02, 0.08), paperMaterial);
    templateBCard.castShadow = true;
    templateB.add(templateBCard);
    const templateBSidebar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.02, 0.09), goldMaterial);
    templateBSidebar.position.x = -0.27;
    templateB.add(templateBSidebar);
    for (let i = 0; i < 4; i += 1) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.34 - (i % 2) * 0.05, 0.024, 0.09), mutedMaterial);
      line.position.set(0.15, 0.28 - i * 0.16, 0.04);
      templateB.add(line);
    }

    const chip = new THREE.Group();
    chip.position.set(0.78, -1.82, 0.46);
    chip.rotation.set(0.03, -0.16, 0.02);
    group.add(chip);
    const chipBase = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.36, 0.11), deepMaterial);
    chipBase.castShadow = true;
    chip.add(chipBase);
    const chipAccent = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.12), goldMaterial);
    chipAccent.position.x = -0.32;
    chip.add(chipAccent);
    const chipLine = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.045, 0.12), paperMaterial);
    chipLine.position.x = 0.18;
    chip.add(chipLine);

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.92), shadowMaterial);
    shadow.position.set(0, -2.32, -0.8);
    shadow.rotation.x = -0.18;
    group.add(shadow);

    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const handlePointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = -((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener("pointermove", handlePointerMove);
    const start = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = (performance.now() - start) / 1000;

      targetX += (pointerX - targetX) * 0.045;
      targetY += (pointerY - targetY) * 0.045;

      group.position.y = Math.sin(time * 0.75) * 0.08;
      group.rotation.y = -0.32 + targetX * 0.16 + Math.sin(time * 0.42) * 0.035;
      group.rotation.x = -0.08 - targetY * 0.08 + Math.sin(time * 0.36) * 0.018;
      group.rotation.z = -0.02 + Math.sin(time * 0.34) * 0.018;
      templateA.rotation.z = -0.12 + Math.sin(time * 0.72) * 0.025;
      templateB.rotation.z = 0.12 - Math.sin(time * 0.68) * 0.024;
      chip.position.y = -1.82 + Math.sin(time * 0.85 + 1.4) * 0.035;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();

      group.traverse((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else {
          material?.dispose();
        }
      });

      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" />;
}
