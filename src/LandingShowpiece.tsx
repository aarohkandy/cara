import { useEffect, useRef } from "react";
import * as THREE from "three";

function addEdges(mesh: THREE.Mesh, color = 0xf0cf9f) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.28,
    }),
  );
  mesh.add(edges);
}

function makeCircle(radius: number, segments = 160) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

function makeLine(points: THREE.Vector3[]) {
  return new THREE.BufferGeometry().setFromPoints(points);
}

export default function LandingShowpiece() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x080604, 7, 18);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(4.8, 3.1, 5.8);
    camera.lookAt(0, 0.25, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const rig = new THREE.Group();
    rig.rotation.set(-0.18, -0.48, 0.06);
    scene.add(rig);

    const clay = new THREE.MeshStandardMaterial({
      color: 0xb06931,
      metalness: 0.18,
      roughness: 0.54,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x221008,
      metalness: 0.1,
      roughness: 0.72,
    });
    const brass = new THREE.MeshStandardMaterial({
      color: 0xd3aa6e,
      metalness: 0.32,
      roughness: 0.42,
    });

    const makeBox = (
      geometry: THREE.BoxGeometry,
      position: [number, number, number],
      rotation: [number, number, number] = [0, 0, 0],
    ) => {
      const mesh = new THREE.Mesh(geometry, clay);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      addEdges(mesh);
      rig.add(mesh);
      return mesh;
    };

    const base = makeBox(new THREE.BoxGeometry(3.15, 0.34, 0.92, 4, 2, 4), [0, -0.34, 0]);
    const jawA = makeBox(new THREE.BoxGeometry(0.42, 1.58, 0.92, 2, 6, 4), [-1.1, 0.28, 0]);
    const jawB = makeBox(new THREE.BoxGeometry(0.42, 1.2, 0.92, 2, 6, 4), [0.88, 0.08, 0]);
    const topPlate = makeBox(new THREE.BoxGeometry(1.62, 0.22, 0.92, 4, 1, 4), [-0.18, 0.95, 0]);

    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.52, 40), brass);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(-0.05, 0.18, 0);
    addEdges(pin, 0xffdeb0);
    rig.add(pin);

    [-0.48, 0.48].forEach((z) => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.035, 36), dark);
      cap.position.set(-1.11, 0.28, z);
      cap.rotation.x = Math.PI / 2;
      rig.add(cap);
    });

    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.24, 44), brass);
    screw.position.set(1.18, 0.1, 0);
    screw.rotation.z = Math.PI / 2;
    addEdges(screw, 0xffdeb0);
    rig.add(screw);

    const datum = new THREE.Group();
    rig.add(datum);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xe0c59f,
      transparent: true,
      opacity: 0.24,
    });
    const hotLineMaterial = new THREE.LineBasicMaterial({
      color: 0xc77c43,
      transparent: true,
      opacity: 0.54,
    });

    [1.62, 2.22, 2.82].forEach((radius, index) => {
      const circle = new THREE.LineLoop(makeCircle(radius), index === 1 ? hotLineMaterial : lineMaterial);
      circle.rotation.x = Math.PI / 2;
      circle.position.y = -0.52 + index * 0.12;
      datum.add(circle);
    });

    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      const inner = 2.58;
      const outer = i % 3 === 0 ? 3.08 : 2.86;
      const tick = new THREE.Line(
        makeLine([
          new THREE.Vector3(Math.cos(angle) * inner, -0.3, Math.sin(angle) * inner),
          new THREE.Vector3(Math.cos(angle) * outer, -0.3, Math.sin(angle) * outer),
        ]),
        lineMaterial,
      );
      datum.add(tick);
    }

    const measureX = new THREE.Line(
      makeLine([new THREE.Vector3(-1.58, 1.26, 0.62), new THREE.Vector3(1.58, 1.26, 0.62)]),
      hotLineMaterial,
    );
    const measureY = new THREE.Line(
      makeLine([new THREE.Vector3(1.58, -0.54, 0.62), new THREE.Vector3(1.58, 1.26, 0.62)]),
      hotLineMaterial,
    );
    datum.add(measureX, measureY);

    const scan = new THREE.Mesh(
      new THREE.PlaneGeometry(0.035, 3.4),
      new THREE.MeshBasicMaterial({
        color: 0xe0c59f,
        transparent: true,
        opacity: 0.38,
        side: THREE.DoubleSide,
      }),
    );
    scan.rotation.y = Math.PI / 2;
    scan.position.set(-1.6, 0.22, 0);
    rig.add(scan);

    const pointsGeometry = new THREE.BufferGeometry();
    const pointPositions: number[] = [];
    for (let x = -4; x <= 4; x += 0.5) {
      for (let z = -3; z <= 3; z += 0.5) {
        pointPositions.push(x, -0.72, z);
      }
    }
    pointsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(pointPositions, 3));
    const pointField = new THREE.Points(
      pointsGeometry,
      new THREE.PointsMaterial({
        color: 0x9d7048,
        size: 0.012,
        transparent: true,
        opacity: 0.52,
      }),
    );
    scene.add(pointField);

    scene.add(new THREE.AmbientLight(0xffead4, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3.2, 4.8, 4.1);
    scene.add(key);
    const rim = new THREE.PointLight(0xc77c43, 42, 10);
    rim.position.set(-3.2, 1.2, 2.6);
    scene.add(rim);

    const pointer = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    const handlePointer = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", handlePointer);

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
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      smooth.x += (pointer.x - smooth.x) * 0.05;
      smooth.y += (pointer.y - smooth.y) * 0.05;

      rig.rotation.y = -0.48 + smooth.x * 0.32 + Math.sin(elapsed * 0.42) * 0.045;
      rig.rotation.x = -0.18 + smooth.y * 0.18 + Math.cos(elapsed * 0.33) * 0.018;
      datum.rotation.y = elapsed * 0.12;
      scan.position.x = THREE.MathUtils.lerp(-1.68, 1.62, (Math.sin(elapsed * 1.35) + 1) / 2);
      jawB.position.x = 0.88 + Math.sin(elapsed * 1.12) * 0.06;
      topPlate.position.y = 0.95 + Math.sin(elapsed * 0.86) * 0.035;
      base.position.y = -0.34 + Math.sin(elapsed * 0.64) * 0.012;
      jawA.position.y = 0.28 + Math.cos(elapsed * 0.58) * 0.012;
      pointField.rotation.y = elapsed * 0.025;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", handlePointer);
      observer.disconnect();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse((item) => {
        if (item instanceof THREE.Mesh || item instanceof THREE.LineSegments || item instanceof THREE.Line || item instanceof THREE.Points) {
          item.geometry.dispose();
          if (Array.isArray(item.material)) item.material.forEach((material) => material.dispose());
          else item.material.dispose();
        }
      });
    };
  }, []);

  return <div className="landing-showpiece" ref={mountRef} aria-hidden="true" />;
}
