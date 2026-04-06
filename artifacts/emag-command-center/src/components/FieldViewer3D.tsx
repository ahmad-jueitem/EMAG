import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Eye, EyeOff, Zap, Activity } from "lucide-react";

// ─── Electric field lines around a point charge ─────────────────────────────
function ElectricFieldLines({ charge = 1, showVectors }: { charge?: number; showVectors: boolean }) {
  const lines = useMemo(() => {
    const result: { points: THREE.Vector3[]; color: string }[] = [];
    const numLines = 16;
    const sign = charge >= 0 ? 1 : -1;

    for (let i = 0; i < numLines; i++) {
      const theta = (i / numLines) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      let x = 0.35 * Math.cos(theta);
      let y = 0.35 * Math.sin(theta);
      let z = 0;

      for (let step = 0; step < 60; step++) {
        const r = Math.sqrt(x * x + y * y + z * z);
        if (r > 4 || r < 0.05) break;
        points.push(new THREE.Vector3(x, y, z));
        const fx = (sign * x) / (r * r * r);
        const fy = (sign * y) / (r * r * r);
        const fz = (sign * z) / (r * r * r);
        const mag = Math.sqrt(fx * fx + fy * fy + fz * fz);
        x += (fx / mag) * 0.1;
        y += (fy / mag) * 0.1;
        z += (fz / mag) * 0.1;
      }

      if (points.length > 2) {
        result.push({ points, color: charge >= 0 ? "#60a5fa" : "#f87171" });
      }
    }

    // Extra lines in z dimension
    for (let i = 0; i < 8; i++) {
      const phi = (i / 8) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      let x = 0.35 * Math.cos(phi) * 0.5;
      let y = 0.35 * Math.sin(phi) * 0.5;
      let z = 0.35;

      for (let step = 0; step < 60; step++) {
        const r = Math.sqrt(x * x + y * y + z * z);
        if (r > 4 || r < 0.05) break;
        points.push(new THREE.Vector3(x, y, z));
        const fx = (sign * x) / (r * r * r);
        const fy = (sign * y) / (r * r * r);
        const fz = (sign * z) / (r * r * r);
        const mag = Math.sqrt(fx * fx + fy * fy + fz * fz);
        x += (fx / mag) * 0.1;
        y += (fy / mag) * 0.1;
        z += (fz / mag) * 0.1;
      }
      if (points.length > 2) result.push({ points, color: charge >= 0 ? "#60a5fa" : "#f87171" });
    }

    return result;
  }, [charge]);

  return (
    <>
      {lines.map((line, i) => {
        const curve = new THREE.CatmullRomCurve3(line.points);
        const pts = curve.getPoints(50);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color={line.color} transparent opacity={0.7} />
          </line>
        );
      })}

      {/* Vector arrows at sample points */}
      {showVectors && lines.slice(0, 8).map((line, i) => {
        const midIdx = Math.floor(line.points.length / 2);
        const p = line.points[midIdx];
        if (!p) return null;
        const r = p.length();
        const dir = p.clone().normalize().multiplyScalar(charge >= 0 ? 1 : -1);
        return (
          <arrowHelper
            key={`arrow-${i}`}
            args={[dir, p, 0.4, charge >= 0 ? 0x60a5fa : 0xf87171, 0.15, 0.08]}
          />
        );
      })}
    </>
  );
}

// ─── Magnetic field lines around a current wire (along Z axis) ───────────────
function MagneticFieldLines({ showVectors }: { showVectors: boolean }) {
  const lines = useMemo(() => {
    const result: { points: THREE.Vector3[]; radius: number }[] = [];
    const radii = [0.5, 1.0, 1.6, 2.3];
    const numPerRadius = [24, 20, 16, 12];

    radii.forEach((radius, ri) => {
      const n = numPerRadius[ri];
      for (let i = 0; i < n; i++) {
        const z = -2 + (i / n) * 4;
        // Circular ring at height z, radius r
        const points: THREE.Vector3[] = [];
        for (let j = 0; j <= 64; j++) {
          const phi = (j / 64) * Math.PI * 2;
          points.push(new THREE.Vector3(radius * Math.cos(phi), radius * Math.sin(phi), z));
        }
        result.push({ points, radius });
      }
    });
    return result;
  }, []);

  const getColor = (r: number) => {
    if (r < 0.6) return "#a78bfa";
    if (r < 1.2) return "#8b5cf6";
    if (r < 2.0) return "#7c3aed";
    return "#6d28d9";
  };

  return (
    <>
      {/* Wire (Z axis) */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 5, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
      {/* Current direction arrow */}
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -0.5), 1.5, 0xfbbf24, 0.2, 0.1]} />

      {lines.map((line, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints(line.points);
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color={getColor(line.radius)} transparent opacity={0.6} />
          </line>
        );
      })}

      {/* Vector arrows */}
      {showVectors && [0.5, 1.0, 1.6].map((r, ri) => (
        [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((phi, pi) => {
          const x = r * Math.cos(phi);
          const y = r * Math.sin(phi);
          const dir = new THREE.Vector3(-Math.sin(phi), Math.cos(phi), 0);
          return (
            <arrowHelper
              key={`marrow-${ri}-${pi}`}
              args={[dir, new THREE.Vector3(x, y, 0), 0.35, 0xa78bfa, 0.12, 0.07]}
            />
          );
        })
      ))}
    </>
  );
}

