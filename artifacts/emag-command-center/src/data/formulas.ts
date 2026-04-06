export interface Formula {
  id: string;
  name: string;
  latex: string;
  description: string;
  variables: { symbol: string; name: string; unit: string }[];
  chapter: string;
  topic: string;
}

export interface SolverProblem {
  id: string;
  name: string;
  category: string;
  formulaId: string;
  inputs: { key: string; label: string; unit: string; placeholder: string }[];
  outputs: { key: string; label: string; unit: string }[];
  solve: (inputs: Record<string, number>) => Record<string, number>;
  steps: (inputs: Record<string, number>, outputs: Record<string, number>) => string[];
  latexTemplate: string;
}

export const CONSTANTS = {
  epsilon0: { value: 8.854187817e-12, symbol: "\\varepsilon_0", name: "Permittivity of Free Space", unit: "F/m" },
  mu0: { value: 4 * Math.PI * 1e-7, symbol: "\\mu_0", name: "Permeability of Free Space", unit: "H/m" },
  c: { value: 2.997924458e8, symbol: "c", name: "Speed of Light", unit: "m/s" },
  k: { value: 8.9875517923e9, symbol: "k_e", name: "Coulomb's Constant", unit: "N·m²/C²" },
  e: { value: 1.60217663e-19, symbol: "e", name: "Elementary Charge", unit: "C" },
  eta0: { value: 376.730313668, symbol: "\\eta_0", name: "Intrinsic Impedance of Free Space", unit: "Ω" },
};

