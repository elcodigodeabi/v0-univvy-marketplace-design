const INK = "currentColor" // stroke color for the stickman, follows text-foreground so it adapts to dark mode
const RED = "#dc2626" // primary brand red
const AMBER = "#d97706" // amber accent

/**
 * Fainted stickman, passed out on the floor after an academic burnout,
 * surrounded by books, spilled coffee and scattered papers.
 * Reuses the same visual language (line-weight, palette) as the loading-screen stickman.
 */
export function NotFoundIllustration() {
  return (
    <svg
      viewBox="0 0 300 190"
      className="h-full w-full overflow-visible text-foreground"
      role="img"
      aria-label="Un estudiante desmayado sobre una pila de libros, rodeado de hojas y un café derramado"
    >
      {/* ground shadow */}
      <ellipse cx="150" cy="176" rx="120" ry="6" fill={INK} opacity={0.06} />

      {/* scattered papers */}
      <g opacity={0.8}>
        <rect x="18" y="150" width="20" height="14" rx="1" fill="none" stroke={INK} strokeWidth="1.4" transform="rotate(-12 28 157)" />
        <rect x="252" y="158" width="18" height="13" rx="1" fill="none" stroke={INK} strokeWidth="1.4" transform="rotate(10 261 164)" />
        <rect x="8" y="120" width="16" height="12" rx="1" fill="none" stroke={INK} strokeWidth="1.2" opacity={0.6} transform="rotate(18 16 126)" />
      </g>

      {/* spilled coffee cup */}
      <g transform="translate(228,148) rotate(70)">
        <rect x="0" y="0" width="14" height="16" rx="2" fill="none" stroke={AMBER} strokeWidth="2" />
        <path d="M14 4 q6 0 6 5 q0 5 -6 4" fill="none" stroke={AMBER} strokeWidth="1.6" />
      </g>
      <path
        d="M232 160 q14 -4 26 2 q10 4 20 0 q4 6 -4 9 q-16 5 -30 -1 q-10 -4 -12 -10z"
        fill={AMBER}
        opacity={0.18}
      />

      {/* fallen graduation cap, beside the head */}
      <g transform="translate(20,140) rotate(-18)">
        <rect x="0" y="0" width="20" height="4" rx="1" fill={INK} />
        <polygon points="10,-9 34,-1 10,7 -14,-1" fill={INK} />
        <line x1="10" y1="-1" x2="24" y2="-1" stroke={AMBER} strokeWidth="1.8" />
        <circle cx="25" cy="0" r="2.4" fill={AMBER} />
      </g>

      {/* book pile used as a pillow */}
      <g>
        <rect x="34" y="150" width="52" height="10" rx="1.5" fill="none" stroke={INK} strokeWidth="2.2" transform="rotate(-3 60 155)" />
        <rect x="40" y="141" width="44" height="10" rx="1.5" fill="none" stroke={INK} strokeWidth="2.2" transform="rotate(2 62 146)" />
        <rect x="38" y="132" width="40" height="10" rx="1.5" fill={RED} opacity={0.12} stroke={RED} strokeWidth="2" transform="rotate(-4 58 137)" />
      </g>

      {/* fainted figure: lying down, cheek on the books */}
      <g style={{ transformOrigin: "150px 140px", animation: "notfound-breathe 2.6s ease-in-out infinite" }}>
        {/* torso */}
        <path d="M88 138 Q130 150 176 143" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* far arm, flopped up over the books */}
        <path d="M100 138 Q86 122 64 124" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* near arm, sprawled on the ground */}
        <path d="M150 145 Q176 160 206 156" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* legs, bent and crossed */}
        <path d="M176 143 Q198 132 214 146" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M214 146 Q226 156 246 150" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M176 143 Q190 158 182 174" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* head, cheek resting on the book pillow */}
        <circle cx="75" cy="130" r="13" fill="none" stroke={INK} strokeWidth="3" />

        {/* dizzy swirl eyes */}
        <g
          style={{ transformOrigin: "71px 128px", animation: "notfound-swirl 2.4s linear infinite" }}
        >
          <path d="M71 128 m3 0 a3 3 0 1 1 -3 -3" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </g>
        <g
          style={{ transformOrigin: "80px 130px", animation: "notfound-swirl 2.4s linear infinite reverse" }}
        >
          <path d="M80 130 m3 0 a3 3 0 1 1 -3 -3" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </g>

        {/* small open-mouth "out cold" sigh */}
        <ellipse cx="76" cy="137" rx="2.2" ry="1.6" fill={INK} opacity={0.7} />
      </g>

      {/* twitching foot, still fighting finals */}
      <g style={{ transformOrigin: "246px 150px", animation: "notfound-twitch 3.4s ease-in-out infinite" }}>
        <line x1="246" y1="150" x2="258" y2="146" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* floating zzz, fast asleep */}
      <text x="96" y="98" fontSize="16" fontWeight={700} fill={AMBER} style={{ animation: "loading-floaty 1.8s ease-in-out infinite" }}>
        Z
      </text>
      <text x="112" y="86" fontSize="12" fontWeight={700} fill={AMBER} style={{ animation: "loading-floaty 1.8s ease-in-out infinite .3s" }}>
        z
      </text>
      <text x="124" y="78" fontSize="9" fontWeight={700} fill={AMBER} style={{ animation: "loading-floaty 1.8s ease-in-out infinite .6s" }}>
        z
      </text>

      {/* dizzy sparkles circling above */}
      <path
        d="M60 90 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4z"
        fill={RED}
        style={{ transformOrigin: "60px 95px", animation: "loading-sparkle 1.6s ease-in-out infinite" }}
      />
      <path
        d="M46 104 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1z"
        fill={AMBER}
        style={{ transformOrigin: "46px 107px", animation: "loading-sparkle 1.6s ease-in-out infinite .5s" }}
      />
    </svg>
  )
}