// ─── Dipole electric field lines ─────────────────────────────────────────────
function DipoleFieldLines({ showVectors }: { showVectors: boolean }) {
  const lines = useMemo(() => {
    const result: { points: THREE.Vector3[]; isPlus: boolean }[] = [];
    const spacing = 1.2;
    const numLines = 20;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      let x = -spacing + 0.3 * Math.cos(angle);
      let y = 0.3 * Math.sin(angle);
      let z = 0;

      for (let step = 0; step < 120; step++) {
        const r1sq = (x + spacing) ** 2 + y ** 2 + z ** 2;
        const r2sq = (x - spacing) ** 2 + y ** 2 + z ** 2;
        const r1 = Math.sqrt(r1sq);
        const r2 = Math.sqrt(r2sq);
        if (r1 < 0.08 || r2 < 0.08 || x > 5 || x < -5 || Math.abs(y) > 4) break;

        const fx = (x + spacing) / (r1sq * r1) - (x - spacing) / (r2sq * r2);
        const fy = y / (r1sq * r1) - y / (r2sq * r2);
        const fz = z / (r1sq * r1) - z / (r2sq * r2);
        const mag = Math.sqrt(fx * fx + fy * fy + fz * fz) + 1e-10;
        points.push(new THREE.Vector3(x, y, z));
        x += (fx / mag) * 0.08;
        y += (fy / mag) * 0.08;
        z += (fz / mag) * 0.08;
      }
      if (points.length > 3) result.push({ points, isPlus: true });
    }
    return result;
  }, []);

  return (
    <>
      {/* Charges */}
      <mesh position={[-1.2, 0, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[1.2, 0, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.6} />
      </mesh>

      {lines.map((line, i) => {
        const curve = new THREE.CatmullRomCurve3(line.points);
        const pts = curve.getPoints(60);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#94a3b8" transparent opacity={0.55} />
          </line>
        );
      })}
    </>
  );
}

// ─── Rotating scene wrapper ───────────────────────────────────────────────────
function PointChargeSphere({ charge }: { charge: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => { meshRef.current.rotation.y += delta * 0.5; });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial
        color={charge >= 0 ? "#3b82f6" : "#ef4444"}
        emissive={charge >= 0 ? "#1d4ed8" : "#dc2626"}
        emissiveIntensity={0.8}
        roughness={0.1}
        metalness={0.5}
      />
    </mesh>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export type FieldMode = "electric-point" | "electric-dipole" | "magnetic-wire";

interface FieldViewer3DProps {
  mode: FieldMode;
  charge?: number;
  onModeChange: (mode: FieldMode) => void;
}

export default function FieldViewer3D({ mode, charge = 1, onModeChange }: FieldViewer3DProps) {
  const [showVectors, setShowVectors] = useState(true);

  const MODES: { id: FieldMode; label: string }[] = [
    { id: "electric-point", label: "Point Charge E" },
    { id: "electric-dipole", label: "Dipole E" },
    { id: "magnetic-wire", label: "Line Current B" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 flex-wrap">
        <div className="flex gap-1.5">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${mode === m.id
                  ? "bg-blue-600/30 border border-blue-500/50 text-blue-300"
                  : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowVectors(v => !v)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
            ${showVectors
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
        >
          {showVectors ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          Vectors
        </button>
      </div>

      {/* Label */}
      <div className="px-4 pb-2">
        <p className="text-slate-500 text-xs">
          {mode === "electric-point" && "Electric field lines radiating from a point charge. Blue = positive, Red = negative."}
          {mode === "electric-dipole" && "Electric dipole field (−Q at left, +Q at right). Field lines flow from − to +."}
          {mode === "magnetic-wire" && "Concentric magnetic field circles (φ̂ direction) around an infinite current-carrying wire (ẑ)."}
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 rounded-xl overflow-hidden border border-white/5 bg-slate-950/60 min-h-0">
        <Canvas
          camera={{ position: [3, 2.5, 4], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-3, 3, -3]} intensity={0.5} color="#60a5fa" />

          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            autoRotate={false}
          />

          {mode === "electric-point" && (
            <>
              <PointChargeSphere charge={charge} />
              <ElectricFieldLines charge={charge} showVectors={showVectors} />
            </>
          )}
          {mode === "electric-dipole" && <DipoleFieldLines showVectors={showVectors} />}
          {mode === "magnetic-wire" && <MagneticFieldLines showVectors={showVectors} />}

          <Grid
            args={[10, 10]}
            cellColor="#1e293b"
            sectionColor="#334155"
            fadeDistance={8}
            position={[0, -3, 0]}
            rotation={[0, 0, 0]}
          />

          {/* Axes helper */}
          <primitive object={new THREE.AxesHelper(1.5)} />
        </Canvas>
      </div>

      <div className="px-4 py-2">
        <p className="text-slate-600 text-xs">Drag to orbit · Scroll to zoom · Axes: X=red Y=green Z=blue</p>
      </div>
    </div>
  );
}
