import { useRef, useMemo, Component, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Sphere, Torus, Cylinder } from "@react-three/drei";
import * as THREE from "three";

// ─── WebGL detection (synchronous, before any Canvas mount) ───────────────────
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// ─── WebGL Error Boundary (fallback if canvas throws after mount) ─────────────
class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return <WebGLFallback />;
    }
    return this.props.children;
  }
}

function WebGLFallback() {
  return (
    <div className="h-52 w-full flex flex-col items-center justify-center gap-2 bg-slate-900/40 rounded-xl border border-white/5">
      <div className="text-3xl opacity-30">⚡</div>
      <p className="text-slate-500 text-xs text-center max-w-48">3D visualization requires WebGL.<br/>Enable hardware acceleration in your browser.</p>
    </div>
  );
}

// ─── Scene: Point Charge (E-field flux lines) ─────────────────────────────────
function PointChargeScene({ Q }: { Q: number }) {
  const positive = Q >= 0;
  const color = positive ? "#38bdf8" : "#f87171";
  const chargeColor = positive ? "#7dd3fc" : "#fca5a5";

  const FluxLine = ({ theta, phi }: { theta: number; phi: number }) => {
    const points = useMemo(() => {
      const pts: [number, number, number][] = [];
      for (let t = 0.25; t <= 2.4; t += 0.12) {
        pts.push([
          t * Math.sin(phi) * Math.cos(theta),
          t * Math.cos(phi),
          t * Math.sin(phi) * Math.sin(theta),
        ]);
      }
      return pts;
    }, [theta, phi]);

    return (
      <Line
        points={points}
        color={color}
        lineWidth={1.2}
        transparent
        opacity={0.55}
      />
    );
  };

  const fluxLines: { theta: number; phi: number }[] = [];
  const steps = 4;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      fluxLines.push({
        theta: (i / steps) * 2 * Math.PI,
        phi: ((j + 0.5) / steps) * Math.PI,
      });
    }
  }

  const glowRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const s = 1 + 0.08 * Math.sin(clock.getElapsedTime() * 2);
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <>
      {fluxLines.map((l, i) => (
        <FluxLine key={i} theta={l.theta} phi={l.phi} />
      ))}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color={chargeColor} emissive={chargeColor} emissiveIntensity={1.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial color={chargeColor} transparent opacity={0.08} />
      </mesh>
      <pointLight color={chargeColor} intensity={2} distance={4} />
    </>
  );
}

// ─── Scene: Gauss Law Sphere ───────────────────────────────────────────────────
function GaussSphereScene({ r }: { r: number }) {
  const ArrowSet = () => {
    const arrows: JSX.Element[] = [];
    const dirs: [number, number, number][] = [
      [1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],
      [0.7,0.7,0],[-0.7,0.7,0],[0.7,-0.7,0],[-0.7,-0.7,0],
      [0.7,0,0.7],[-0.7,0,0.7],[0,0.7,0.7],[0,-0.7,0.7],
    ];
    dirs.forEach(([x, y, z], i) => {
      const len = new THREE.Vector3(x, y, z).length();
      const nx = x / len, ny = y / len, nz = z / len;
      const base: [number, number, number] = [nx * 1.05, ny * 1.05, nz * 1.05];
      const tip: [number, number, number] = [nx * 1.7, ny * 1.7, nz * 1.7];
      arrows.push(
        <Line key={i} points={[base, tip]} color="#34d399" lineWidth={1.5} transparent opacity={0.65} />
      );
    });
    return <>{arrows}</>;
  };

  return (
    <>
      {/* Gaussian surface */}
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.07} side={THREE.DoubleSide} wireframe={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.05, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.12} wireframe />
      </mesh>
      {/* Enclosed charge */}
      <mesh>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} />
      </mesh>
      <pointLight color="#fbbf24" intensity={1.5} distance={3} />
      <ArrowSet />
    </>
  );
}

