import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, ChevronDown, ChevronRight, Calculator, BookOpen, CheckCircle, Lightbulb } from "lucide-react";
import KatexRenderer from "@/components/KatexRenderer";

interface WorksheetProblem {
  number: string;
  statement: string;
  latex?: string;
  solution?: string;
  solutionLatex?: string[];
  solverId?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

interface Worksheet {
  id: string;
  number: number;
  title: string;
  chapter: string;
  chapterColor: string;
  problems: WorksheetProblem[];
}

const WORKSHEETS: Worksheet[] = [
  {
    id: "ws1",
    number: 1,
    title: "Vector Algebra & Coordinate Systems",
    chapter: "Chapter 1",
    chapterColor: "blue",
    problems: [
      {
        number: "1.1",
        statement: "Find the dot product and the angle between vectors A = 3a_x + 2a_y − a_z and B = a_x − 4a_y + 2a_z.",
        latex: "\\mathbf{A} = 3\\hat{a}_x + 2\\hat{a}_y - \\hat{a}_z, \\quad \\mathbf{B} = \\hat{a}_x - 4\\hat{a}_y + 2\\hat{a}_z",
        solutionLatex: [
          "\\mathbf{A} \\cdot \\mathbf{B} = (3)(1) + (2)(-4) + (-1)(2) = 3 - 8 - 2 = -7",
          "|\\mathbf{A}| = \\sqrt{9+4+1} = \\sqrt{14}, \\quad |\\mathbf{B}| = \\sqrt{1+16+4} = \\sqrt{21}",
          "\\theta_{AB} = \\cos^{-1}\\!\\left(\\frac{-7}{\\sqrt{14}\\sqrt{21}}\\right) = \\cos^{-1}(-0.408) \\approx 114.1°",
        ],
        difficulty: "easy",
        tags: ["dot product", "vector magnitude", "angle"],
      },
      {
        number: "1.2",
        statement: "Find the cross product A × B for A = 2a_x − 3a_z and B = a_y + 4a_z.",
        latex: "\\mathbf{A} \\times \\mathbf{B} = \\begin{vmatrix}\\hat{a}_x & \\hat{a}_y & \\hat{a}_z \\\\ 2 & 0 & -3 \\\\ 0 & 1 & 4\\end{vmatrix}",
        solutionLatex: [
          "\\mathbf{A}\\times\\mathbf{B} = (0\\cdot4-(-3)\\cdot1)\\hat{a}_x - (2\\cdot4-(-3)\\cdot0)\\hat{a}_y + (2\\cdot1-0\\cdot0)\\hat{a}_z",
          "= 3\\hat{a}_x - 8\\hat{a}_y + 2\\hat{a}_z",
        ],
        difficulty: "easy",
        tags: ["cross product", "determinant"],
      },
      {
        number: "1.3",
        statement: "Convert the point P(3, 4, −2) from Cartesian to cylindrical and spherical coordinates.",
        latex: "P(x,y,z) = P(3,4,-2) \\xrightarrow{?} P(\\rho,\\phi,z) \\text{ and } P(r,\\theta,\\phi)",
        solutionLatex: [
          "\\rho = \\sqrt{x^2+y^2} = \\sqrt{9+16} = 5",
          "\\phi = \\tan^{-1}(y/x) = \\tan^{-1}(4/3) = 53.13°",
          "\\text{Cylindrical: } P(5,\\, 53.13°,\\, -2)",
          "r = \\sqrt{x^2+y^2+z^2} = \\sqrt{9+16+4} = \\sqrt{29} \\approx 5.385",
          "\\theta = \\cos^{-1}(z/r) = \\cos^{-1}(-2/5.385) = 111.8°",
          "\\text{Spherical: } P(5.385,\\, 111.8°,\\, 53.13°)",
        ],
        difficulty: "medium",
        tags: ["coordinate transformation", "cylindrical", "spherical"],
      },
      {
        number: "1.4",
        statement: "Evaluate the gradient of the scalar field T = x²y + xyz at point P(1, 2, 3).",
        latex: "T = x^2y + xyz, \\quad \\nabla T = ?",
        solutionLatex: [
          "\\nabla T = \\frac{\\partial T}{\\partial x}\\hat{a}_x + \\frac{\\partial T}{\\partial y}\\hat{a}_y + \\frac{\\partial T}{\\partial z}\\hat{a}_z",
          "= (2xy+yz)\\hat{a}_x + (x^2+xz)\\hat{a}_y + xy\\hat{a}_z",
          "\\text{At }P(1,2,3): \\nabla T = (4+6)\\hat{a}_x + (1+3)\\hat{a}_y + 2\\hat{a}_z = 10\\hat{a}_x + 4\\hat{a}_y + 2\\hat{a}_z",
        ],
        difficulty: "medium",
        tags: ["gradient", "partial derivatives"],
      },
    ],
  },
  {
    id: "ws2",
    number: 2,
    title: "Electrostatic Fields",
    chapter: "Chapter 2",
    chapterColor: "cyan",
    problems: [
      {
        number: "2.1",
        statement: "A point charge Q = 5 nC is located at the origin. Find the electric field intensity E at point P(1, 2, 3) m in free space.",
        latex: "\\mathbf{E} = \\frac{Q}{4\\pi\\varepsilon_0 R^2}\\hat{a}_R",
        solutionLatex: [
          "\\mathbf{R} = \\hat{a}_x + 2\\hat{a}_y + 3\\hat{a}_z, \\quad R = \\sqrt{1+4+9} = \\sqrt{14}\\text{ m}",
          "\\hat{a}_R = \\frac{\\mathbf{R}}{R} = \\frac{\\hat{a}_x+2\\hat{a}_y+3\\hat{a}_z}{\\sqrt{14}}",
          "E = \\frac{5\\times10^{-9}}{4\\pi(8.854\\times10^{-12})(14)} = 32.12\\text{ V/m}",
          "\\mathbf{E} = 32.12\\hat{a}_R = 8.59\\hat{a}_x + 17.17\\hat{a}_y + 25.76\\hat{a}_z\\text{ V/m}",
        ],
        difficulty: "medium",
        solverId: "electric-field-point",
        tags: ["Coulomb", "electric field", "point charge"],
      },
      {
        number: "2.2",
        statement: "A line charge of ρ_L = 20 nC/m lies along the z-axis. Find E at point P(3, 4, 0).",
        latex: "\\mathbf{E} = \\frac{\\rho_L}{2\\pi\\varepsilon_0 \\rho}\\hat{a}_\\rho",
        solutionLatex: [
          "\\rho = \\sqrt{3^2+4^2} = 5\\text{ m}",
          "E = \\frac{20\\times10^{-9}}{2\\pi(8.854\\times10^{-12})(5)} = 71.94\\text{ V/m}",
          "\\hat{a}_\\rho = \\frac{3\\hat{a}_x+4\\hat{a}_y}{5} = 0.6\\hat{a}_x+0.8\\hat{a}_y",
          "\\mathbf{E} = 43.16\\hat{a}_x + 57.55\\hat{a}_y\\text{ V/m}",
        ],
        difficulty: "medium",
        tags: ["line charge", "electric field", "Gauss law"],
      },
      {
        number: "2.3",
        statement: "Use Gauss's law to find D everywhere for a sphere of radius a carrying uniform surface charge density ρ_s. Apply for r > a.",
        latex: "\\oint_S \\mathbf{D} \\cdot d\\mathbf{S} = Q_{enc}",
        solutionLatex: [
          "\\text{Gaussian surface: sphere of radius }r > a",
          "Q_{enc} = \\rho_s \\cdot 4\\pi a^2",
          "D \\cdot 4\\pi r^2 = \\rho_s \\cdot 4\\pi a^2",
          "\\mathbf{D} = \\frac{\\rho_s a^2}{r^2}\\hat{a}_r \\quad (r > a)",
          "\\mathbf{E} = \\frac{\\rho_s a^2}{\\varepsilon_0 r^2}\\hat{a}_r",
        ],
        difficulty: "hard",
        solverId: "gauss-law-sphere",
        tags: ["Gauss law", "surface charge", "D field"],
      },
      {
        number: "2.4",
        statement: "Two point charges Q₁ = 3 nC at (0,0,0) and Q₂ = −3 nC at (1,0,0). Find the force on Q₂.",
        latex: "\\mathbf{F}_{12} = \\frac{Q_1 Q_2}{4\\pi\\varepsilon_0 R_{12}^2}\\hat{a}_{12}",
        solutionLatex: [
          "R_{12} = 1\\text{ m}, \\quad \\hat{a}_{12} = \\hat{a}_x",
          "F = \\frac{(3\\times10^{-9})(-3\\times10^{-9})}{4\\pi(8.854\\times10^{-12})(1)^2}",
          "F = -80.99\\text{ nN} \\quad \\text{(attractive, toward }Q_1)",
          "\\mathbf{F}_{12} = -80.99\\hat{a}_x\\text{ nN}",
        ],
        difficulty: "medium",
        solverId: "coulombs-law",
        tags: ["Coulomb force", "two charges"],
      },
    ],
  },
  {
    id: "ws3",
    number: 3,
    title: "Electric Fields in Material Space",
    chapter: "Chapter 3",
    chapterColor: "violet",
    problems: [
      {
        number: "3.1",
        statement: "A parallel-plate capacitor has plate area A = 0.01 m², separation d = 2 mm, and is filled with a dielectric of εᵣ = 4. Find the capacitance.",
        latex: "C = \\frac{\\varepsilon_0\\varepsilon_r A}{d}",
        solutionLatex: [
          "C = \\frac{(8.854\\times10^{-12})(4)(0.01)}{2\\times10^{-3}}",
          "C = 177.1\\text{ pF}",
        ],
        difficulty: "easy",
        solverId: "capacitance-parallel",
        tags: ["capacitance", "dielectric", "parallel plate"],
      },
      {
        number: "3.2",
        statement: "A dielectric has εᵣ = 2.5 and E = 100 kV/m. Find the polarization P and the electric susceptibility χₑ.",
        latex: "\\mathbf{P} = \\chi_e\\varepsilon_0\\mathbf{E} = (\\varepsilon_r-1)\\varepsilon_0\\mathbf{E}",
        solutionLatex: [
          "\\chi_e = \\varepsilon_r - 1 = 2.5 - 1 = 1.5",
          "P = (1.5)(8.854\\times10^{-12})(100\\times10^3)",
          "P = 1.328\\text{ μC/m}^2",
        ],
        difficulty: "easy",
        tags: ["polarization", "susceptibility", "dielectric"],
      },
      {
        number: "3.3",
        statement: "Find the electrostatic energy stored in a capacitor of C = 100 pF charged to V = 500 V.",
        latex: "W_E = \\frac{1}{2}CV^2",
        solutionLatex: [
          "W_E = \\frac{1}{2}(100\\times10^{-12})(500)^2",
          "W_E = 12.5\\text{ μJ}",
        ],
        difficulty: "easy",
        solverId: "energy-density-e",
        tags: ["energy", "capacitor", "electrostatic"],
      },
      {
        number: "3.4",
        statement: "At the interface of two dielectrics (εᵣ₁ = 3, εᵣ₂ = 6), E₁ makes 60° with the normal. Find the angle E₂ makes with the normal.",
        latex: "\\varepsilon_{r1}E_{t1} = \\varepsilon_{r2}E_{t2}, \\quad E_{n1} = E_{n2}",
        solutionLatex: [
          "\\tan\\theta_1 = E_{t1}/E_{n1}, \\quad \\tan\\theta_2 = E_{t2}/E_{n2}",
          "\\frac{\\tan\\theta_2}{\\tan\\theta_1} = \\frac{\\varepsilon_{r2}}{\\varepsilon_{r1}} = \\frac{6}{3} = 2",
          "\\tan\\theta_2 = 2\\tan(60°) = 2\\sqrt{3}",
          "\\theta_2 = \\tan^{-1}(2\\sqrt{3}) \\approx 73.9°",
        ],
        difficulty: "hard",
        tags: ["boundary conditions", "dielectric interface", "refraction"],
      },
    ],
  },
  {
    id: "ws4",
    number: 4,
    title: "Magnetostatic Fields",
    chapter: "Chapter 4",
    chapterColor: "green",
    problems: [
      {
        number: "4.1",
        statement: "An infinite line current I = 10 A along the z-axis. Find H at point P(2, 0, 0) m.",
        latex: "\\mathbf{H} = \\frac{I}{2\\pi\\rho}\\hat{a}_\\phi",
        solutionLatex: [
          "\\rho = 2\\text{ m}, \\quad H = \\frac{10}{2\\pi(2)} = 0.7958\\text{ A/m}",
          "\\mathbf{H} = 0.7958\\hat{a}_\\phi\\text{ A/m}",
          "\\mathbf{B} = \\mu_0 H = (4\\pi\\times10^{-7})(0.7958) = 1\\text{ μT}",
        ],
        difficulty: "easy",
        solverId: "ampere-infinite-line",
        tags: ["Ampere law", "line current", "magnetic field"],
      },
      {
        number: "4.2",
        statement: "A toroid with N = 500 turns, mean radius ρ₀ = 0.2 m, and I = 1 A. Find H inside the toroid.",
        latex: "H = \\frac{NI}{2\\pi\\rho_0}",
        solutionLatex: [
          "H = \\frac{500 \\times 1}{2\\pi(0.2)} = \\frac{500}{1.2566} = 397.9\\text{ A/m}",
          "B = \\mu_0 H = (4\\pi\\times10^{-7})(397.9) = 500\\text{ μT}",
        ],
        difficulty: "easy",
        solverId: "ampere-toroid",
        tags: ["toroid", "Ampere law", "solenoid"],
      },
      {
        number: "4.3",
        statement: "Find the magnetic force on a wire of length 2 m carrying I = 5 A in the +x direction, placed in B = 0.3a_y T.",
        latex: "\\mathbf{F} = I\\mathbf{L}\\times\\mathbf{B}",
        solutionLatex: [
          "\\mathbf{L} = 2\\hat{a}_x, \\quad \\mathbf{B} = 0.3\\hat{a}_y",
          "\\mathbf{F} = (5)(2\\hat{a}_x)\\times(0.3\\hat{a}_y)",
          "\\mathbf{F} = (5)(2)(0.3)(\\hat{a}_x\\times\\hat{a}_y) = 3\\hat{a}_z\\text{ N}",
        ],
        difficulty: "medium",
        solverId: "lorentz-force",
        tags: ["magnetic force", "Lorentz force", "current"],
      },
      {
        number: "4.4",
        statement: "A coaxial cable has inner radius a = 1 mm and outer radius b = 4 mm. Find H for a < ρ < b with I = 2 A.",
        latex: "H = \\frac{I_{enc}}{2\\pi\\rho}",
        solutionLatex: [
          "\\text{For }a < \\rho < b: \\quad I_{enc} = I = 2\\text{ A}",
          "H = \\frac{2}{2\\pi\\rho} = \\frac{1}{\\pi\\rho}\\text{ A/m}",
          "\\text{At }\\rho = 2\\text{ mm}: H = \\frac{1}{\\pi(0.002)} = 159.2\\text{ A/m}",
        ],
        difficulty: "hard",
        tags: ["coaxial line", "Ampere law", "H field"],
      },
    ],
  },
  {
    id: "ws5",
    number: 5,
    title: "Maxwell's Equations & Faraday's Law",
    chapter: "Chapter 5",
    chapterColor: "orange",
    problems: [
      {
        number: "5.1",
        statement: "Verify that E = E₀sin(ωt − βz)a_x satisfies the wave equation in free space.",
        latex: "\\nabla^2\\mathbf{E} = \\mu_0\\varepsilon_0\\frac{\\partial^2\\mathbf{E}}{\\partial t^2}",
        solutionLatex: [
          "\\frac{\\partial^2 E_x}{\\partial z^2} = -\\beta^2 E_0\\sin(\\omega t-\\beta z)",
          "\\mu_0\\varepsilon_0\\frac{\\partial^2 E_x}{\\partial t^2} = -\\mu_0\\varepsilon_0\\omega^2 E_0\\sin(\\omega t-\\beta z)",
          "\\text{Satisfied when: }\\beta^2 = \\mu_0\\varepsilon_0\\omega^2, \\quad \\beta = \\omega\\sqrt{\\mu_0\\varepsilon_0} = \\omega/c",
        ],
        difficulty: "hard",
        tags: ["wave equation", "Maxwell", "plane wave"],
      },
      {
        number: "5.2",
        statement: "A magnetic field B = 0.05sin(100t) T passes through a 0.02 m² circular loop. Find the induced EMF.",
        latex: "\\mathcal{E} = -\\frac{d\\Phi_B}{dt}",
        solutionLatex: [
          "\\Phi_B = B \\cdot A = 0.05\\sin(100t)(0.02)",
          "\\mathcal{E} = -\\frac{d\\Phi_B}{dt} = -0.05(100)(0.02)\\cos(100t)",
          "\\mathcal{E} = -0.1\\cos(100t)\\text{ V}",
        ],
        difficulty: "medium",
        tags: ["Faraday law", "EMF", "induction"],
      },
      {
        number: "5.3",
        statement: "Show that for a good conductor, the displacement current density is negligible compared to the conduction current density at 1 GHz for copper (σ = 5.8×10⁷ S/m).",
        latex: "\\frac{J_d}{J_c} = \\frac{\\omega\\varepsilon}{\\sigma} \\ll 1",
        solutionLatex: [
          "\\frac{J_d}{J_c} = \\frac{\\omega\\varepsilon_0}{\\sigma} = \\frac{2\\pi(10^9)(8.854\\times10^{-12})}{5.8\\times10^7}",
          "= \\frac{55.63\\times10^{-3}}{5.8\\times10^7} \\approx 9.59\\times10^{-10} \\ll 1",
          "\\therefore \\text{Copper is a very good conductor at 1 GHz}",
        ],
        difficulty: "hard",
        tags: ["conduction current", "displacement current", "conductor"],
      },
      {
        number: "5.4",
        statement: "State all four Maxwell's equations in integral form and give their physical interpretation.",
        latex: "\\oint_S\\mathbf{D}\\cdot d\\mathbf{S}=Q_{enc}, \\quad \\oint_S\\mathbf{B}\\cdot d\\mathbf{S}=0, \\quad \\oint_L\\mathbf{E}\\cdot d\\mathbf{l}=-\\frac{d\\Phi_B}{dt}, \\quad \\oint_L\\mathbf{H}\\cdot d\\mathbf{l}=I_{enc}+\\frac{d\\Phi_D}{dt}",
        solutionLatex: [
          "1.\\;\\oint_S\\mathbf{D}\\cdot d\\mathbf{S}=Q_{enc} \\quad \\text{(Electric Gauss — source of E is charge)}",
          "2.\\;\\oint_S\\mathbf{B}\\cdot d\\mathbf{S}=0 \\quad \\text{(Magnetic Gauss — no magnetic monopoles)}",
          "3.\\;\\oint_L\\mathbf{E}\\cdot d\\mathbf{l}=-\\frac{d\\Phi_B}{dt} \\quad \\text{(Faraday — changing B induces E)}",
          "4.\\;\\oint_L\\mathbf{H}\\cdot d\\mathbf{l}=I_{enc}+\\frac{d\\Phi_D}{dt} \\quad \\text{(Ampere-Maxwell — H from J and changing E)}",
        ],
        difficulty: "medium",
        tags: ["Maxwell equations", "Gauss", "Faraday", "Ampere"],
      },
    ],
  },
  {
    id: "ws6",
    number: 6,
    title: "Plane Waves & Wave Propagation",
    chapter: "Chapter 6",
    chapterColor: "yellow",
    problems: [
      {
        number: "6.1",
        statement: "Find the skin depth for copper (σ = 5.8×10⁷ S/m, μᵣ = 1) at f = 100 MHz.",
        latex: "\\delta = \\frac{1}{\\sqrt{\\pi f\\mu\\sigma}}",
        solutionLatex: [
          "\\delta = \\frac{1}{\\sqrt{\\pi(10^8)(4\\pi\\times10^{-7})(5.8\\times10^7)}}",
          "\\delta = \\frac{1}{\\sqrt{\\pi \\times 10^8 \\times 4\\pi\\times10^{-7} \\times 5.8\\times10^7}}",
          "\\delta \\approx 6.6\\text{ μm}",
        ],
        difficulty: "medium",
        solverId: "skin-depth",
        tags: ["skin depth", "conductor", "attenuation"],
      },
      {
        number: "6.2",
        statement: "A plane wave in free space has E₀ = 100 V/m. Find the intrinsic impedance, and H₀.",
        latex: "\\eta_0 = \\sqrt{\\mu_0/\\varepsilon_0} = 120\\pi\\,\\Omega, \\quad H_0 = E_0/\\eta_0",
        solutionLatex: [
          "\\eta_0 = 120\\pi \\approx 377\\text{ Ω}",
          "H_0 = \\frac{E_0}{\\eta_0} = \\frac{100}{377} = 0.2653\\text{ A/m}",
        ],
        difficulty: "easy",
        tags: ["intrinsic impedance", "plane wave", "free space"],
      },
      {
        number: "6.3",
        statement: "Calculate the phase velocity and wavelength for a wave at f = 2 GHz in a medium with εᵣ = 4, μᵣ = 1.",
        latex: "u_p = \\frac{c}{\\sqrt{\\varepsilon_r\\mu_r}}, \\quad \\lambda = \\frac{u_p}{f}",
        solutionLatex: [
          "u_p = \\frac{3\\times10^8}{\\sqrt{4\\times1}} = \\frac{3\\times10^8}{2} = 1.5\\times10^8\\text{ m/s}",
          "\\lambda = \\frac{1.5\\times10^8}{2\\times10^9} = 0.075\\text{ m} = 7.5\\text{ cm}",
        ],
        difficulty: "easy",
        solverId: "phase-velocity",
        tags: ["phase velocity", "wavelength", "dielectric medium"],
      },
      {
        number: "6.4",
        statement: "A normally incident plane wave hits a boundary between free space (η₁ = 377 Ω) and glass (εᵣ = 2.25). Find reflection and transmission coefficients.",
        latex: "\\Gamma = \\frac{\\eta_2-\\eta_1}{\\eta_2+\\eta_1}, \\quad \\tau = \\frac{2\\eta_2}{\\eta_2+\\eta_1}",
        solutionLatex: [
          "\\eta_2 = \\frac{377}{\\sqrt{2.25}} = \\frac{377}{1.5} = 251.3\\text{ Ω}",
          "\\Gamma = \\frac{251.3-377}{251.3+377} = \\frac{-125.7}{628.3} = -0.2",
          "\\tau = 1 + \\Gamma = 0.8",
          "\\text{Reflected power: }|\\Gamma|^2 = 4\\%, \\quad \\text{Transmitted: }96\\%",
        ],
        difficulty: "hard",
        tags: ["reflection", "transmission", "boundary", "impedance"],
      },
    ],
  },
  {
    id: "ws7",
    number: 7,
    title: "Transmission Lines",
    chapter: "Chapter 7",
    chapterColor: "red",
    problems: [
      {
        number: "7.1",
        statement: "A 50-Ω lossless transmission line is terminated by a load ZL = 100 + j50 Ω. Find the reflection coefficient Γ and VSWR.",
        latex: "\\Gamma_L = \\frac{Z_L - Z_0}{Z_L + Z_0}, \\quad \\text{VSWR} = \\frac{1+|\\Gamma|}{1-|\\Gamma|}",
        solutionLatex: [
          "\\Gamma_L = \\frac{(100+j50)-50}{(100+j50)+50} = \\frac{50+j50}{150+j50}",
          "|\\Gamma_L| = \\frac{\\sqrt{50^2+50^2}}{\\sqrt{150^2+50^2}} = \\frac{70.71}{158.1} = 0.447",
          "\\text{VSWR} = \\frac{1+0.447}{1-0.447} = \\frac{1.447}{0.553} = 2.62",
        ],
        difficulty: "hard",
        solverId: "vswr",
        tags: ["transmission line", "VSWR", "reflection coefficient"],
      },
      {
        number: "7.2",
        statement: "Find the input impedance of a λ/4 transformer of Z₀ = 75 Ω connected to ZL = 300 Ω.",
        latex: "Z_{in} = Z_0^2 / Z_L \\quad (\\lambda/4\\text{ transformer})",
        solutionLatex: [
          "Z_{in} = \\frac{Z_0^2}{Z_L} = \\frac{75^2}{300} = \\frac{5625}{300} = 18.75\\text{ Ω}",
        ],
        difficulty: "medium",
        tags: ["quarter wave", "impedance transformer", "transmission line"],
      },
      {
        number: "7.3",
        statement: "A lossless 50-Ω line is short-circuited at the load. Find Zin at d = λ/8 from the load.",
        latex: "Z_{in} = jZ_0\\tan(\\beta d)",
        solutionLatex: [
          "\\beta d = \\frac{2\\pi}{\\lambda}\\cdot\\frac{\\lambda}{8} = \\frac{\\pi}{4} = 45°",
          "Z_{in} = j(50)\\tan(45°) = j50\\text{ Ω}",
          "\\text{Purely inductive stub at }\\lambda/8",
        ],
        difficulty: "medium",
        tags: ["short circuit", "stub", "input impedance"],
      },
      {
        number: "7.4",
        statement: "A 100-Ω line feeds a 200-Ω antenna. Calculate the standing wave ratio and the minimum required line length for matching.",
        latex: "S = Z_L/Z_0 \\text{ (real load > }Z_0\\text{)}",
        solutionLatex: [
          "S = \\text{VSWR} = Z_L/Z_0 = 200/100 = 2",
          "|\\Gamma| = (S-1)/(S+1) = 1/3 \\approx 0.333",
          "\\text{Reflected power} = |\\Gamma|^2 = 11.1\\%",
        ],
        difficulty: "medium",
        solverId: "vswr",
        tags: ["VSWR", "matching", "antenna feed"],
      },
    ],
  },
  {
    id: "ws8",
    number: 8,
    title: "Waveguides & Cavity Resonators",
    chapter: "Chapter 8",
    chapterColor: "pink",
    problems: [
      {
        number: "8.1",
        statement: "A rectangular waveguide with a = 4 cm, b = 2 cm operates at 5 GHz. Find the cutoff frequency of the TE₁₀ mode.",
        latex: "f_{c,mn} = \\frac{c}{2}\\sqrt{\\left(\\frac{m}{a}\\right)^2+\\left(\\frac{n}{b}\\right)^2}",
        solutionLatex: [
          "f_{c,10} = \\frac{3\\times10^8}{2}\\sqrt{\\left(\\frac{1}{0.04}\\right)^2+0^2}",
          "f_{c,10} = \\frac{3\\times10^8}{2}\\cdot25 = 3.75\\text{ GHz}",
          "\\text{Since }f = 5\\text{ GHz} > f_c = 3.75\\text{ GHz: TE}_{10}\\text{ propagates}",
        ],
        difficulty: "medium",
        tags: ["waveguide", "cutoff frequency", "TE10 mode"],
      },
      {
        number: "8.2",
        statement: "For the TE₁₀ mode in the waveguide of Problem 8.1 at 5 GHz, find the phase velocity, group velocity, and guide wavelength.",
        latex: "u_p = \\frac{c}{\\sqrt{1-(f_c/f)^2}}, \\quad u_g = c\\sqrt{1-(f_c/f)^2}",
        solutionLatex: [
          "f_c/f = 3.75/5 = 0.75",
          "\\sqrt{1-(0.75)^2} = \\sqrt{1-0.5625} = \\sqrt{0.4375} = 0.661",
          "u_p = 3\\times10^8/0.661 = 4.54\\times10^8\\text{ m/s} > c",
          "u_g = 3\\times10^8 \\times 0.661 = 1.98\\times10^8\\text{ m/s} < c",
          "\\lambda_g = \\lambda/\\sqrt{1-(f_c/f)^2} = (6\\text{cm})/0.661 = 9.08\\text{ cm}",
        ],
        difficulty: "hard",
        tags: ["phase velocity", "group velocity", "guide wavelength"],
      },
      {
        number: "8.3",
        statement: "Sketch the E and H field distributions for the TE₁₀ mode in a rectangular waveguide cross-section.",
        latex: "E_y = E_0\\sin\\left(\\frac{\\pi x}{a}\\right)e^{-j\\beta z}",
        solutionLatex: [
          "\\text{E-field: sinusoidal across x (zero at walls), uniform in y, only }E_y\\text{ component}",
          "\\text{H-field: }H_x\\text{ (in phase with }E_y),\\text{ }H_z\\text{ (90° out of phase)}",
          "\\text{Transverse E-field is maximum at center }(x=a/2)\\text{ and zero at side walls}",
          "\\text{Magnetic field circulates in the xz-plane}",
        ],
        difficulty: "medium",
        tags: ["TE mode", "field distribution", "rectangular waveguide"],
      },
      {
        number: "8.4",
        statement: "A rectangular cavity resonator has dimensions a = 3 cm, b = 2 cm, d = 4 cm. Find the resonant frequency for TM₁₁₀ and TE₁₀₁ modes.",
        latex: "f_{mnp} = \\frac{c}{2}\\sqrt{\\left(\\frac{m}{a}\\right)^2+\\left(\\frac{n}{b}\\right)^2+\\left(\\frac{p}{d}\\right)^2}",
        solutionLatex: [
          "f_{110} = \\frac{3\\times10^8}{2}\\sqrt{(1/0.03)^2+(1/0.02)^2+0} = 150\\times10^6\\sqrt{1111+2500}",
          "f_{110} = 150\\times10^6\\times60.09 = 9.01\\text{ GHz}",
          "f_{101} = \\frac{3\\times10^8}{2}\\sqrt{(1/0.03)^2+0+(1/0.04)^2} = 150\\times10^6\\sqrt{1111+625}",
          "f_{101} = 150\\times10^6\\times41.67 = 6.25\\text{ GHz}",
        ],
        difficulty: "hard",
        tags: ["cavity resonator", "resonant frequency", "TM mode", "TE mode"],
      },
    ],
  },
];

const CHAPTER_COLORS: Record<string, string> = {
  blue: "border-blue-500/30 bg-blue-500/5",
  cyan: "border-cyan-500/30 bg-cyan-500/5",
  violet: "border-violet-500/30 bg-violet-500/5",
  green: "border-green-500/30 bg-green-500/5",
  orange: "border-orange-500/30 bg-orange-500/5",
  yellow: "border-yellow-500/30 bg-yellow-500/5",
  red: "border-red-500/30 bg-red-500/5",
  pink: "border-pink-500/30 bg-pink-500/5",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  easy: "bg-green-500/15 text-green-400 border border-green-500/25",
  medium: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
  hard: "bg-red-500/15 text-red-400 border border-red-500/25",
};

function ProblemCard({
  problem,
  onSolve,
}: {
  problem: WorksheetProblem;
  onSolve?: (solverId: string) => void;
}) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-xs">#{problem.number}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_BADGE[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {problem.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs bg-white/[0.04] text-slate-500 px-1.5 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        </div>