export const CHAPTERS = [
  {
    id: "ch1",
    number: 1,
    title: "Vector Algebra & Coordinate Systems",
    summary: "Fundamental mathematical tools for electromagnetics including vector operations, coordinate transformations between Cartesian, cylindrical, and spherical systems.",
    keyEquations: [
      { latex: "\\mathbf{A} \\cdot \\mathbf{B} = AB\\cos\\theta_{AB}", description: "Dot product" },
      { latex: "\\mathbf{A} \\times \\mathbf{B} = AB\\sin\\theta_{AB}\\hat{a}_n", description: "Cross product" },
      { latex: "\\nabla T = \\frac{\\partial T}{\\partial x}\\hat{a}_x + \\frac{\\partial T}{\\partial y}\\hat{a}_y + \\frac{\\partial T}{\\partial z}\\hat{a}_z", description: "Gradient (Cartesian)" },
      { latex: "\\nabla \\cdot \\mathbf{A} = \\frac{\\partial A_x}{\\partial x} + \\frac{\\partial A_y}{\\partial y} + \\frac{\\partial A_z}{\\partial z}", description: "Divergence (Cartesian)" },
      { latex: "\\nabla \\times \\mathbf{A} = \\begin{vmatrix}\\hat{a}_x & \\hat{a}_y & \\hat{a}_z \\\\ \\partial/\\partial x & \\partial/\\partial y & \\partial/\\partial z \\\\ A_x & A_y & A_z\\end{vmatrix}", description: "Curl (Cartesian)" },
      { latex: "\\nabla^2 V = \\frac{\\partial^2 V}{\\partial x^2} + \\frac{\\partial^2 V}{\\partial y^2} + \\frac{\\partial^2 V}{\\partial z^2}", description: "Laplacian" },
    ],
    terms: ["Vector", "Scalar", "Gradient", "Divergence", "Curl", "Laplacian", "Divergence Theorem", "Stokes's Theorem"],
    color: "blue",
  },
  {
    id: "ch2",
    number: 2,
    title: "Electrostatic Fields",
    summary: "Analysis of static electric fields produced by charge distributions. Covers Coulomb's law, electric field intensity, electric flux density, and Gauss's law.",
    keyEquations: [
      { latex: "\\mathbf{F} = \\frac{Q_1 Q_2}{4\\pi\\varepsilon_0 R^2}\\hat{a}_R", description: "Coulomb's Law" },
      { latex: "\\mathbf{E} = \\frac{Q}{4\\pi\\varepsilon_0 r^2}\\hat{a}_r", description: "Electric field of point charge" },
      { latex: "\\mathbf{D} = \\varepsilon_0 \\mathbf{E}", description: "Electric flux density (free space)" },
      { latex: "\\oint_S \\mathbf{D} \\cdot d\\mathbf{S} = Q_{enc}", description: "Gauss's Law (integral form)" },
      { latex: "\\nabla \\cdot \\mathbf{D} = \\rho_v", description: "Gauss's Law (point form / Maxwell's 1st Eq.)" },
      { latex: "V = \\frac{Q}{4\\pi\\varepsilon_0 r}", description: "Electric potential of point charge" },
      { latex: "\\mathbf{E} = -\\nabla V", description: "E from potential" },
    ],
    terms: ["Coulomb's Law", "Electric Field Intensity", "Electric Flux Density", "Gauss's Law", "Electric Potential", "Superposition Principle", "Line Charge", "Surface Charge", "Volume Charge"],
    color: "cyan",
  },
  {
    id: "ch3",
    number: 3,
    title: "Electric Fields in Material Space",
    summary: "Behavior of electric fields in dielectric materials. Covers polarization, permittivity, capacitance, and boundary conditions between different media.",
    keyEquations: [
      { latex: "\\mathbf{D} = \\varepsilon_0 \\mathbf{E} + \\mathbf{P} = \\varepsilon_0\\varepsilon_r \\mathbf{E}", description: "D in dielectric" },
      { latex: "\\mathbf{P} = \\chi_e \\varepsilon_0 \\mathbf{E}", description: "Polarization" },
      { latex: "C = \\frac{Q}{V}", description: "Capacitance" },
      { latex: "C = \\frac{\\varepsilon_0\\varepsilon_r A}{d}", description: "Parallel plate capacitor" },
      { latex: "W_E = \\frac{1}{2}\\varepsilon E^2", description: "Electrostatic energy density" },
      { latex: "E_{t1} = E_{t2}", description: "Boundary condition: tangential E continuous" },
      { latex: "D_{n1} - D_{n2} = \\rho_S", description: "Boundary condition: normal D discontinuous" },
    ],
    terms: ["Dielectric", "Permittivity", "Polarization", "Electric Susceptibility", "Capacitance", "Energy Density", "Boundary Conditions", "Relative Permittivity"],
    color: "violet",
  },
  {
    id: "ch4",
    number: 4,
    title: "Magnetostatic Fields",
    summary: "Static magnetic fields produced by steady currents. Covers Biot-Savart law, Ampere's law, magnetic flux density, and magnetic field intensity.",
    keyEquations: [
      { latex: "d\\mathbf{H} = \\frac{I\\,d\\mathbf{l} \\times \\hat{a}_R}{4\\pi R^2}", description: "Biot-Savart Law" },
      { latex: "\\oint_L \\mathbf{H} \\cdot d\\mathbf{l} = I_{enc}", description: "Ampere's Circuit Law (integral form)" },
      { latex: "\\nabla \\times \\mathbf{H} = \\mathbf{J}", description: "Ampere's Law (point form / Maxwell's 3rd Eq.)" },
      { latex: "\\mathbf{H} = \\frac{I}{2\\pi\\rho}\\hat{a}_\\phi", description: "H for infinite line current" },
      { latex: "\\mathbf{B} = \\mu_0 \\mathbf{H}", description: "B in free space" },
      { latex: "\\oint_S \\mathbf{B} \\cdot d\\mathbf{S} = 0", description: "Gauss's Law for magnetics (Maxwell's 2nd Eq.)" },
      { latex: "\\mathbf{H} = \\frac{NI}{2\\pi\\rho}\\hat{a}_\\phi", description: "H inside toroid" },
    ],
    terms: ["Biot-Savart Law", "Ampere's Law", "Magnetic Field Intensity", "Magnetic Flux Density", "Solenoid", "Toroid", "Coaxial Line", "Magnetostatic Field"],
    color: "green",
  },
  {
    id: "ch5",
    number: 5,
    title: "Magnetic Forces, Materials & Devices",
    summary: "Magnetic forces on current-carrying conductors and moving charges. Magnetic materials, inductance, and energy stored in magnetic fields.",
    keyEquations: [
      { latex: "\\mathbf{F} = Q(\\mathbf{E} + \\mathbf{u} \\times \\mathbf{B})", description: "Lorentz force equation" },
      { latex: "\\mathbf{F} = I\\int d\\mathbf{l} \\times \\mathbf{B}", description: "Force on current-carrying conductor" },
      { latex: "L = \\frac{\\lambda}{I} = \\frac{N\\Phi}{I}", description: "Inductance" },
      { latex: "W_m = \\frac{1}{2}\\mu H^2", description: "Magnetic energy density" },
      { latex: "\\mathbf{B} = \\mu_0(\\mathbf{H} + \\mathbf{M}) = \\mu_0\\mu_r \\mathbf{H}", description: "B in magnetic material" },
      { latex: "H_{t1} - H_{t2} = \\mathbf{K} \\times \\hat{a}_{n12}", description: "Boundary condition: tangential H" },
      { latex: "B_{n1} = B_{n2}", description: "Boundary condition: normal B continuous" },
    ],
    terms: ["Lorentz Force", "Inductance", "Mutual Inductance", "Magnetization", "Permeability", "Magnetic Energy", "Magnetic Torque", "Ferromagnetism"],
    color: "orange",
  },
  {
    id: "ch6",
    number: 6,
    title: "Maxwell's Equations",
    summary: "The complete set of Maxwell's equations unifying electricity and magnetism. Covers displacement current, Faraday's law, and time-varying fields.",
    keyEquations: [
      { latex: "\\nabla \\cdot \\mathbf{D} = \\rho_v", description: "Gauss's Law for E (Maxwell's 1st)" },
      { latex: "\\nabla \\cdot \\mathbf{B} = 0", description: "Gauss's Law for B (Maxwell's 2nd)" },
      { latex: "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}", description: "Faraday's Law (Maxwell's 3rd)" },
      { latex: "\\nabla \\times \\mathbf{H} = \\mathbf{J} + \\frac{\\partial \\mathbf{D}}{\\partial t}", description: "Ampere-Maxwell Law (Maxwell's 4th)" },
      { latex: "V_{emf} = -\\frac{d\\Phi_B}{dt}", description: "Faraday's Law (integral form)" },
      { latex: "\\mathbf{J}_d = \\frac{\\partial \\mathbf{D}}{\\partial t} = \\varepsilon\\frac{\\partial \\mathbf{E}}{\\partial t}", description: "Displacement current density" },
    ],
    terms: ["Maxwell's Equations", "Faraday's Law", "Displacement Current", "Electromagnetic Induction", "EMF", "Continuity Equation", "Time-Varying Fields", "Motional EMF"],
    color: "red",
  },
  {
    id: "ch7",
    number: 7,
    title: "Electromagnetic Wave Propagation",
    summary: "Wave propagation in various media including free space, lossy dielectrics, and conductors. Covers wave equations, skin depth, and Poynting vector.",
    keyEquations: [
      { latex: "\\nabla^2 \\mathbf{E} - \\mu\\varepsilon\\frac{\\partial^2 \\mathbf{E}}{\\partial t^2} = 0", description: "Wave equation" },
      { latex: "u = \\frac{1}{\\sqrt{\\mu\\varepsilon}} = \\frac{c}{\\sqrt{\\mu_r\\varepsilon_r}}", description: "Phase velocity" },
      { latex: "\\delta = \\frac{1}{\\sqrt{\\pi f \\mu \\sigma}}", description: "Skin depth" },
      { latex: "\\eta = \\sqrt{\\frac{\\mu}{\\varepsilon}}", description: "Intrinsic impedance" },
      { latex: "\\mathbf{P} = \\mathbf{E} \\times \\mathbf{H}", description: "Poynting vector (instantaneous)" },
      { latex: "\\mathbf{P}_{ave} = \\frac{1}{2}\\text{Re}(\\mathbf{E}_s \\times \\mathbf{H}_s^*)", description: "Time-average Poynting vector" },
    ],
    terms: ["Wave Equation", "Phase Velocity", "Skin Depth", "Intrinsic Impedance", "Poynting Vector", "Plane Wave", "Attenuation Constant", "Phase Constant", "Propagation Constant"],
    color: "yellow",
  },
  {
    id: "ch8",
    number: 8,
    title: "Transmission Lines",
    summary: "Analysis of transmission lines using distributed circuit theory. Covers characteristic impedance, reflection coefficient, VSWR, and Smith chart.",
    keyEquations: [
      { latex: "Z_0 = \\sqrt{\\frac{R+j\\omega L}{G+j\\omega C}}", description: "Characteristic impedance (general)" },
      { latex: "Z_0 = \\sqrt{\\frac{L}{C}}", description: "Characteristic impedance (lossless)" },
      { latex: "\\Gamma_L = \\frac{Z_L - Z_0}{Z_L + Z_0}", description: "Reflection coefficient at load" },
      { latex: "VSWR = \\frac{1+|\\Gamma|}{1-|\\Gamma|}", description: "Voltage Standing Wave Ratio" },
      { latex: "Z_{in} = Z_0\\frac{Z_L + jZ_0\\tan(\\beta l)}{Z_0 + jZ_L\\tan(\\beta l)}", description: "Input impedance" },
      { latex: "\\lambda = \\frac{2\\pi}{\\beta} = \\frac{u}{f}", description: "Wavelength" },
    ],
    terms: ["Transmission Line", "Characteristic Impedance", "Reflection Coefficient", "VSWR", "Standing Wave", "Matched Load", "Input Impedance", "Smith Chart"],
    color: "pink",
  },
];

