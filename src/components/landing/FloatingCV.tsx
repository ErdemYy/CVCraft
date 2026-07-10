"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function FloatingCV() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xB08D57, 1.2);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xB08D57, 0.8, 20);
    pointLight.position.set(-3, 2, 2);
    scene.add(pointLight);

    // Create layered paper stack
    const papers: THREE.Mesh[] = [];
    const numLayers = 5;
    const paperColors = [
      0xffffff,
      0xf5f3ee,
      0xedeae3,
      0xe5e1d8,
      0xddd9cf,
    ];

    for (let i = 0; i < numLayers; i++) {
      const geo = new THREE.BoxGeometry(2.1, 2.97, 0.02);
      const mat = new THREE.MeshStandardMaterial({
        color: paperColors[i],
        roughness: 0.8,
        metalness: 0.0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = -i * 0.04;
      mesh.position.y = -i * 0.005;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      papers.push(mesh);
      scene.add(mesh);
    }

    // Top paper — add line decorations using canvas texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 724;
    const ctx = canvas.getContext("2d")!;

    // White background
    ctx.fillStyle = "#FAF9F6";
    ctx.fillRect(0, 0, 512, 724);

    // Gold header bar
    ctx.fillStyle = "#B08D57";
    ctx.fillRect(0, 0, 200, 724);

    // White lines on sidebar (contact info)
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(20, 140 + i * 30, 140, 6);
    }

    // Lines on main area
    ctx.fillStyle = "#E8E4DC";
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(220, 80 + i * 40, 260, 5);
    }
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(220, 85 + i * 40, 180, 5);
    }

    // Gold accent line
    ctx.fillStyle = "#B08D57";
    ctx.fillRect(220, 60, 260, 3);

    // Name placeholder
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(20, 60, 155, 20);
    ctx.fillRect(20, 88, 120, 12);

    const texture = new THREE.CanvasTexture(canvas);
    const topGeo = new THREE.BoxGeometry(2.1, 2.97, 0.025);
    const topMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.05,
    });
    const topPaper = new THREE.Mesh(topGeo, topMat);
    topPaper.position.z = 0.01;
    topPaper.castShadow = true;
    scene.add(topPaper);

    // Group all
    const group = new THREE.Group();
    papers.forEach((p) => group.add(p));
    group.add(topPaper);
    scene.add(group);

    // Animation
    let frameId: number;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const startTime = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) / 1000;

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Gentle floating
      group.position.y = Math.sin(t * 0.8) * 0.08;
      group.rotation.y = targetX * 0.3 + Math.sin(t * 0.5) * 0.05;
      group.rotation.x = -targetY * 0.2 + Math.sin(t * 0.3) * 0.03;
      group.rotation.z = Math.sin(t * 0.4) * 0.02;

      // Spread papers slightly
      papers.forEach((paper, i) => {
        paper.position.z = -i * 0.04 + Math.sin(t * 0.5 + i) * 0.01;
        paper.rotation.z = Math.sin(t * 0.3 + i * 0.5) * 0.008;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