        <p className="text-slate-200 text-sm leading-relaxed mb-3">{problem.statement}</p>

        {problem.latex && (
          <div className="bg-slate-950/60 rounded-lg px-3 py-2 border border-white/[0.05] overflow-x-auto mb-3">
            <KatexRenderer latex={problem.latex} display className="text-slate-300" />
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowSolution(s => !s)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all
              ${showSolution
                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                : "bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.07]"
              }`}
          >
            {showSolution ? <CheckCircle className="w-3 h-3" /> : <Lightbulb className="w-3 h-3" />}
            {showSolution ? "Hide Solution" : "Show Solution"}
          </button>

          {problem.solverId && (
            <button
              onClick={() => onSolve?.(problem.solverId!)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all"
            >
              <Calculator className="w-3 h-3" />
              Solve with Visualization
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSolution && problem.solutionLatex && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06] bg-emerald-950/20"
          >
            <div className="p-4 space-y-3">
              <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3" /> Step-by-Step Solution
              </p>
              {problem.solutionLatex.map((step, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</div>
                  <div className="flex-1 overflow-x-auto">
                    <KatexRenderer latex={step} display className="text-slate-200 text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WorksheetSection({
  ws,
  onSolve,
  isOpen,
  onToggle,
}: {
  ws: Worksheet;
  onSolve: (solverId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const borderClass = CHAPTER_COLORS[ws.chapterColor] ?? "border-slate-500/30 bg-slate-500/5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border backdrop-blur-xl overflow-hidden ${borderClass}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">W{ws.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{ws.title}</p>
          <p className="text-slate-500 text-xs">{ws.chapter} · {ws.problems.length} problems</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {["easy", "medium", "hard"].map(d => {
              const count = ws.problems.filter(p => p.difficulty === d).length;
              if (!count) return null;
              return (
                <span key={d} className={`text-xs px-1.5 py-0.5 rounded-full ${DIFFICULTY_BADGE[d]}`}>{count}</span>
              );
            })}
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.06]"
          >
            <div className="p-4 space-y-3">
              {ws.problems.map(prob => (
                <ProblemCard key={prob.number} problem={prob} onSolve={onSolve} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ResourceVaultPageProps {
  onNavigate?: (tab: string, jumpId?: string) => void;
}

export default function ResourceVaultPage({ onNavigate }: ResourceVaultPageProps) {
  const [openWorksheets, setOpenWorksheets] = useState<Set<string>>(new Set(["ws1"]));

  const toggle = (id: string) => {
    setOpenWorksheets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSolve = (solverId: string) => {
    onNavigate?.("solver", solverId);
  };

  const totalProblems = WORKSHEETS.reduce((acc, ws) => acc + ws.problems.length, 0);

  return (
    <div className="h-full overflow-auto p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <FolderOpen className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Resource Vault</h2>
        </div>
        <p className="text-slate-400 text-sm">
          {WORKSHEETS.length} worksheets · {totalProblems} problems with step-by-step solutions · Click any problem to reveal the solution or launch the visual solver.
        </p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {[
          { label: "Worksheets", value: WORKSHEETS.length, color: "text-blue-400" },
          { label: "Problems", value: totalProblems, color: "text-cyan-400" },
          { label: "With Solver", value: WORKSHEETS.flatMap(w => w.problems).filter(p => p.solverId).length, color: "text-emerald-400" },
          { label: "Chapters", value: 8, color: "text-violet-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-500 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2.5 bg-blue-500/[0.06] border border-blue-500/20 rounded-xl px-4 py-3">
        <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-blue-300 text-xs leading-relaxed">
          <strong>Pro tip:</strong> Click "Solve with Visualization" on any problem to open the Universal Solver pre-loaded with the correct problem type and see the 3D field visualization alongside your KaTeX solution steps.
        </p>
      </div>

      {/* Worksheets */}
      <div className="space-y-4">
        {WORKSHEETS.map(ws => (
          <WorksheetSection
            key={ws.id}
            ws={ws}
            onSolve={handleSolve}
            isOpen={openWorksheets.has(ws.id)}
            onToggle={() => toggle(ws.id)}
          />
        ))}
      </div>
    </div>
  );
}
