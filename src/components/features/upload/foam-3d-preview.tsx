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

  // Case dimensions
  const caseWallThickness = 0.3;
  const caseLipHeight = 0.5;
  const caseBaseHeight = foamDepth + 0.5;

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
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    const maxDim = Math.max(caseWidth, caseHeight, foamDepth);
    camera.position.set(maxDim * 1.0, maxDim * 1.2, maxDim * 1.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = maxDim * 0.5;
    controls.maxDistance = maxDim * 4;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(maxDim * 2, maxDim * 3, maxDim * 2);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = maxDim * 10;
    mainLight.shadow.camera.left = -maxDim * 2;
    mainLight.shadow.camera.right = maxDim * 2;
    mainLight.shadow.camera.top = maxDim * 2;
    mainLight.shadow.camera.bottom = -maxDim * 2;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-maxDim, maxDim, -maxDim);
    scene.add(fillLight);

    // Table surface
    const tableGeometry = new THREE.BoxGeometry(maxDim * 4, 0.5, maxDim * 3);
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2015,
      roughness: 0.8,
      metalness: 0.1,
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(0, -caseBaseHeight / 2 - 0.25 - 0.1, 0);
    table.receiveShadow = true;
    scene.add(table);

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
  }, [caseWidth, caseHeight, foamDepth, caseBaseHeight]);

  // Update foam and cutouts when items change
  useEffect(() => {
    if (!sceneRef.current || !isInitialized) return;

    const scene = sceneRef.current;

    // Remove existing case/foam meshes
    const toRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.userData.isCase || child.userData.isFoam || child.userData.isCutout) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((obj) => scene.remove(obj));

    // Case material (dark plastic)
    const caseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.4,
      metalness: 0.1,
    });

    // Case outer dimensions
    const caseOuterWidth = caseWidth + caseWallThickness * 2;
    const caseOuterHeight = caseHeight + caseWallThickness * 2;

    // Create case bottom (tray shape)
    const caseGroup = new THREE.Group();
    caseGroup.userData.isCase = true;

    // Case bottom
    const bottomGeometry = new THREE.BoxGeometry(caseOuterWidth, 0.3, caseOuterHeight);
    const bottom = new THREE.Mesh(bottomGeometry, caseMaterial);
    bottom.position.set(0, -caseBaseHeight / 2 + 0.15, 0);
    bottom.castShadow = true;
    bottom.receiveShadow = true;
    caseGroup.add(bottom);

    // Case walls
    const wallHeight = caseBaseHeight - 0.3;

    // Front wall
    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(caseOuterWidth, wallHeight, caseWallThickness),
      caseMaterial
    );
    frontWall.position.set(0, -caseBaseHeight / 2 + 0.3 + wallHeight / 2, caseOuterHeight / 2 - caseWallThickness / 2);
    frontWall.castShadow = true;
    caseGroup.add(frontWall);

    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(caseOuterWidth, wallHeight, caseWallThickness),
      caseMaterial
    );
    backWall.position.set(0, -caseBaseHeight / 2 + 0.3 + wallHeight / 2, -caseOuterHeight / 2 + caseWallThickness / 2);
    backWall.castShadow = true;
    caseGroup.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(caseWallThickness, wallHeight, caseOuterHeight - caseWallThickness * 2),
      caseMaterial
    );
    leftWall.position.set(-caseOuterWidth / 2 + caseWallThickness / 2, -caseBaseHeight / 2 + 0.3 + wallHeight / 2, 0);
    leftWall.castShadow = true;
    caseGroup.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(caseWallThickness, wallHeight, caseOuterHeight - caseWallThickness * 2),
      caseMaterial
    );
    rightWall.position.set(caseOuterWidth / 2 - caseWallThickness / 2, -caseBaseHeight / 2 + 0.3 + wallHeight / 2, 0);
    rightWall.castShadow = true;
    caseGroup.add(rightWall);

    scene.add(caseGroup);

    // Create foam base (charcoal gray foam)
    const foamGeometry = new THREE.BoxGeometry(caseWidth, foamDepth, caseHeight);
    const foamMaterial = new THREE.MeshStandardMaterial({
      color: 0x404040,
      roughness: 0.95,
      metalness: 0.0,
    });
    const foam = new THREE.Mesh(foamGeometry, foamMaterial);
    foam.position.set(0, -caseBaseHeight / 2 + 0.3 + foamDepth / 2, 0);
    foam.receiveShadow = true;
    foam.castShadow = true;
    foam.userData.isFoam = true;
    scene.add(foam);

    // Foam top Y position
    const foamTopY = -caseBaseHeight / 2 + 0.3 + foamDepth;

    // Create cutouts for each item
    items.forEach((item) => {
      // Create shape from points (in local XY plane, centered on item)
      // Negate Y so after rotation it matches the negated zPos
      const shape = new THREE.Shape();

      if (item.points.length > 0) {
        // Points are relative to item origin, center them and negate Y
        const px = item.points[0][0] - item.width / 2;
        const py = -(item.points[0][1] - item.height / 2);
        shape.moveTo(px, py);
        for (let i = 1; i < item.points.length; i++) {
          shape.lineTo(
            item.points[i][0] - item.width / 2,
            -(item.points[i][1] - item.height / 2)
          );
        }
        shape.closePath();
      } else {
        // Fallback to rectangle (Y negated)
        shape.moveTo(-item.width / 2, item.height / 2);
        shape.lineTo(item.width / 2, item.height / 2);
        shape.lineTo(item.width / 2, -item.height / 2);
        shape.lineTo(-item.width / 2, -item.height / 2);
        shape.closePath();
      }

      // Create the cutout as a recessed shape going DOWN into the foam
      const cutoutDepth = Math.min(item.depth, foamDepth - 0.2);
      const extrudeSettings = {
        depth: cutoutDepth,
        bevelEnabled: false,
      };

      const cutoutGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      // Rotate so shape lies flat (XZ plane) with extrusion going DOWN (-Y)
      // rotateX(Math.PI/2) maps: X→X, Y→-Z, Z→Y
      // We want the shape (originally XY) to be in XZ, so rotateX(-Math.PI/2)
      // maps: X→X, Y→Z, Z→-Y (extrusion goes down)
      cutoutGeometry.rotateX(-Math.PI / 2);

      // Dark interior material for the hole
      const holeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 1.0,
        metalness: 0.0,
      });

      const hole = new THREE.Mesh(cutoutGeometry, holeMaterial);

      // Position the cutout at foam top
      const xPos = item.x + item.width / 2 - caseWidth / 2;
      const zPos = -(item.y + item.height / 2 - caseHeight / 2);
      // Position at top of foam, extrusion goes down from here
      const yPos = foamTopY - cutoutDepth + 0.01;

      hole.position.set(xPos, yPos, zPos);
      hole.receiveShadow = true;
      hole.userData.isCutout = true;
      hole.userData.itemId = item.id;
      scene.add(hole);

      // Add colored outline at the top edge - use same points as cutout
      const outlinePoints: THREE.Vector3[] = [];
      if (item.points.length > 0) {
        for (let i = 0; i < item.points.length; i++) {
          const px = item.points[i][0] - item.width / 2;
          const py = item.points[i][1] - item.height / 2;
          // Map to 3D: X stays, Y becomes -Z (to match the zPos negation)
          outlinePoints.push(new THREE.Vector3(px, 0, -py));
        }
      } else {
        outlinePoints.push(new THREE.Vector3(-item.width / 2, 0, item.height / 2));
        outlinePoints.push(new THREE.Vector3(item.width / 2, 0, item.height / 2));
        outlinePoints.push(new THREE.Vector3(item.width / 2, 0, -item.height / 2));
        outlinePoints.push(new THREE.Vector3(-item.width / 2, 0, -item.height / 2));
      }

      const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outlinePoints);
      const outlineMaterial = new THREE.LineBasicMaterial({
        color: item.color || 0xff4d00,
        linewidth: 2,
      });
      const outline = new THREE.LineLoop(outlineGeometry, outlineMaterial);
      outline.position.set(xPos, foamTopY + 0.02, zPos);
      outline.userData.isCutout = true;
      scene.add(outline);
    });

  }, [items, caseWidth, caseHeight, foamDepth, caseWallThickness, caseBaseHeight, isInitialized]);

  // Update camera when case size changes
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const maxDim = Math.max(caseWidth, caseHeight, foamDepth);
    cameraRef.current.position.set(maxDim * 1.0, maxDim * 1.2, maxDim * 1.4);
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
