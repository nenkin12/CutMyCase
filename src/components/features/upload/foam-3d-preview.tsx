"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface LayoutItem {
  id: string;
  name: string;
  points: number[][];
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  color: string;
}

interface Foam3DPreviewProps {
  caseWidth: number;
  caseHeight: number;
  foamDepth?: number;
  items: LayoutItem[];
  className?: string;
}

export function Foam3DPreview({
  caseWidth,
  caseHeight,
  foamDepth = 2,
  items,
  className = "",
}: Foam3DPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const maxDim = Math.max(caseWidth, caseHeight, foamDepth);
    camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = maxDim * 0.5;
    controls.maxDistance = maxDim * 4;
    controls.maxPolarAngle = Math.PI / 2 + 0.3; // Allow slight view from below
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(maxDim, maxDim * 2, maxDim);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-maxDim, maxDim, -maxDim);
    scene.add(fillLight);

    // Grid helper (optional, for reference)
    const gridHelper = new THREE.GridHelper(maxDim * 2, 20, 0x333333, 0x222222);
    gridHelper.position.y = -foamDepth / 2 - 0.1;
    scene.add(gridHelper);

    setIsInitialized(true);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [caseWidth, caseHeight, foamDepth]);

  // Update foam and cutouts when items change
  useEffect(() => {
    if (!sceneRef.current || !isInitialized) return;

    const scene = sceneRef.current;

    // Remove existing foam meshes
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.userData.isFoam || child.userData.isCutout) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((obj) => scene.remove(obj));

    // Create foam base (gray foam material)
    const foamGeometry = new THREE.BoxGeometry(caseWidth, foamDepth, caseHeight);
    const foamMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.9,
      metalness: 0.0,
    });
    const foam = new THREE.Mesh(foamGeometry, foamMaterial);
    foam.position.set(0, 0, 0);
    foam.receiveShadow = true;
    foam.castShadow = true;
    foam.userData.isFoam = true;
    scene.add(foam);

    // Create cutouts for each item
    items.forEach((item) => {
      // Create extruded shape from points
      const shape = new THREE.Shape();

      if (item.points.length > 0) {
        // Use actual shape points
        shape.moveTo(item.points[0][0] - item.width / 2, item.points[0][1] - item.height / 2);
        for (let i = 1; i < item.points.length; i++) {
          shape.lineTo(item.points[i][0] - item.width / 2, item.points[i][1] - item.height / 2);
        }
        shape.closePath();
      } else {
        // Fallback to rectangle
        shape.moveTo(-item.width / 2, -item.height / 2);
        shape.lineTo(item.width / 2, -item.height / 2);
        shape.lineTo(item.width / 2, item.height / 2);
        shape.lineTo(-item.width / 2, item.height / 2);
        shape.closePath();
      }

      const extrudeSettings = {
        depth: Math.min(item.depth, foamDepth - 0.1),
        bevelEnabled: false,
      };

      const cutoutGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      // Rotate to lay flat and face up
      cutoutGeometry.rotateX(-Math.PI / 2);

      // Dark cutout material (shows depth)
      const cutoutMaterial = new THREE.MeshStandardMaterial({
        color: 0x0d0d0d,
        roughness: 0.95,
        metalness: 0.0,
      });

      const cutout = new THREE.Mesh(cutoutGeometry, cutoutMaterial);

      // Position: convert from case coordinates to 3D coordinates
      // Case origin is top-left, 3D origin is center
      const xPos = item.x + item.width / 2 - caseWidth / 2;
      const zPos = item.y + item.height / 2 - caseHeight / 2;
      const yPos = foamDepth / 2 - item.depth + 0.01; // Slightly above bottom to show depth

      cutout.position.set(xPos, yPos, zPos);
      cutout.castShadow = true;
      cutout.receiveShadow = true;
      cutout.userData.isCutout = true;
      cutout.userData.itemId = item.id;
      scene.add(cutout);

      // Add colored rim/edge to show item boundary
      const rimGeometry = new THREE.EdgesGeometry(cutoutGeometry);
      const rimMaterial = new THREE.LineBasicMaterial({
        color: item.color || 0xff4d00,
        linewidth: 2,
      });
      const rim = new THREE.LineSegments(rimGeometry, rimMaterial);
      rim.position.copy(cutout.position);
      rim.userData.isCutout = true;
      scene.add(rim);
    });

    // Add case border visualization (orange outline)
    const borderGeometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(caseWidth, foamDepth, caseHeight)
    );
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0xff4d00 });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    border.position.set(0, 0, 0);
    border.userData.isFoam = true;
    scene.add(border);

  }, [items, caseWidth, caseHeight, foamDepth, isInitialized]);

  // Update camera when case size changes
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const maxDim = Math.max(caseWidth, caseHeight, foamDepth);
    cameraRef.current.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
    controlsRef.current.minDistance = maxDim * 0.5;
    controlsRef.current.maxDistance = maxDim * 4;
    controlsRef.current.update();
  }, [caseWidth, caseHeight, foamDepth]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[300px] ${className}`}
      style={{ touchAction: "none" }}
    />
  );
}
