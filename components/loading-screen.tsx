"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const INK = "currentColor" // stroke color for the stickman, follows text-foreground so it adapts to dark mode
const RED = "#dc2626" // primary brand red
const AMBER = "#d97706" // amber accent (formerly "gold")

const tips = [
  { label: "PARA ESTUDIANTES", text: 'Antes de decir "no entendí nada", probá decir "no entendí ESTO".' },
  { label: "PARA ASESORES", text: "Si el alumno bosteza, cambiá de ejemplo, no de tono de voz." },
  { label: "PARA ESTUDIANTES", text: "Tu asesor no lee mentes… todavía. Escribí tu duda antes de la clase." },
  { label: "PARA ASESORES", text: "Explicá como si tu alumno tuviera apuro: al grano, con cariño." },
  { label: "PARA ESTUDIANTES", text: "La cámara prendida rinde más que diez tazas de café." },
  { label: "PARA ASESORES", text: "Un buen chiste vale más que tres diapositivas aburridas." },
  {
    label: "PARA ESTUDIANTES",
    text: "Si vas a cancelar, avisá con tiempo: tu asesor también tiene vida (rara, pero la tiene).",
  },
  { label: "PARA ASESORES", text: "Cobrá lo que valés… y llegá 5 minutos antes, no 5 tarde." },
  { label: "PARA ESTUDIANTES", text: 'Preguntar "de nuevo" no te hace menos inteligente, te hace más rápido.' },
  { label: "PARA ASESORES", text: "Si te preguntan lo mismo por tercera vez, el problema no es el alumno." },
] as const

function HeadCap() {
  return (
    <>
      <rect x="44" y="16" width="32" height="6" rx="1" fill={INK} />
      <polygon points="60,4 88,19 60,28 32,19" fill={INK} />
      <g style={{ transformOrigin: "60px 19px", animation: "loading-swing 1.75s ease-in-out infinite" }}>
        <line x1="60" y1="19" x2="76" y2="19" stroke={AMBER} strokeWidth="2" />
        <circle cx="77" cy="20" r="3" fill={AMBER} />
      </g>
      <circle cx="60" cy="34" r="13" fill="none" stroke={INK} strokeWidth="3" />
    </>
  )
}

function Figure({ children }: { children: React.ReactNode }) {
  return (
    <g style={{ transformOrigin: "60px 150px", animation: "loading-bob 2.2s ease-in-out infinite" }}>{children}</g>
  )
}

function LegL({ children }: { children: React.ReactNode }) {
  return (
    <g style={{ transformOrigin: "60px 95px", animation: "loading-step-l 2.2s ease-in-out infinite" }}>{children}</g>
  )
}

function LegR({ children }: { children: React.ReactNode }) {
  return (
    <g style={{ transformOrigin: "60px 95px", animation: "loading-step-r 2.2s ease-in-out infinite" }}>{children}</g>
  )
}

function RunL({ children }: { children: React.ReactNode }) {
  return <g style={{ transformOrigin: "60px 95px", animation: "loading-run-l .55s ease-in-out infinite" }}>{children}</g>
}

function RunR({ children }: { children: React.ReactNode }) {
  return <g style={{ transformOrigin: "60px 95px", animation: "loading-run-r .55s ease-in-out infinite" }}>{children}</g>
}