export const SOLVER_PROBLEMS: SolverProblem[] = [
  {
    id: "coulombs-law",
    name: "Coulomb's Law — Force Between Point Charges",
    category: "Electrostatics",
    formulaId: "coulombs-law",
    inputs: [
      { key: "Q1", label: "Charge Q₁", unit: "C", placeholder: "e.g. 1e-9" },
      { key: "Q2", label: "Charge Q₂", unit: "C", placeholder: "e.g. -2e-9" },
      { key: "r", label: "Separation distance r", unit: "m", placeholder: "e.g. 0.05" },
      { key: "er", label: "Relative permittivity εᵣ (1 for free space)", unit: "", placeholder: "e.g. 1" },
    ],
    outputs: [
      { key: "F", label: "Force F", unit: "N" },
    ],
    solve: ({ Q1, Q2, r, er }) => {
      const eps = (er || 1) * CONSTANTS.epsilon0.value;
      const F = (Q1 * Q2) / (4 * Math.PI * eps * r * r);
      return { F };
    },
    latexTemplate: "\\mathbf{F} = \\frac{Q_1 Q_2}{4\\pi\\varepsilon_0 \\varepsilon_r R^2}\\hat{a}_R",
    steps: ({ Q1, Q2, r, er }, { F }) => {
      const eps = (er || 1) * CONSTANTS.epsilon0.value;
      return [
        `\\text{Given: } Q_1 = ${Q1}\\text{ C}, \\quad Q_2 = ${Q2}\\text{ C}, \\quad r = ${r}\\text{ m}, \\quad \\varepsilon_r = ${er || 1}`,
        `\\varepsilon = \\varepsilon_0 \\varepsilon_r = ${CONSTANTS.epsilon0.value.toExponential(3)} \\times ${er || 1} = ${eps.toExponential(3)}\\text{ F/m}`,
        `F = \\frac{Q_1 Q_2}{4\\pi\\varepsilon r^2} = \\frac{(${Q1})(${Q2})}{4\\pi(${eps.toExponential(3)})(${r})^2}`,
        `\\boxed{F = ${F.toExponential(4)}\\text{ N}}`,
      ];
    },
  },
  {
    id: "electric-field-point",
    name: "Electric Field of a Point Charge",
    category: "Electrostatics",
    formulaId: "e-point-charge",
    inputs: [
      { key: "Q", label: "Charge Q", unit: "C", placeholder: "e.g. 5e-9" },
      { key: "r", label: "Distance r", unit: "m", placeholder: "e.g. 0.1" },
      { key: "er", label: "Relative permittivity εᵣ", unit: "", placeholder: "e.g. 1" },
    ],
    outputs: [
      { key: "E", label: "Electric Field |E|", unit: "V/m" },
    ],
    solve: ({ Q, r, er }) => {
      const eps = (er || 1) * CONSTANTS.epsilon0.value;
      const E = Q / (4 * Math.PI * eps * r * r);
      return { E };
    },
    latexTemplate: "\\mathbf{E} = \\frac{Q}{4\\pi\\varepsilon_0 \\varepsilon_r r^2}\\hat{a}_r",
    steps: ({ Q, r, er }, { E }) => {
      const eps = (er || 1) * CONSTANTS.epsilon0.value;
      return [
        `\\text{Given: } Q = ${Q}\\text{ C}, \\quad r = ${r}\\text{ m}, \\quad \\varepsilon_r = ${er || 1}`,
        `\\varepsilon = \\varepsilon_0 \\varepsilon_r = ${eps.toExponential(3)}\\text{ F/m}`,
        `E = \\frac{Q}{4\\pi\\varepsilon r^2} = \\frac{${Q}}{4\\pi(${eps.toExponential(3)})(${r})^2}`,
        `\\boxed{E = ${E.toExponential(4)}\\text{ V/m}}`,
      ];
    },
  },
  {
    id: "gauss-law-sphere",
    name: "Gauss's Law — Spherical Charge Distribution",
    category: "Electrostatics",
    formulaId: "gauss-law",
    inputs: [
      { key: "Q", label: "Enclosed Charge Q_enc", unit: "C", placeholder: "e.g. 1e-9" },
      { key: "r", label: "Gaussian surface radius r", unit: "m", placeholder: "e.g. 0.05" },
      { key: "er", label: "Relative permittivity εᵣ", unit: "", placeholder: "e.g. 1" },
    ],
    outputs: [
      { key: "D", label: "Electric Flux Density |D|", unit: "C/m²" },
      { key: "E", label: "Electric Field |E|", unit: "V/m" },
    ],
    solve: ({ Q, r, er }) => {
      const D = Q / (4 * Math.PI * r * r);
      const E = D / ((er || 1) * CONSTANTS.epsilon0.value);
      return { D, E };
    },
    latexTemplate: "D = \\frac{Q_{enc}}{4\\pi r^2}, \\quad E = \\frac{D}{\\varepsilon_0 \\varepsilon_r}",
    steps: ({ Q, r, er }, { D, E }) => [
      `\\text{Apply Gauss's law on a spherical surface of radius } r = ${r}\\text{ m}`,
      `\\oint_S \\mathbf{D} \\cdot d\\mathbf{S} = Q_{enc}`,
      `D \\cdot 4\\pi r^2 = Q_{enc} \\Rightarrow D = \\frac{Q_{enc}}{4\\pi r^2} = \\frac{${Q}}{4\\pi(${r})^2}`,
      `\\boxed{D = ${D.toExponential(4)}\\text{ C/m}^2}`,
      `E = \\frac{D}{\\varepsilon_0\\varepsilon_r} = \\frac{${D.toExponential(4)}}{${((er || 1) * CONSTANTS.epsilon0.value).toExponential(3)}}`,
      `\\boxed{E = ${E.toExponential(4)}\\text{ V/m}}`,
    ],
  },
  {
    id: "ampere-infinite-line",
    name: "Ampere's Law — Infinite Line Current",
    category: "Magnetostatics",
    formulaId: "ampere-line",
    inputs: [
      { key: "I", label: "Current I", unit: "A", placeholder: "e.g. 10" },
      { key: "rho", label: "Radial distance ρ", unit: "m", placeholder: "e.g. 0.05" },
    ],
    outputs: [
      { key: "H", label: "Magnetic Field |H|", unit: "A/m" },
      { key: "B", label: "Magnetic Flux Density |B|", unit: "T" },
    ],
    solve: ({ I, rho }) => {
      const H = I / (2 * Math.PI * rho);
      const B = CONSTANTS.mu0.value * H;
      return { H, B };
    },
    latexTemplate: "H = \\frac{I}{2\\pi\\rho}",
    steps: ({ I, rho }, { H, B }) => [
      `\\text{Apply Ampere's law with a circular Amperian path of radius } \\rho = ${rho}\\text{ m}`,
      `\\oint_L \\mathbf{H} \\cdot d\\mathbf{l} = I_{enc}`,
      `H \\cdot 2\\pi\\rho = I \\Rightarrow H = \\frac{I}{2\\pi\\rho} = \\frac{${I}}{2\\pi(${rho})}`,
      `\\boxed{H = ${H.toExponential(4)}\\text{ A/m}}`,
      `B = \\mu_0 H = (4\\pi \\times 10^{-7})(${H.toExponential(4)})`,
      `\\boxed{B = ${B.toExponential(4)}\\text{ T}}`,
    ],
  },
  {
    id: "ampere-toroid",
    name: "Ampere's Law — Toroid",
    category: "Magnetostatics",
    formulaId: "ampere-toroid",
    inputs: [
      { key: "N", label: "Number of turns N", unit: "", placeholder: "e.g. 200" },
      { key: "I", label: "Current I", unit: "A", placeholder: "e.g. 2" },
      { key: "rho", label: "Mean radius ρ₀", unit: "m", placeholder: "e.g. 0.1" },
    ],
    outputs: [
      { key: "H", label: "Magnetic Field inside |H|", unit: "A/m" },
      { key: "B", label: "Magnetic Flux Density |B|", unit: "T" },
    ],
    solve: ({ N, I, rho }) => {
      const H = (N * I) / (2 * Math.PI * rho);
      const B = CONSTANTS.mu0.value * H;
      return { H, B };
    },
    latexTemplate: "H = \\frac{NI}{2\\pi\\rho_0}",
    steps: ({ N, I, rho }, { H, B }) => [
      `\\text{For a toroid with } N = ${N}\\text{ turns, } I = ${I}\\text{ A, mean radius } \\rho_0 = ${rho}\\text{ m}`,
      `\\oint_L \\mathbf{H} \\cdot d\\mathbf{l} = NI_{enc}`,
      `H \\cdot 2\\pi\\rho_0 = NI \\Rightarrow H = \\frac{NI}{2\\pi\\rho_0} = \\frac{(${N})(${I})}{2\\pi(${rho})}`,
      `\\boxed{H = ${H.toExponential(4)}\\text{ A/m}}`,
      `B = \\mu_0 H = ${B.toExponential(4)}\\text{ T}`,
    ],
  },
  {
    id: "capacitance-parallel",
    name: "Capacitance — Parallel Plate",
    category: "Materials",
    formulaId: "cap-parallel",
    inputs: [
      { key: "er", label: "Relative permittivity εᵣ", unit: "", placeholder: "e.g. 2.25" },
      { key: "A", label: "Plate area A", unit: "m²", placeholder: "e.g. 0.01" },
      { key: "d", label: "Separation d", unit: "m", placeholder: "e.g. 0.001" },
    ],
    outputs: [
      { key: "C", label: "Capacitance C", unit: "F" },
    ],
    solve: ({ er, A, d }) => {
      const C = (er || 1) * CONSTANTS.epsilon0.value * A / d;
      return { C };
    },
    latexTemplate: "C = \\frac{\\varepsilon_0 \\varepsilon_r A}{d}",
    steps: ({ er, A, d }, { C }) => [
      `\\text{Parallel plate capacitor: } \\varepsilon_r = ${er}, \\; A = ${A}\\text{ m}^2, \\; d = ${d}\\text{ m}`,
      `C = \\frac{\\varepsilon_0 \\varepsilon_r A}{d} = \\frac{(${CONSTANTS.epsilon0.value.toExponential(3)})(${er})(${A})}{${d}}`,
      `\\boxed{C = ${C.toExponential(4)}\\text{ F} = ${(C * 1e12).toFixed(4)}\\text{ pF}}`,
    ],
  },
  {
    id: "energy-density-e",
    name: "Electrostatic Energy Density",
    category: "Energy",
    formulaId: "energy-e",
    inputs: [
      { key: "E", label: "Electric field magnitude |E|", unit: "V/m", placeholder: "e.g. 1000" },
      { key: "er", label: "Relative permittivity εᵣ", unit: "", placeholder: "e.g. 1" },
    ],
    outputs: [
      { key: "we", label: "Energy density wₑ", unit: "J/m³" },
    ],
    solve: ({ E, er }) => {
      const we = 0.5 * (er || 1) * CONSTANTS.epsilon0.value * E * E;
      return { we };
    },
    latexTemplate: "w_E = \\frac{1}{2}\\varepsilon_0\\varepsilon_r E^2",
    steps: ({ E, er }, { we }) => [
      `\\text{Given: } E = ${E}\\text{ V/m}, \\quad \\varepsilon_r = ${er || 1}`,
      `\\varepsilon = \\varepsilon_0 \\varepsilon_r = ${((er || 1) * CONSTANTS.epsilon0.value).toExponential(3)}\\text{ F/m}`,
      `w_E = \\frac{1}{2}\\varepsilon E^2 = \\frac{1}{2}(${((er || 1) * CONSTANTS.epsilon0.value).toExponential(3)})(${E})^2`,
      `\\boxed{w_E = ${we.toExponential(4)}\\text{ J/m}^3}`,
    ],
  },
  {
    id: "energy-density-h",
    name: "Magnetostatic Energy Density",
    category: "Energy",
    formulaId: "energy-h",
    inputs: [
      { key: "H", label: "Magnetic field magnitude |H|", unit: "A/m", placeholder: "e.g. 500" },
      { key: "mur", label: "Relative permeability μᵣ", unit: "", placeholder: "e.g. 1" },
    ],
    outputs: [
      { key: "wm", label: "Energy density wₘ", unit: "J/m³" },
    ],
    solve: ({ H, mur }) => {
      const wm = 0.5 * (mur || 1) * CONSTANTS.mu0.value * H * H;
      return { wm };
    },
    latexTemplate: "w_m = \\frac{1}{2}\\mu_0\\mu_r H^2",
    steps: ({ H, mur }, { wm }) => [
      `\\text{Given: } H = ${H}\\text{ A/m}, \\quad \\mu_r = ${mur || 1}`,
      `\\mu = \\mu_0 \\mu_r = ${((mur || 1) * CONSTANTS.mu0.value).toExponential(4)}\\text{ H/m}`,
      `w_m = \\frac{1}{2}\\mu H^2 = \\frac{1}{2}(${((mur || 1) * CONSTANTS.mu0.value).toExponential(4)})(${H})^2`,
      `\\boxed{w_m = ${wm.toExponential(4)}\\text{ J/m}^3}`,
    ],
  },
  {
    id: "skin-depth",
    name: "Skin Depth in Conductor",
    category: "Wave Propagation",
    formulaId: "skin-depth",
    inputs: [
      { key: "f", label: "Frequency f", unit: "Hz", placeholder: "e.g. 1e9" },
      { key: "sigma", label: "Conductivity σ", unit: "S/m", placeholder: "e.g. 5.8e7" },
      { key: "mur", label: "Relative permeability μᵣ", unit: "", placeholder: "e.g. 1" },
    ],
    outputs: [
      { key: "delta", label: "Skin depth δ", unit: "m" },
    ],
    solve: ({ f, sigma, mur }) => {
      const mu = (mur || 1) * CONSTANTS.mu0.value;
      const delta = 1 / Math.sqrt(Math.PI * f * mu * sigma);
      return { delta };
    },
    latexTemplate: "\\delta = \\frac{1}{\\sqrt{\\pi f \\mu \\sigma}}",
    steps: ({ f, sigma, mur }, { delta }) => {
      const mu = (mur || 1) * CONSTANTS.mu0.value;
      return [
        `\\text{Given: } f = ${f}\\text{ Hz}, \\quad \\sigma = ${sigma}\\text{ S/m}, \\quad \\mu_r = ${mur || 1}`,
        `\\mu = \\mu_0\\mu_r = (4\\pi \\times 10^{-7})(${mur || 1}) = ${mu.toExponential(4)}\\text{ H/m}`,
        `\\delta = \\frac{1}{\\sqrt{\\pi f \\mu \\sigma}} = \\frac{1}{\\sqrt{\\pi \\cdot ${f} \\cdot ${mu.toExponential(4)} \\cdot ${sigma}}}`,
        `\\boxed{\\delta = ${delta.toExponential(4)}\\text{ m} = ${(delta * 1000).toExponential(4)}\\text{ mm}}`,
      ];
    },
  },
  {
    id: "phase-velocity",
    name: "Phase Velocity in Medium",
    category: "Wave Propagation",
    formulaId: "phase-vel",
    inputs: [
      { key: "er", label: "Relative permittivity εᵣ", unit: "", placeholder: "e.g. 2.25" },
      { key: "mur", label: "Relative permeability μᵣ", unit: "", placeholder: "e.g. 1" },
    ],
    outputs: [
      { key: "u", label: "Phase velocity u", unit: "m/s" },
      { key: "eta", label: "Intrinsic impedance η", unit: "Ω" },
    ],
    solve: ({ er, mur }) => {
      const u = CONSTANTS.c.value / Math.sqrt((er || 1) * (mur || 1));
      const eta = CONSTANTS.eta0.value * Math.sqrt((mur || 1) / (er || 1));
      return { u, eta };
    },
    latexTemplate: "u = \\frac{c}{\\sqrt{\\mu_r\\varepsilon_r}}, \\quad \\eta = \\eta_0\\sqrt{\\frac{\\mu_r}{\\varepsilon_r}}",
    steps: ({ er, mur }, { u, eta }) => [
      `\\text{Given: } \\varepsilon_r = ${er || 1}, \\quad \\mu_r = ${mur || 1}`,
      `u = \\frac{c}{\\sqrt{\\mu_r\\varepsilon_r}} = \\frac{3 \\times 10^8}{\\sqrt{(${mur || 1})(${er || 1})}}`,
      `\\boxed{u = ${u.toExponential(4)}\\text{ m/s}}`,
      `\\eta = \\eta_0\\sqrt{\\frac{\\mu_r}{\\varepsilon_r}} = 376.73\\sqrt{\\frac{${mur || 1}}{${er || 1}}}`,
      `\\boxed{\\eta = ${eta.toFixed(4)}\\text{ }\\Omega}`,
    ],
  },
  {
    id: "vswr",
    name: "VSWR and Reflection Coefficient",
    category: "Transmission Lines",
    formulaId: "vswr",
    inputs: [
      { key: "ZL_r", label: "Load impedance ZL (real part)", unit: "Ω", placeholder: "e.g. 75" },
      { key: "ZL_i", label: "Load impedance ZL (imaginary part)", unit: "Ω", placeholder: "e.g. 0" },
      { key: "Z0", label: "Characteristic impedance Z₀", unit: "Ω", placeholder: "e.g. 50" },
    ],
    outputs: [
      { key: "Gamma", label: "|Γ| Reflection coefficient", unit: "" },
      { key: "VSWR", label: "VSWR", unit: "" },
    ],
    solve: ({ ZL_r, ZL_i, Z0 }) => {
      const ZL_r_diff = ZL_r - Z0;
      const ZL_r_sum = ZL_r + Z0;
      const Gamma = Math.sqrt((ZL_r_diff * ZL_r_diff + ZL_i * ZL_i) / (ZL_r_sum * ZL_r_sum + ZL_i * ZL_i));
      const VSWR = (1 + Gamma) / (1 - Gamma);
      return { Gamma, VSWR };
    },
    latexTemplate: "\\Gamma_L = \\frac{Z_L - Z_0}{Z_L + Z_0}, \\quad VSWR = \\frac{1+|\\Gamma|}{1-|\\Gamma|}",
    steps: ({ ZL_r, ZL_i, Z0 }, { Gamma, VSWR }) => [
      `\\text{Given: } Z_L = (${ZL_r} + j${ZL_i})\\text{ }\\Omega, \\quad Z_0 = ${Z0}\\text{ }\\Omega`,
      `\\Gamma_L = \\frac{Z_L - Z_0}{Z_L + Z_0} = \\frac{(${ZL_r - Z0} + j${ZL_i})}{(${ZL_r + Z0} + j${ZL_i})}`,
      `|\\Gamma_L| = ${Gamma.toFixed(6)}`,
      `\\boxed{|\\Gamma_L| = ${Gamma.toFixed(4)}}`,
      `VSWR = \\frac{1 + |\\Gamma|}{1 - |\\Gamma|} = \\frac{1 + ${Gamma.toFixed(4)}}{1 - ${Gamma.toFixed(4)}}`,
      `\\boxed{VSWR = ${VSWR.toFixed(4)}}`,
    ],
  },
  {
    id: "lorentz-force",
    name: "Lorentz Force on Moving Charge",
    category: "Magnetic Forces",
    formulaId: "lorentz",
    inputs: [
      { key: "Q", label: "Charge Q", unit: "C", placeholder: "e.g. 1.6e-19" },
      { key: "vx", label: "Velocity vx", unit: "m/s", placeholder: "e.g. 1e6" },
      { key: "vy", label: "Velocity vy", unit: "m/s", placeholder: "e.g. 0" },
      { key: "Bz", label: "Magnetic field Bz", unit: "T", placeholder: "e.g. 0.5" },
    ],
    outputs: [
      { key: "Fx", label: "Force Fx", unit: "N" },
      { key: "Fy", label: "Force Fy", unit: "N" },
      { key: "Fmag", label: "|F|", unit: "N" },
    ],
    solve: ({ Q, vx, vy, Bz }) => {
      const Fx = Q * (vy * Bz);
      const Fy = Q * (-vx * Bz);
      const Fmag = Math.sqrt(Fx * Fx + Fy * Fy);
      return { Fx, Fy, Fmag };
    },
    latexTemplate: "\\mathbf{F} = Q(\\mathbf{u} \\times \\mathbf{B})",
    steps: ({ Q, vx, vy, Bz }, { Fx, Fy, Fmag }) => [
      `\\text{Given: } Q = ${Q}\\text{ C}, \\quad \\mathbf{u} = (${vx}\\hat{a}_x + ${vy}\\hat{a}_y)\\text{ m/s}, \\quad \\mathbf{B} = ${Bz}\\hat{a}_z\\text{ T}`,
      `\\mathbf{F} = Q(\\mathbf{u} \\times \\mathbf{B}) = Q[(${vx}\\hat{a}_x + ${vy}\\hat{a}_y) \\times ${Bz}\\hat{a}_z]`,
      `\\hat{a}_x \\times \\hat{a}_z = -\\hat{a}_y, \\quad \\hat{a}_y \\times \\hat{a}_z = \\hat{a}_x`,
      `F_x = Q \\cdot v_y \\cdot B_z = (${Q})(${vy})(${Bz}) = ${Fx.toExponential(4)}\\text{ N}`,
      `F_y = -Q \\cdot v_x \\cdot B_z = -(${Q})(${vx})(${Bz}) = ${Fy.toExponential(4)}\\text{ N}`,
      `\\boxed{|\\mathbf{F}| = ${Fmag.toExponential(4)}\\text{ N}}`,
    ],
  },
];

