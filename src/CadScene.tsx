import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Project } from "./types";

type CadSceneProps = {
  project: Project;
  showGrid?: boolean;
  showEdges?: boolean;
  hero?: boolean;
};

function makeMaterial(color: string, roughness = 0.48) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.26,
    roughness,
  });
}

function addEdges(mesh: THREE.Mesh, color: string) {
  const line = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.34,
    }),
  );
  line.position.copy(mesh.position);
  line.rotation.copy(mesh.rotation);
  line.scale.copy(mesh.scale);
  mesh.parent?.add(line);
}

function makeProjectModel(project: Project, showEdges: boolean) {
  const group = new THREE.Group();
  const material = makeMaterial(project.color);
  const edgeColor = project.color;

  const pushMesh = (mesh: THREE.Mesh) => {
    group.add(mesh);
    if (showEdges) addEdges(mesh, edgeColor);
  };

  if (project.id === "snowman") {
    const sizes = [1.35, 1.06, 0.76];
    sizes.forEach((size, index) => {
      const geometry = new THREE.BoxGeometry(size, size, size, 6, 6, 6);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = index * 0.95;
      mesh.rotation.y = index * 0.18;
      pushMesh(mesh);
    });

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 32), material);
    nose.rotation.z = Math.PI / 2;
    nose.position.set(0, 1.92, 0.48);
    pushMesh(nose);
  }

  if (project.id === "propeller") {
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.32, 64), material);
    hub.rotation.x = Math.PI / 2;
    pushMesh(hub);

    for (let i = 0; i < 5; i += 1) {
      const blade = new THREE.Mesh(new THREE.SphereGeometry(0.64, 42, 16), material);
      blade.scale.set(2.25, 0.22, 0.055);
      blade.position.x = 1.1;
      blade.rotation.z = -0.18;
      const bladeGroup = new THREE.Group();
      bladeGroup.rotation.z = (i / 5) * Math.PI * 2;
      bladeGroup.add(blade);
      group.add(bladeGroup);
      if (showEdges) addEdges(blade, edgeColor);
    }
  }

  if (project.id === "funnel") {
    const bowl = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.25, 80, 1, true), material);
    bowl.position.y = 0.38;
    bowl.rotation.x = Math.PI;
    pushMesh(bowl);

    const ringTop = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.06, 18, 96), material);
    ringTop.position.y = 1.02;
    ringTop.rotation.x = Math.PI / 2;
    pushMesh(ringTop);

    const ringBase = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 18, 96), material);
    ringBase.position.y = -0.23;
    ringBase.rotation.x = Math.PI / 2;
    pushMesh(ringBase);
  }

  if (project.id === "hinge") {
    for (let i = -1; i <= 1; i += 1) {
      const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.62, 36), material);
      knuckle.rotation.z = Math.PI / 2;
      knuckle.position.set(i * 0.48, 0.24, 0);
      pushMesh(knuckle);
    }

    const plateGeo = new THREE.BoxGeometry(1.55, 0.16, 0.78);
    const upper = new THREE.Mesh(plateGeo, material);
    upper.position.set(-0.56, -0.2, 0);
    upper.rotation.z = -0.12;
    pushMesh(upper);

    const lower = new THREE.Mesh(plateGeo, material);
    lower.position.set(0.56, -0.47, 0);
    lower.rotation.z = 0.16;
    pushMesh(lower);
  }

  if (!project.isBlank && !["snowman", "propeller", "funnel", "hinge"].includes(project.id)) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.86), material);
    base.position.y = -0.16;
    pushMesh(base);

    [-0.52, 0.52].forEach((x) => {
      const magnet = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 40), material);
      magnet.position.set(x, 0.08, 0);
      pushMesh(magnet);
    });

    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.055, 18, 72), material);
    handle.position.set(0, 0.36, 0);
    handle.rotation.x = Math.PI / 2;
    handle.scale.set(1, 0.48, 1);
    pushMesh(handle);

    group.scale.setScalar(1.28);
  }

  group.rotation.x = -0.28;
  return group;
}

export default function CadScene({
  project,
  showGrid = true,
  showEdges = true,
  hero = false,
}: CadSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b0704, hero ? 5.5 : 7, hero ? 15 : 18);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(hero ? 3.7 : 4.6, hero ? 2.65 : 3.7, hero ? 4.8 : 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xfff0dc, 0.74);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3.5, 4.5, 3.2);
    scene.add(key);
    const fill = new THREE.PointLight(0xffc987, hero ? 24 : 18, 10);
    fill.position.set(-2.8, 2.1, 2.3);
    scene.add(fill);

    const model = makeProjectModel(project, showEdges);
    model.position.y = hero ? -0.32 : 0.06;
    scene.add(model);

    if (showGrid) {
      const grid = new THREE.GridHelper(12, 32, "#4b3423", "#21160f");
      grid.position.y = -0.78;
      grid.material.opacity = hero ? 0.2 : 0.32;
      grid.material.transparent = true;
      scene.add(grid);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.enablePan = false;
    controls.enableZoom = !hero;
    controls.minDistance = 3.4;
    controls.maxDistance = 9;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let raf = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse((item) => {
        if (item instanceof THREE.Mesh || item instanceof THREE.LineSegments) {
          item.geometry.dispose();
          if (Array.isArray(item.material)) item.material.forEach((mat) => mat.dispose());
          else item.material.dispose();
        }
      });
    };
  }, [project, showGrid, showEdges, hero]);

  return <div className="cad-scene" ref={mountRef} aria-label={`${project.name} 3D viewport`} />;
}