// ─── Scene: Ampere Infinite Line Current ──────────────────────────────────────
function LineCurrentScene({ I }: { I: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
    }
  });

  const rings: JSX.Element[] = [];
  [0.7, 1.1, 1.55].forEach((r, i) => {
    rings.push(
      <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.012, 8, 48]} />
        <meshStandardMaterial
          color={I >= 0 ? "#a78bfa" : "#f87171"}
          emissive={I >= 0 ? "#7c3aed" : "#dc2626"}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7 - i * 0.15}
        />
      </mesh>
    );
  });

  return (
    <>
      {/* Wire */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 4, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
      </mesh>
      {/* Animated field rings */}
      <group ref={groupRef}>
        {rings}
        {/* Direction arrows on largest ring */}
        {[0, 1, 2, 3, 4, 5].map(k => {
          const angle = (k / 6) * 2 * Math.PI;
          const x = 1.55 * Math.cos(angle);
          const z = 1.55 * Math.sin(angle);
          const tx = -Math.sin(angle) * 0.25 * (I >= 0 ? 1 : -1);
          const tz = Math.cos(angle) * 0.25 * (I >= 0 ? 1 : -1);
          return (
            <Line
              key={k}
              points={[[x, 0, z], [x + tx, 0, z + tz]]}
              color="#c4b5fd"
              lineWidth={2}
              transparent
              opacity={0.7}
            />
          );
        })}
      </group>
      <pointLight color="#a78bfa" intensity={1} distance={5} />
    </>
  );
}

// ─── Scene: Toroid ─────────────────────────────────────────────────────────────
function ToroidScene({ N }: { N: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Toroid body */}
      <mesh>
        <torusGeometry args={[1.0, 0.35, 20, 60]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.0, 0.36, 10, 40]} />
        <meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Coil windings */}
      {Array.from({ length: Math.min(N, 20) }, (_, i) => {
        const angle = (i / Math.min(N, 20)) * 2 * Math.PI;
        const cx = Math.cos(angle) * 1.0;
        const cz = Math.sin(angle) * 1.0;
        return (
          <mesh key={i} position={[cx, 0, cz]} rotation={[0, -angle, Math.PI / 2]}>
            <torusGeometry args={[0.35, 0.025, 6, 12]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} />
          </mesh>
        );
      })}
      {/* H-field inside toroid (circular arrows) */}
      <mesh>
        <torusGeometry args={[1.0, 0.055, 6, 48]} />
        <meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={0.9} transparent opacity={0.6} />
      </mesh>
      <pointLight color="#38bdf8" intensity={1.5} distance={5} />
    </group>
  );
}

// ─── Scene: Parallel Plate Capacitor ──────────────────────────────────────────
function CapacitorScene() {
  const fieldRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (fieldRef.current) {
      const t = (clock.getElapsedTime() % 2) / 2;
      fieldRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.position.y = -0.8 + ((t + i * 0.25) % 1) * 1.6;
        }
      });
    }
  });

  const fieldLines: JSX.Element[] = [];
  [[-0.9,-0.5],[-0.9,0.5],[-0.3,-0.6],[-0.3,0.6],[0.3,-0.6],[0.3,0.6],[0.9,-0.5],[0.9,0.5]].forEach(
    ([x, z], i) => {
      fieldLines.push(
        <Line
          key={i}
          points={[[x, -0.8, z], [x, 0.8, z]]}
          color="#38bdf8"
          lineWidth={1.2}
          transparent
          opacity={0.5}
        />
      );
    }
  );

  return (
    <>
      {/* Top plate (+) */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[2.4, 0.08, 1.6]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.4} />
      </mesh>
      {/* Bottom plate (-) */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[2.4, 0.08, 1.6]} />
        <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.4} />
      </mesh>
      {/* Static field lines */}
      {fieldLines}
      {/* Animated particles */}
      <group ref={fieldRef}>
        {[[-0.6, 0],[0, 0],[0.6, 0]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z as number]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
      <pointLight color="#38bdf8" intensity={0.8} distance={5} position={[0, 2, 2]} />
    </>
  );
}