export const FLASHCARDS = [
  { term: "Coulomb's Law", definition: "The force between two point charges is proportional to the product of the charges and inversely proportional to the square of the distance between them.", formula: "\\mathbf{F} = \\frac{Q_1 Q_2}{4\\pi\\varepsilon_0 R^2}\\hat{a}_R", chapter: "ch2" },
  { term: "Gauss's Law", definition: "The total electric flux out of any closed surface equals the net charge enclosed divided by the permittivity of free space.", formula: "\\oint_S \\mathbf{D} \\cdot d\\mathbf{S} = Q_{enc}", chapter: "ch2" },
  { term: "Divergence Theorem", definition: "The surface integral of a vector field over a closed surface equals the volume integral of the divergence of that field over the enclosed volume.", formula: "\\oint_S \\mathbf{A} \\cdot d\\mathbf{S} = \\int_V (\\nabla \\cdot \\mathbf{A})\\,dV", chapter: "ch1" },
  { term: "Stokes's Theorem", definition: "The line integral of a vector field around a closed path equals the surface integral of the curl of that field over any surface bounded by the path.", formula: "\\oint_L \\mathbf{A} \\cdot d\\mathbf{l} = \\int_S (\\nabla \\times \\mathbf{A}) \\cdot d\\mathbf{S}", chapter: "ch1" },
  { term: "Ampere's Circuit Law", definition: "The line integral of the magnetic field intensity around a closed loop equals the net current enclosed by that loop.", formula: "\\oint_L \\mathbf{H} \\cdot d\\mathbf{l} = I_{enc}", chapter: "ch4" },
  { term: "Biot-Savart Law", definition: "The differential magnetic field intensity produced by a differential current element.", formula: "d\\mathbf{H} = \\frac{I\\,d\\mathbf{l} \\times \\hat{a}_R}{4\\pi R^2}", chapter: "ch4" },
  { term: "Faraday's Law", definition: "A time-varying magnetic field induces an EMF (and hence an electric field) in any loop threading that field.", formula: "V_{emf} = -\\frac{d\\Phi_B}{dt}", chapter: "ch6" },
  { term: "Lorentz Force Equation", definition: "The total electromagnetic force on a moving charge in combined electric and magnetic fields.", formula: "\\mathbf{F} = Q(\\mathbf{E} + \\mathbf{u} \\times \\mathbf{B})", chapter: "ch5" },
  { term: "Maxwell's 1st Equation", definition: "Gauss's law in point (differential) form — relates divergence of D to volume charge density.", formula: "\\nabla \\cdot \\mathbf{D} = \\rho_v", chapter: "ch6" },
  { term: "Maxwell's 2nd Equation", definition: "Gauss's law for magnetic fields — magnetic monopoles do not exist.", formula: "\\nabla \\cdot \\mathbf{B} = 0", chapter: "ch6" },
  { term: "Maxwell's 3rd Equation", definition: "Faraday's law in point form — a time-varying B field creates a curl in E.", formula: "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}", chapter: "ch6" },
  { term: "Maxwell's 4th Equation", definition: "Ampere-Maxwell law — both conduction current and displacement current are sources of magnetic field.", formula: "\\nabla \\times \\mathbf{H} = \\mathbf{J} + \\frac{\\partial \\mathbf{D}}{\\partial t}", chapter: "ch6" },
  { term: "Skin Depth", definition: "The depth at which the amplitude of an electromagnetic wave decays to 1/e of its surface value in a conductor.", formula: "\\delta = \\frac{1}{\\sqrt{\\pi f \\mu \\sigma}}", chapter: "ch7" },
  { term: "Poynting Vector", definition: "Represents the instantaneous power flow (energy flux) of an electromagnetic wave per unit area.", formula: "\\mathbf{P} = \\mathbf{E} \\times \\mathbf{H}", chapter: "ch7" },
  { term: "VSWR", definition: "Voltage Standing Wave Ratio — ratio of maximum to minimum voltage amplitude on a transmission line. VSWR=1 means perfect match.", formula: "VSWR = \\frac{1+|\\Gamma|}{1-|\\Gamma|}", chapter: "ch8" },
  { term: "Reflection Coefficient", definition: "Ratio of reflected wave amplitude to incident wave amplitude at a load. Zero for matched load, 1 for open/short circuit.", formula: "\\Gamma_L = \\frac{Z_L - Z_0}{Z_L + Z_0}", chapter: "ch8" },
  { term: "Boundary Condition (E)", definition: "The tangential component of E is continuous across any boundary between two media.", formula: "E_{t1} = E_{t2}", chapter: "ch3" },
  { term: "Boundary Condition (D)", definition: "The normal component of D is discontinuous by the surface charge density at the boundary.", formula: "D_{n1} - D_{n2} = \\rho_S", chapter: "ch3" },
  { term: "Boundary Condition (B)", definition: "The normal component of B is always continuous across any interface.", formula: "B_{n1} = B_{n2}", chapter: "ch5" },
  { term: "Displacement Current Density", definition: "Time-varying electric fields produce a displacement current density analogous to conduction current, completing Ampere's law.", formula: "\\mathbf{J}_d = \\varepsilon\\frac{\\partial \\mathbf{E}}{\\partial t}", chapter: "ch6" },
];

