import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, RefreshCw, Info } from "lucide-react";
import KatexRenderer from "@/components/KatexRenderer";

type CoordSystem = "cartesian" | "cylindrical" | "spherical";

const SYSTEM_INFO = {
  cartesian: {
    label: "Cartesian",
    vars: ["x", "y", "z"],
    labels: ["x", "y", "z"],
    latex: "(x, y, z)",
    unitVectors: ["\\hat{a}_x", "\\hat{a}_y", "\\hat{a}_z"],
    placeholders: ["e.g. 3", "e.g. 4", "e.g. 0"],
    units: ["m", "m", "m"],
  },
  cylindrical: {
    label: "Cylindrical",
    vars: ["rho", "phi", "z"],
    labels: ["ρ", "φ (°)", "z"],
    latex: "(\\rho, \\phi, z)",
    unitVectors: ["\\hat{a}_\\rho", "\\hat{a}_\\phi", "\\hat{a}_z"],
    placeholders: ["e.g. 5", "e.g. 53.13", "e.g. 0"],
    units: ["m", "deg", "m"],
  },
  spherical: {
    label: "Spherical",
    vars: ["r", "theta", "phi"],
    labels: ["r", "θ (°)", "φ (°)"],
    latex: "(r, \\theta, \\phi)",
    unitVectors: ["\\hat{a}_r", "\\hat{a}_\\theta", "\\hat{a}_\\phi"],
    placeholders: ["e.g. 5", "e.g. 90", "e.g. 53.13"],
    units: ["m", "deg", "deg"],
  },
};

interface TransformResult {
  cartesian: { x: number; y: number; z: number };
  cylindrical: { rho: number; phi: number; z: number };
  spherical: { r: number; theta: number; phi: number };
}

function toCartesian(system: CoordSystem, vals: number[]): { x: number; y: number; z: number } {
  if (system === "cartesian") return { x: vals[0], y: vals[1], z: vals[2] };
  if (system === "cylindrical") {
    const [rho, phiDeg, z] = vals;
    const phi = (phiDeg * Math.PI) / 180;
    return { x: rho * Math.cos(phi), y: rho * Math.sin(phi), z };
  }
  // spherical
  const [r, thetaDeg, phiDeg] = vals;
  const theta = (thetaDeg * Math.PI) / 180;
  const phi = (phiDeg * Math.PI) / 180;
  return {
    x: r * Math.sin(theta) * Math.cos(phi),
    y: r * Math.sin(theta) * Math.sin(phi),
    z: r * Math.cos(theta),
  };
}

function cartesianToAll(x: number, y: number, z: number): TransformResult {
  const rho = Math.sqrt(x * x + y * y);
  const phi = Math.atan2(y, x);
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = r > 0 ? Math.acos(Math.max(-1, Math.min(1, z / r))) : 0;
  return {
    cartesian: { x, y, z },
    cylindrical: { rho, phi, z },
    spherical: { r, theta, phi },
  };
}

// Convert a vector from one coordinate system to Cartesian
// (evaluated at a given point — required for cylindrical/spherical)
function transformVector(
  fromSystem: CoordSystem,
  pointVals: number[], // point in 'fromSystem'
  vectorVals: number[] // vector components in 'fromSystem'
): TransformResult {
  const { x: px, y: py, z: pz } = toCartesian(fromSystem, pointVals);

  // Compute transformation matrix (from-system unit vectors in Cartesian)
  let Vx = 0, Vy = 0, Vz = 0;

  if (fromSystem === "cartesian") {
    [Vx, Vy, Vz] = vectorVals;
  } else if (fromSystem === "cylindrical") {
    const [, phiDeg] = pointVals;
    const phi = (phiDeg * Math.PI) / 180;
    const [Vrho, Vphi, Vz2] = vectorVals;
    Vx = Vrho * Math.cos(phi) - Vphi * Math.sin(phi);
    Vy = Vrho * Math.sin(phi) + Vphi * Math.cos(phi);
    Vz = Vz2;
  } else {
    // spherical
    const [, thetaDeg, phiDeg] = pointVals;
    const theta = (thetaDeg * Math.PI) / 180;
    const phi = (phiDeg * Math.PI) / 180;
    const [Vr, Vth, Vph] = vectorVals;
    Vx = Vr * Math.sin(theta) * Math.cos(phi) + Vth * Math.cos(theta) * Math.cos(phi) - Vph * Math.sin(phi);
    Vy = Vr * Math.sin(theta) * Math.sin(phi) + Vth * Math.cos(theta) * Math.sin(phi) + Vph * Math.cos(phi);
    Vz = Vr * Math.cos(theta) - Vth * Math.sin(theta);
  }

  // Now convert from Cartesian to all systems (at point px, py, pz)
  const rho = Math.sqrt(px * px + py * py);
  const r = Math.sqrt(px * px + py * py + pz * pz);
  const phi_p = Math.atan2(py, px);
  const theta_p = r > 0 ? Math.acos(Math.max(-1, Math.min(1, pz / r))) : 0;

  // Cylindrical components of V
  const Vrho = Vx * Math.cos(phi_p) + Vy * Math.sin(phi_p);
  const Vphi = -Vx * Math.sin(phi_p) + Vy * Math.cos(phi_p);

  // Spherical components of V
  const Vr_s = Vx * Math.sin(theta_p) * Math.cos(phi_p) + Vy * Math.sin(theta_p) * Math.sin(phi_p) + Vz * Math.cos(theta_p);
  const Vth_s = Vx * Math.cos(theta_p) * Math.cos(phi_p) + Vy * Math.cos(theta_p) * Math.sin(phi_p) - Vz * Math.sin(theta_p);
  const Vph_s = -Vx * Math.sin(phi_p) + Vy * Math.cos(phi_p);

  return {
    cartesian: { x: Vx, y: Vy, z: Vz },
    cylindrical: { rho: Vrho, phi: Vphi, z: Vz },
    spherical: { r: Vr_s, theta: Vth_s, phi: Vph_s },
  };
}

