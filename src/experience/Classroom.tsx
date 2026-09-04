import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = { scene: number; facultyName: string };

function Bench({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.08, 0.62]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.36, 0.26]}>
        <boxGeometry args={[2.1, 0.62, 0.06]} />
        <meshStandardMaterial color="#57391f" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.34, -0.62]}>
        <boxGeometry args={[2.1, 0.1, 0.44]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.8} />
      </mesh>
      {[-0.95, 0.95].map((o) => (
        <mesh key={o} position={[o, 0.35, 0]}>
          <boxGeometry args={[0.09, 0.7, 0.58]} />
          <meshStandardMaterial color="#3f2a17" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function DustMotes({ count = 340 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 13;
      p[i * 3 + 1] = Math.random() * 4.2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);

  useFrame((state, delta) => {
    const pos = geo.attributes["position"] as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] = (arr[i * 3 + 1] ?? 0) + delta * 0.09;
      arr[i * 3] = (arr[i * 3] ?? 0) + Math.sin(state.clock.elapsedTime * 0.3 + i) * delta * 0.02;
      if ((arr[i * 3 + 1] ?? 0) > 4.3) arr[i * 3 + 1] = 0;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.035}
        color="#ffd9a0"
        transparent
        opacity={0.65}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export function Classroom({ scene, facultyName }: Props) {
  const group = useRef<THREE.Group>(null);
  const target = scene >= 3 ? 0 : scene === 0 ? 0.55 : 1;

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-2.4 * delta);
    g.userData["o"] = THREE.MathUtils.lerp((g.userData["o"] as number) ?? 0, target, k);
    const o = g.userData["o"] as number;
    g.visible = o > 0.02;
    g.position.y = (1 - o) * -1.2;
    g.traverse((child) => {
      const m = (child as THREE.Mesh).material as THREE.Material | undefined;
      if (m && "opacity" in m) {
        (m as THREE.MeshStandardMaterial).transparent = true;
        (m as THREE.MeshStandardMaterial).opacity = o;
      }
    });
  });

  const boardWarm = scene >= 2;

  return (
    <group ref={group}>
      {/* lights */}
      <ambientLight intensity={boardWarm ? 0.22 : 0.42} color="#9fb6d8" />
      <directionalLight
        position={[-7, 5.5, 2]}
        intensity={boardWarm ? 0.5 : 1.5}
        color="#ffd9a8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 2.6, -2.4]} intensity={boardWarm ? 14 : 6} color="#ffcf8a" distance={12} />

      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[16, 15]} />
        <meshStandardMaterial color="#2b2118" roughness={0.95} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 3, -4.2]} receiveShadow>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color="#3a3026" roughness={1} />
      </mesh>
      {/* side walls */}
      <mesh position={[-7.6, 3, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[15, 6]} />
        <meshStandardMaterial color="#332a20" roughness={1} />
      </mesh>
      <mesh position={[7.6, 3, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[15, 6]} />
        <meshStandardMaterial color="#332a20" roughness={1} />
      </mesh>

      {/* blackboard */}
      <group position={[0, 2.15, -4.14]}>
        <mesh>
          <boxGeometry args={[7.2, 3, 0.12]} />
          <meshStandardMaterial color="#4a3520" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[6.8, 2.66]} />
          <meshStandardMaterial color="#16261f" roughness={0.98} />
        </mesh>
        {/* chalk tray + chalk */}
        <mesh position={[0, -1.6, 0.16]}>
          <boxGeometry args={[7, 0.1, 0.24]} />
          <meshStandardMaterial color="#5a4026" roughness={0.85} />
        </mesh>
        <mesh position={[-1.6, -1.5, 0.16]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.045, 0.045, 0.3, 10]} />
          <meshStandardMaterial color="#f2ece0" roughness={0.6} />
        </mesh>
      </group>

      {/* clock */}
      <group position={[4.6, 4.1, -4.1]}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 28]} />
          <meshStandardMaterial color="#d9cbb2" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.06]} rotation-x={Math.PI / 2}>
          <boxGeometry args={[0.03, 0.06, 0.3]} />
          <meshStandardMaterial color="#2a2118" />
        </mesh>
      </group>

      {/* teacher desk */}
      <group position={[0, 0, -2.7]}>
        <mesh position={[0, 0.86, 0]} castShadow>
          <boxGeometry args={[2.8, 0.12, 1.1]} />
          <meshStandardMaterial color="#7a5330" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.42, -0.1]}>
          <boxGeometry args={[2.6, 0.84, 0.85]} />
          <meshStandardMaterial color="#5d3d22" roughness={0.85} />
        </mesh>
        {/* books */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.9, 0.96 + i * 0.09, 0.1]} rotation-y={i * 0.08}>
            <boxGeometry args={[0.7, 0.09, 0.5]} />
            <meshStandardMaterial
              color={["#8d3b3b", "#3b5a8d", "#3b8d5f"][i] ?? "#8d3b3b"}
              roughness={0.7}
            />
          </mesh>
        ))}
        {/* globe-ish lamp */}
        <mesh position={[1.05, 1.05, 0]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial emissive="#ffbe6b" emissiveIntensity={2} color="#2a2118" />
        </mesh>
      </group>

      {/* benches */}
      {[0, 1, 2].map((r) =>
        [-2.6, 0, 2.6].map((x) => <Bench key={`${r}-${x}`} x={x} z={0.2 + r * 1.75} />),
      )}

      {/* window with light shaft */}
      <group position={[-7.5, 2.6, -0.6]}>
        <mesh rotation-y={Math.PI / 2}>
          <planeGeometry args={[3.2, 2.4]} />
          <meshStandardMaterial
            color="#bcd8ff"
            emissive="#8fb6ef"
            emissiveIntensity={1.4}
            roughness={1}
          />
        </mesh>
      </group>
      <mesh position={[-4.4, 1.9, -0.4]} rotation-z={-0.42} rotation-y={0.2}>
        <planeGeometry args={[6.6, 2.6]} />
        <meshBasicMaterial color="#ffe3b0" transparent opacity={0.05} depthWrite={false} />
      </mesh>

      <DustMotes />
      <group userData={{ name: facultyName }} />
    </group>
  );
}