export const QUIZ_QUESTIONS = [
  {
    chapter: "ch1",
    question: "The Divergence Theorem relates which two quantities?",
    options: [
      "A line integral and a surface integral",
      "A surface integral and a volume integral",
      "A volume integral and a scalar field",
      "Two line integrals over different paths",
    ],
    correct: 1,
    explanation: "The Divergence Theorem (Gauss's theorem) states that the flux (surface integral) of a vector field out of a closed surface equals the volume integral of its divergence: ∮A·dS = ∫∇·A dV.",
  },
  {
    chapter: "ch1",
    question: "The curl of the gradient of any scalar field is:",
    options: ["Always a unit vector", "Always zero", "Equal to the Laplacian", "Undefined"],
    correct: 1,
    explanation: "∇×(∇V) = 0 always. This is a fundamental vector identity. It means conservative fields (derived from a potential) have zero curl.",
  },
  {
    chapter: "ch2",
    question: "If the distance between two point charges is doubled while keeping charges constant, the Coulomb force becomes:",
    options: ["Four times larger", "Twice as large", "One-half as large", "One-quarter as large"],
    correct: 3,
    explanation: "Coulomb's law: F = kQ₁Q₂/r². If r → 2r, then F → kQ₁Q₂/(2r)² = F/4. The force decreases by a factor of four.",
  },
  {
    chapter: "ch2",
    question: "Gauss's law is most useful when:",
    options: [
      "Charges have arbitrary distributions",
      "The charge distribution has symmetry (spherical, cylindrical, planar)",
      "Only point charges are present",
      "The medium is not free space",
    ],
    correct: 1,
    explanation: "Gauss's law is always true, but it can be solved analytically only when the geometry has sufficient symmetry (spherical, cylindrical, or planar) to allow H or D to be taken outside the integral.",
  },
  {
    chapter: "ch3",
    question: "At a dielectric-dielectric interface with no free surface charge, which statement is correct?",
    options: [
      "Both tangential E and normal D are continuous",
      "Tangential E is continuous; normal D is continuous",
      "Tangential E is continuous; tangential D is discontinuous",
      "Normal E is continuous; tangential D is discontinuous",
    ],
    correct: 2,
    explanation: "At a charge-free dielectric-dielectric boundary: Eₜ₁ = Eₜ₂ (tangential E is continuous) but D_t1/ε₁ = D_t2/ε₂ so Dₜ is discontinuous. Meanwhile Dₙ is continuous (Dₙ₁ = Dₙ₂) but Eₙ is discontinuous.",
  },
  {
    chapter: "ch4",
    question: "Ampere's circuit law in point (differential) form is:",
    options: [
      "∇·H = J",
      "∇×H = J",
      "∇·B = 0",
      "∇×B = μ₀J",
    ],
    correct: 1,
    explanation: "Applying Stokes's theorem to Ampere's circuit law ∮H·dl = I_enc = ∫J·dS gives the point form: ∇×H = J. This is Maxwell's 3rd equation for magnetostatics.",
  },
  {
    chapter: "ch4",
    question: "For an infinitely long coaxial line, in the region between the inner (radius a) and outer (radius b) conductors:",
    options: [
      "H = Iρ/(2πa²)",
      "H = I/(2πρ)",
      "H = 0",
      "H = NI/(2πρ)",
    ],
    correct: 1,
    explanation: "For a < ρ < b, the full current I is enclosed by the Amperian path, giving H·2πρ = I, so H = I/(2πρ). Same as for an infinite line current.",
  },
  {
    chapter: "ch5",
    question: "The Lorentz force on a positive charge moving in the +x direction through a +z magnetic field points in the:",
    options: ["+z direction", "+y direction", "-y direction", "+x direction"],
    correct: 2,
    explanation: "F = Q(u×B) = Q(uₓ â_x × Bz â_z) = Q·uₓ·Bz (â_x × â_z) = Q·uₓ·Bz(-â_y). So the force is in the -y direction.",
  },
  {
    chapter: "ch6",
    question: "Faraday's law (∇×E = -∂B/∂t) implies that:",
    options: [
      "Static electric fields can have nonzero curl",
      "A time-changing magnetic field produces an electric field",
      "Electric and magnetic fields are always in phase",
      "The divergence of E equals -∂ρ/∂t",
    ],
    correct: 1,
    explanation: "Faraday's law shows that a time-varying B field (∂B/∂t ≠ 0) produces a curl in E, meaning it induces a circulating electric field. This is the principle behind electric generators and transformers.",
  },
  {
    chapter: "ch7",
    question: "Skin depth in a good conductor is proportional to:",
    options: ["√f", "1/√f", "f", "1/f"],
    correct: 1,
    explanation: "δ = 1/√(πfμσ). As frequency increases, the skin depth decreases as 1/√f — higher frequency currents are confined to a thinner surface layer of the conductor.",
  },
  {
    chapter: "ch8",
    question: "A transmission line is perfectly matched when:",
    options: [
      "ZL = 0 (short circuit)",
      "ZL = ∞ (open circuit)",
      "ZL = Z₀",
      "|Γ| = 1",
    ],
    correct: 2,
    explanation: "When ZL = Z₀, Γ = (ZL-Z₀)/(ZL+Z₀) = 0. No reflection occurs, all power is delivered to the load, and VSWR = 1. This is the ideal matched condition.",
  },
  {
    chapter: "ch8",
    question: "The VSWR for a short-circuit termination is:",
    options: ["0", "1", "∞", "0.5"],
    correct: 2,
    explanation: "For a short circuit ZL = 0, Γ = (0-Z₀)/(0+Z₀) = -1, so |Γ| = 1. Then VSWR = (1+1)/(1-1) = ∞. A perfect standing wave exists with a zero-voltage node at the termination.",
  },
];