const fmt = (n: number) => {
  if (Math.abs(n) < 1e-10) return "0";
  return Math.abs(n) > 999 || (Math.abs(n) < 0.001 && n !== 0) ? n.toExponential(4) : parseFloat(n.toFixed(6)).toString();
};
const fmtDeg = (rad: number) => parseFloat(((rad * 180) / Math.PI).toFixed(4)).toString();

export default function CoordTransformPage() {
  const [fromSystem, setFromSystem] = useState<CoordSystem>("cartesian");
  const [mode, setMode] = useState<"point" | "vector">("point");
  const [pointInputs, setPointInputs] = useState<Record<string, string>>({});
  const [vectorInputs, setVectorInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TransformResult | null>(null);
  const [error, setError] = useState("");

  const sys = SYSTEM_INFO[fromSystem];

  const handleTransform = useCallback(() => {
    setError("");
    const pVals = sys.vars.map(v => parseFloat(pointInputs[v] || ""));
    if (pVals.some(isNaN)) { setError("Please fill in all point coordinates."); return; }

    if (mode === "vector") {
      const vVals = sys.vars.map(v => parseFloat(vectorInputs[`v_${v}`] || ""));
      if (vVals.some(isNaN)) { setError("Please fill in all vector components."); return; }

      // Guardrails
      if (fromSystem === "cylindrical" && pVals[0] < 0) { setError("ρ must be ≥ 0."); return; }
      if (fromSystem === "spherical" && pVals[0] < 0) { setError("r must be ≥ 0."); return; }

      setResult(transformVector(fromSystem, pVals, vVals));
    } else {
      if (fromSystem === "cylindrical" && pVals[0] < 0) { setError("ρ must be ≥ 0."); return; }
      if (fromSystem === "spherical" && pVals[0] < 0) { setError("r must be ≥ 0."); return; }
      const { x, y, z } = toCartesian(fromSystem, pVals);
      setResult(cartesianToAll(x, y, z));
    }
  }, [fromSystem, mode, pointInputs, vectorInputs, sys]);

  const ResultCard = ({ system, vals }: { system: string; vals: number[] }) => {
    const info = SYSTEM_INFO[system as CoordSystem];
    return (
      <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <h4 className="text-slate-300 font-semibold text-sm">{info.label}</h4>
          <KatexRenderer latex={info.latex} className="text-slate-500 text-xs ml-1" />
        </div>
        <div className="space-y-2">
          {info.unitVectors.map((uv, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <KatexRenderer latex={uv + ":"} className="text-slate-400 text-sm min-w-[60px]" />
              <span className="text-white font-mono text-sm font-medium">
                {system === "cylindrical" && i === 1 ? `${fmt(vals[i])} rad (${fmtDeg(vals[i])}°)` :
                  system === "spherical" && i > 0 ? `${fmt(vals[i])} rad (${fmtDeg(vals[i])}°)` :
                    fmt(vals[i])}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getResultVals = (sys: CoordSystem) => {
    if (!result) return [0, 0, 0];
    if (sys === "cartesian") return [result.cartesian.x, result.cartesian.y, result.cartesian.z];
    if (sys === "cylindrical") return [result.cylindrical.rho, result.cylindrical.phi, result.cylindrical.z];
    return [result.spherical.r, result.spherical.theta, result.spherical.phi];
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <ArrowLeftRight className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Coordinate System Transformer</h2>
        </div>
        <p className="text-slate-400 text-sm">Convert points and vectors between Cartesian, Cylindrical, and Spherical coordinate systems instantly.</p>
      </motion.div>

      {/* Transformation equations reference */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Transformation Relations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm overflow-x-auto">
          {[
            ["x = \\rho\\cos\\phi = r\\sin\\theta\\cos\\phi", "Cartesian x"],
            ["y = \\rho\\sin\\phi = r\\sin\\theta\\sin\\phi", "Cartesian y"],
            ["\\rho = \\sqrt{x^2+y^2}, \\quad \\phi = \\arctan(y/x)", "Cylindrical"],
            ["r = \\sqrt{x^2+y^2+z^2}, \\quad \\theta = \\arccos(z/r)", "Spherical"],
          ].map(([latex, label], i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-900/40 rounded-lg px-3 py-2">
              <span className="text-slate-500 text-xs w-20 flex-shrink-0">{label}</span>
              <KatexRenderer latex={latex} className="text-slate-300 text-xs" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Input Panel */}
        <div className="lg:w-96 flex-shrink-0 space-y-4">
          {/* Mode & System selector */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Mode</p>
              <div className="flex gap-2">
                {(["point", "vector"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setResult(null); setError(""); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize
                      ${mode === m ? "bg-green-600/20 border-green-500/40 text-green-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                  >
                    {m === "vector" ? "Vector Transform" : "Point Transform"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Input System</p>
              <div className="flex gap-2">
                {(["cartesian", "cylindrical", "spherical"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => { setFromSystem(s); setResult(null); setError(""); setPointInputs({}); setVectorInputs({}); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize
                      ${fromSystem === s ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                  >
                    {SYSTEM_INFO[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Point coordinates */}
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
                {mode === "vector" ? "Evaluation Point " : "Input Point "}
                <KatexRenderer latex={sys.latex} className="text-slate-500" />
              </p>
              <div className="space-y-2">
                {sys.vars.map((v, i) => (
                  <div key={v} className="flex gap-2 items-center">
                    <label className="text-slate-400 text-sm w-16 flex-shrink-0 text-right">
                      <KatexRenderer latex={sys.labels[i] + ":"} />
                    </label>
                    <input
                      type="number"
                      value={pointInputs[v] || ""}
                      onChange={e => setPointInputs(p => ({ ...p, [v]: e.target.value }))}
                      placeholder={sys.placeholders[i]}
                      className="flex-1 bg-slate-900/80 border border-slate-600/40 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-500/50 transition-all"
                      step="any"
                    />
                    <span className="text-slate-500 text-xs w-8">{sys.units[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vector components (vector mode only) */}
            {mode === "vector" && (
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  Vector Components <KatexRenderer latex={"\\mathbf{A}"} className="text-slate-500" />
                </p>
                <div className="space-y-2">
                  {sys.vars.map((v, i) => (
                    <div key={v} className="flex gap-2 items-center">
                      <label className="text-slate-400 text-sm w-16 flex-shrink-0 text-right">
                        <KatexRenderer latex={"A_{" + sys.labels[i].replace(" (°)", "") + "}:"} />
                      </label>
                      <input
                        type="number"
                        value={vectorInputs[`v_${v}`] || ""}
                        onChange={e => setVectorInputs(p => ({ ...p, [`v_${v}`]: e.target.value }))}
                        placeholder="0"
                        className="flex-1 bg-slate-900/80 border border-slate-600/40 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-500/50 transition-all"
                        step="any"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={handleTransform}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-green-600/30 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Transform
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <AnimatePresence>
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  {mode === "point" ? "Equivalent Point Coordinates" : "Vector in All Systems"}
                </p>
                {(["cartesian", "cylindrical", "spherical"] as const).map(s => (
                  <ResultCard key={s} system={s} vals={getResultVals(s)} />
                ))}

                {/* LaTeX output */}
                {mode === "vector" && (
                  <div className="bg-white/[0.03] backdrop-blur-md border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-400 text-xs font-semibold mb-3">Result in Cartesian</p>
                    <div className="overflow-x-auto text-center">
                      <KatexRenderer
                        latex={`\\mathbf{A} = ${fmt(result.cartesian.x)}\\hat{a}_x + ${fmt(result.cartesian.y)}\\hat{a}_y + ${fmt(result.cartesian.z)}\\hat{a}_z`}
                        display
                        className="text-slate-200"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-center py-20">
                <div>
                  <ArrowLeftRight className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Fill in coordinates and click Transform</p>
                  <p className="text-slate-600 text-xs mt-1">Results appear in all three coordinate systems</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