const scenes = [
  // 0 — estudiantes: "no entendí ESTO"
  <Figure key={0}>
    <HeadCap />
    <circle cx="56" cy="33" r="1.6" fill={INK} />
    <line x1="63" y1="33" x2="67" y2="33" stroke={INK} strokeWidth="1.6" />
    <path d="M55 40 L65 40" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <line x1="60" y1="47" x2="60" y2="92" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="60" y1="58" x2="118" y2="88" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <path d="M60 62 Q46 70 52 84" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <LegL>
      <line x1="60" y1="92" x2="46" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegL>
    <LegR>
      <line x1="60" y1="92" x2="74" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegR>
    <text x="150" y="80" fontSize="80" fontWeight={800} fill="none" stroke={RED} strokeWidth="3" opacity={0.9}>
      ?
    </text>
    <circle
      cx="120"
      cy="90"
      r="4"
      fill={RED}
      style={{ transformOrigin: "center", animation: "loading-pulse-dot 1s ease-in-out infinite" }}
    />
  </Figure>,
  // 1 — asesores: bostezo
  <Figure key={1}>
    <HeadCap />
    <path d="M53 37 q4 -4 8 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M64 37 q4 -4 8 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    <ellipse cx="60" cy="46" rx="5" ry="8" fill={INK} stroke={INK} strokeWidth="1.5" />
    <line x1="60" y1="47" x2="60" y2="92" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="66" y1="60" x2="100" y2="96" stroke={AMBER} strokeWidth="3" strokeLinecap="round" />
    <path d="M54 62 Q46 78 50 90" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <LegL>
      <line x1="60" y1="92" x2="46" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegL>
    <LegR>
      <line x1="60" y1="92" x2="74" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegR>
    <rect x="98" y="90" width="30" height="34" fill="none" stroke={INK} strokeWidth="2.5" />
    <line x1="103" y1="100" x2="123" y2="100" stroke={INK} strokeWidth="1.5" opacity={0.6} />
    <line x1="103" y1="108" x2="123" y2="108" stroke={INK} strokeWidth="1.5" opacity={0.6} />
    <text
      x="86"
      y="20"
      fontSize="16"
      fill={AMBER}
      style={{ animation: "loading-floaty 1.8s ease-in-out infinite" }}
    >
      Z
    </text>
    <text
      x="98"
      y="14"
      fontSize="11"
      fill={AMBER}
      style={{ animation: "loading-floaty 1.8s ease-in-out infinite .3s" }}
    >
      z
    </text>
    <text
      x="106"
      y="26"
      fontSize="8"
      fill={AMBER}
      style={{ animation: "loading-floaty 1.8s ease-in-out infinite .6s" }}
    >
      z
    </text>
  </Figure>,
  // 2 — estudiantes: no lee mentes
  <Figure key={2}>
    <HeadCap />
    <circle cx="56" cy="33" r="1.6" fill={INK} />
    <circle cx="64" cy="33" r="1.6" fill={INK} />
    <circle cx="60" cy="41" r="2" fill="none" stroke={INK} strokeWidth="1.5" />
    <line x1="60" y1="47" x2="60" y2="92" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <path d="M66 60 Q82 50 74 36" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M54 62 Q42 66 40 78" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <rect x="30" y="72" width="16" height="20" rx="1" fill="none" stroke={INK} strokeWidth="2" />
    <line x1="34" y1="78" x2="42" y2="78" stroke={INK} strokeWidth="1.3" opacity={0.7} />
    <line x1="34" y1="83" x2="42" y2="83" stroke={INK} strokeWidth="1.3" opacity={0.7} />
    <LegL>
      <line x1="60" y1="92" x2="46" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegL>
    <LegR>
      <line x1="60" y1="92" x2="74" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegR>
    <circle cx="52" cy="8" r="10" fill={INK} opacity={0.06} stroke={INK} strokeWidth="1.2" />
    <circle cx="68" cy="6" r="12" fill={INK} opacity={0.06} stroke={INK} strokeWidth="1.2" />
    <circle cx="82" cy="10" r="9" fill={INK} opacity={0.06} stroke={INK} strokeWidth="1.2" />
    <path d="M58 8 l4 -5 l3 4 l4 -4 l3 5" stroke={RED} strokeWidth="1.8" fill="none" strokeLinecap="round" />
  </Figure>,
  // 3 — asesores: al grano
  <Figure key={3}>
    <HeadCap />
    <circle cx="56" cy="33" r="1.6" fill={INK} />
    <circle cx="64" cy="33" r="1.6" fill={INK} />
    <path d="M55 41 Q60 44 66 40" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <line x1="60" y1="47" x2="58" y2="90" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="56" y1="60" x2="36" y2="76" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="64" y1="60" x2="88" y2="50" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <circle cx="90" cy="46" r="9" fill="none" stroke={AMBER} strokeWidth="2" />
    <line x1="90" y1="46" x2="90" y2="40" stroke={AMBER} strokeWidth="1.6" />
    <line x1="90" y1="46" x2="95" y2="47" stroke={AMBER} strokeWidth="1.6" />
    <path d="M84 37 l-3 -3 M96 37 l3 -3" stroke={AMBER} strokeWidth="1.6" strokeLinecap="round" />
    <RunL>
      <path d="M58 90 L46 106 L36 122" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    </RunL>
    <RunR>
      <path d="M58 90 L72 104 L82 116" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    </RunR>
    <line x1="18" y1="70" x2="30" y2="66" stroke={INK} strokeWidth="1.5" opacity={0.45} />
    <line x1="16" y1="84" x2="28" y2="80" stroke={INK} strokeWidth="1.5" opacity={0.45} />
    <line x1="20" y1="98" x2="32" y2="94" stroke={INK} strokeWidth="1.5" opacity={0.45} />
  </Figure>,
  // 4 — estudiantes: cámara prendida
  <Figure key={4}>
    <HeadCap />
    <circle cx="56" cy="33" r="2.6" fill="none" stroke={INK} strokeWidth="1.4" />
    <circle cx="64" cy="33" r="2.6" fill="none" stroke={INK} strokeWidth="1.4" />
    <path d="M56 41 L64 41" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    <g style={{ animation: "loading-jitter .28s linear infinite" }}>
      <line x1="60" y1="47" x2="60" y2="86" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="58" x2="46" y2="80" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="58" x2="74" y2="80" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>
    <LegL>
      <line x1="60" y1="86" x2="48" y2="120" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegL>
    <LegR>
      <line x1="60" y1="86" x2="72" y2="120" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegR>
    <rect x="40" y="82" width="40" height="6" fill="none" stroke={INK} strokeWidth="2" />
    <rect x="44" y="56" width="32" height="26" fill="none" stroke={INK} strokeWidth="2.5" />
    <circle
      cx="60"
      cy="60"
      r="2"
      fill={RED}
      style={{ transformOrigin: "center", animation: "loading-pulse-dot 1s ease-in-out infinite" }}
    />
    <circle cx="70" cy="60" r="2" fill={RED} />
    <g fill="none" stroke={INK} strokeWidth="1.6">
      <path d="M28 128 h8 v6 h-8z M36 129 q4 0 4 3 q0 3 -4 3" />
      <path d="M92 126 h8 v6 h-8z M100 127 q4 0 4 3 q0 3 -4 3" />
      <path d="M18 118 h7 v5 h-7z M25 119 q3 0 3 2 q0 3 -3 3" />
    </g>
    <text x="80" y="140" fontSize="12" fill={AMBER} fontWeight={700}>
      ×10
    </text>
  </Figure>,
  // 5 — asesores: buen chiste
  <Figure key={5}>
    <g transform="rotate(-6 60 34)">
      <HeadCap />
    </g>
    <path d="M52 32 q4 -5 8 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M63 32 q4 -5 8 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    <ellipse cx="61" cy="42" rx="7" ry="6" fill={INK} stroke={INK} strokeWidth="1.5" />
    <line x1="60" y1="47" x2="60" y2="92" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="66" y1="58" x2="86" y2="32" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="54" y1="60" x2="34" y2="72" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <circle cx="30" cy="75" r="4" fill="none" stroke={RED} strokeWidth="1.6" />
    <path d="M30 71 q-6 -8 -14 -10" stroke={RED} strokeWidth="1.3" fill="none" strokeDasharray="2 3" opacity={0.7} />
    <LegL>
      <line x1="60" y1="92" x2="46" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegL>
    <LegR>
      <line x1="60" y1="92" x2="74" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegR>
    <text
      x="88"
      y="22"
      fontSize="15"
      fontWeight={800}
      fill={RED}
      transform="rotate(-8 88 22)"
      style={{ transformOrigin: "center", animation: "loading-pop 1.6s ease-in-out infinite" }}
    >
      ¡JA JA!
    </text>
  </Figure>,
  // 6 — estudiantes: avisar a tiempo
  <Figure key={6}>
    <HeadCap />
    <circle cx="56" cy="33" r="1.6" fill={INK} />
    <circle cx="64" cy="33" r="1.6" fill={INK} />
    <path d="M53 30 l5 1 M67 30 l-5 1" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    <ellipse cx="60" cy="41" rx="3" ry="4" fill="none" stroke={INK} strokeWidth="1.6" />
    <line x1="60" y1="47" x2="58" y2="90" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="56" y1="58" x2="38" y2="72" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="62" y1="58" x2="82" y2="70" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <RunL>
      <path d="M58 90 L46 106 L36 122" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    </RunL>
    <RunR>
      <path d="M58 90 L72 104 L82 116" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    </RunR>
    <rect x="94" y="46" width="30" height="26" fill="none" stroke={INK} strokeWidth="2.2" />
    <line x1="100" y1="42" x2="100" y2="50" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <line x1="118" y1="42" x2="118" y2="50" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <line x1="94" y1="56" x2="124" y2="56" stroke={INK} strokeWidth="1.3" opacity={0.6} />
    <text x="98" y="70" fontSize="18" fontWeight={800} fill={RED}>
      X
    </text>
    <path
      d="M78 16 q4 6 0 9 q-4 -3 0 -9z"
      fill={AMBER}
      opacity={0.85}
      style={{ animation: "loading-drop 1.3s ease-in-out infinite" }}
    />
  </Figure>,
  // 7 — asesores: cobrar bien / puntual
  <Figure key={7}>
    <HeadCap />
    <circle cx="56" cy="33" r="1.6" fill={INK} />
    <circle cx="64" cy="33" r="1.6" fill={INK} />
    <path d="M55 40 Q60 43 65 40" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M60 47 Q64 68 60 92" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <line x1="66" y1="58" x2="84" y2="42" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <circle cx="86" cy="40" r="4.5" fill="none" stroke={AMBER} strokeWidth="1.8" />
    <line x1="86" y1="40" x2="86" y2="37" stroke={AMBER} strokeWidth="1.3" />
    <line x1="54" y1="60" x2="38" y2="76" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <circle cx="35" cy="80" r="7" fill={AMBER} opacity={0.9} />
    <text x="31" y="84" fontSize="9" fontWeight={800} fill="#fff">
      $
    </text>
    <LegL>
      <line x1="60" y1="92" x2="46" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegL>
    <LegR>
      <line x1="60" y1="92" x2="74" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegR>
    <path
      d="M92 14 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4z"
      fill={AMBER}
      style={{ transformOrigin: "center", animation: "loading-sparkle 1.4s ease-in-out infinite" }}
    />
    <path
      d="M78 6 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1z"
      fill={AMBER}
      style={{ transformOrigin: "center", animation: "loading-sparkle 1.4s ease-in-out infinite .4s" }}
    />
  </Figure>,
  // 8 — estudiantes: preguntar de nuevo
  <Figure key={8}>
    <HeadCap />
    <circle cx="56" cy="32" r="2.2" fill={INK} />
    <circle cx="64" cy="32" r="2.2" fill={INK} />
    <path d="M55 40 Q60 45 65 40" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="60" y1="47" x2="60" y2="92" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="64" y1="58" x2="72" y2="24" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <circle cx="73" cy="20" r="3" fill={INK} />
    <path d="M56 62 Q46 70 50 84" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <LegL>
      <line x1="60" y1="92" x2="46" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegL>
    <LegR>
      <line x1="60" y1="92" x2="74" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegR>
    <circle cx="92" cy="10" r="8" fill="none" stroke={AMBER} strokeWidth="2" />
    <rect x="89" y="17" width="6" height="4" fill={AMBER} />
    <path d="M92 -1 v-4 M82 6 l-4 -2 M102 6 l4 -2" stroke={AMBER} strokeWidth="1.5" strokeLinecap="round" />
    <rect
      x="82"
      y="34"
      width="24"
      height="15"
      rx="7"
      fill={RED}
      style={{ transformOrigin: "center", animation: "loading-pop 1.6s ease-in-out infinite" }}
    />
    <text x="88" y="45" fontSize="11" fontWeight={800} fill="#fff">
      ×3
    </text>
  </Figure>,
  // 9 — asesores: el mismo problema
  <Figure key={9}>
    <HeadCap />
    <circle cx="56" cy="33" r="1.6" fill={INK} />
    <circle cx="64" cy="33" r="1.6" fill={INK} />
    <path d="M52 29 l6 -1" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
    <line x1="55" y1="41" x2="65" y2="41" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    <line x1="60" y1="47" x2="60" y2="92" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <path d="M66 60 Q80 50 72 36" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M54 62 Q46 78 50 90" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    <LegL>
      <line x1="60" y1="92" x2="46" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegL>
    <LegR>
      <line x1="60" y1="92" x2="74" y2="122" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </LegR>
    <rect x="98" y="14" width="34" height="76" rx="8" fill={INK} opacity={0.04} stroke={INK} strokeWidth="2" />
    <g transform="translate(78,26) scale(.55)">
      <circle cx="60" cy="34" r="13" fill="none" stroke={INK} strokeWidth="3" />
      <line x1="60" y1="47" x2="60" y2="92" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M66 60 Q80 50 72 36" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <line x1="54" y1="62" x2="46" y2="86" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="92" x2="48" y2="120" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="92" x2="72" y2="120" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>
    <text
      x="86"
      y="28"
      fontSize="14"
      fontWeight={800}
      fill={AMBER}
      style={{ animation: "loading-floaty 1.8s ease-in-out infinite" }}
    >
      ?
    </text>
    <text
      x="108"
      y="18"
      fontSize="10"
      fontWeight={800}
      fill={RED}
      style={{ animation: "loading-floaty 1.8s ease-in-out infinite .4s" }}
    >
      ?
    </text>
  </Figure>,
]