// ─── Scene: Wave propagation ───────────────────────────────────────────────────
function WaveScene() {
  const waveRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!waveRef.current) return;
    const t = clock.getElapsedTime();
    waveRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const x = -2 + i * 0.18;
        const y = 0.7 * Math.sin(t * 3 - i * 0.35);
        child.position.set(x, y, 0);
      }
    });
  });

  return (
    <>
      {/* E-field wave (blue) */}
      <group ref={waveRef}>
        {Array.from({ length: 24 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
      {/* Propagation axis */}
      <Line
        points={[[-2.2, 0, 0], [2.2, 0, 0]]}
        color="#334155"
        lineWidth={1}
      />
      {/* Labels via geometry */}
      <pointLight color="#38bdf8" intensity={1} distance={8} position={[0, 0, 3]} />
    </>
  );
}

// ─── Scene: Generic (Lorentz Force / default) ─────────────────────────────────
function GenericFieldScene() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Grid of field arrows */}
      {[-0.9, 0, 0.9].map(x =>
        [-0.9, 0, 0.9].map(z => (
          <Line
            key={`${x}-${z}`}
            points={[[x, -0.3, z], [x, 0.3, z]]}
            color="#38bdf8"
            lineWidth={1.5}
            transparent
            opacity={0.6}
          />
        ))
      )}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
      </mesh>
      <pointLight color="#38bdf8" intensity={1} distance={6} />
    </group>
  );
}

// ─── Scene selector ────────────────────────────────────────────────────────────
function SceneSelector({ problemId, inputs }: { problemId: string; inputs: Record<string, number> }) {
  switch (problemId) {
    case "coulombs-law":
    case "electric-field-point":
      return <PointChargeScene Q={inputs.Q ?? 1e-9} />;
    case "gauss-law-sphere":
      return <GaussSphereScene r={inputs.r ?? 0.05} />;
    case "ampere-infinite-line":
      return <LineCurrentScene I={inputs.I ?? 10} />;
    case "ampere-toroid":
      return <ToroidScene N={inputs.N ?? 200} />;
    case "capacitance-parallel":
      return <CapacitorScene />;
    case "skin-depth":
    case "phase-velocity":
    case "vswr":
      return <WaveScene />;
    default:
      return <GenericFieldScene />;
  }
}

// ─── Labels per problem ────────────────────────────────────────────────────────
const VIZ_LABELS: Record<string, { title: string; subtitle: string; color: string }> = {
  "coulombs-law": { title: "Electric Field Lines", subtitle: "Radial flux from point charge", color: "text-cyan-400" },
  "electric-field-point": { title: "E-Field Visualization", subtitle: "Radial field lines from Q", color: "text-cyan-400" },
  "gauss-law-sphere": { title: "Gaussian Surface", subtitle: "Closed surface · outward flux", color: "text-emerald-400" },
  "ampere-infinite-line": { title: "Magnetic Field H", subtitle: "Circulating field around wire", color: "text-violet-400" },
  "ampere-toroid": { title: "Toroid Field", subtitle: "H confined inside toroid", color: "text-blue-400" },
  "capacitance-parallel": { title: "Uniform E-Field", subtitle: "Parallel plate capacitor", color: "text-sky-400" },
  "skin-depth": { title: "Wave Attenuation", subtitle: "Exponential decay in conductor", color: "text-orange-400" },
  "phase-velocity": { title: "EM Wave Propagation", subtitle: "E-field oscillation along axis", color: "text-blue-400" },
  "vswr": { title: "Standing Wave Pattern", subtitle: "Incident + reflected wave", color: "text-yellow-400" },
};

// ─── Main export ───────────────────────────────────────────────────────────────
export default function SolverVisualizer({
  problemId,
  inputs,
}: {
  problemId: string;
  inputs: Record<string, number>;
}) {
  const label = VIZ_LABELS[problemId] ?? {
    title: "Field Visualization",
    subtitle: "3D electromagnetic field representation",
    color: "text-blue-400",
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${label.color}`}>{label.title}</p>
          <p className="text-slate-500 text-xs">{label.subtitle}</p>
        </div>
        <div className="text-slate-600 text-xs italic">Drag to orbit · Scroll to zoom</div>
      </div>
      <div className="h-52 w-full relative">
        {isWebGLAvailable() ? (
          <WebGLErrorBoundary>
            <Canvas
              camera={{ position: [3, 2.5, 3.5], fov: 48 }}
              style={{ background: "transparent" }}
              gl={{ alpha: true, antialias: true, failIfMajorPerformanceCaveat: false }}
              onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[3, 4, 2]} intensity={0.6} />
              <SceneSelector problemId={problemId} inputs={inputs} />
              <OrbitControls
                enablePan={false}
                minDistance={2}
                maxDistance={8}
                autoRotate
                autoRotateSpeed={1.2}
              />
            </Canvas>
          </WebGLErrorBoundary>
        ) : (
          <WebGLFallback />
        )}
      </div>
    </div>
  );
}