export function LoadingScreen() {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      const timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % tips.length)
        setFading(false)
      }, 320)
      return () => clearTimeout(timeout)
    }, 3600)
    return () => clearInterval(interval)
  }, [])

  const tip = tips[index]

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-red-50 via-background to-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 py-8">
        <div className="relative size-[72px] flex-none">
          <div
            className="absolute inset-0 rounded-full border-[3px] border-primary/15 border-t-primary"
            style={{ animation: "loading-spin 1.6s linear infinite" }}
          />
          <div className="absolute inset-[6px] overflow-hidden rounded-full">
            <Image
              src="/univvy-logo.png"
              alt="Univvy"
              fill
              sizes="60px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="relative h-[180px] w-[230px]">
          <svg
            viewBox="0 0 230 180"
            className="h-full w-full overflow-visible text-foreground"
            aria-hidden="true"
          >
            {scenes[index]}
          </svg>
        </div>

        <div className="relative w-full rounded-2xl border border-border bg-card px-5 py-4 text-center shadow-lg">
          <div
            aria-hidden="true"
            className="absolute -top-[9px] left-1/2 size-4 -translate-x-1/2 rotate-45 rounded-sm border-l border-t border-border bg-card"
          />
          <span
            className="mb-2 inline-block rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold tracking-wider text-primary-foreground transition-opacity duration-200"
            style={{ opacity: fading ? 0 : 1 }}
          >
            {tip.label}
          </span>
          <p
            className="m-0 text-sm font-semibold leading-snug text-card-foreground transition-all duration-300"
            style={{
              opacity: fading ? 0 : 1,
              transform: fading ? "translateY(4px)" : "translateY(0)",
            }}
          >
            {tip.text}
          </p>
        </div>

        <div className="h-1 w-[120px] overflow-hidden rounded-full bg-muted">
          <div
            className="h-full w-2/5 rounded-full bg-primary"
            style={{ animation: "loading-slide 1.3s ease-in-out infinite" }}
          />
        </div>
        <p className="m-0 text-xs tracking-wide text-muted-foreground">Cargando Univvy…</p>
      </div>
    </div>
  )
}
