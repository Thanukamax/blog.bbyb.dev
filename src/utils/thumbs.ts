const THUMBS: Record<string, string> = {
  Infrastructure: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="t-infra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1a1a"/><stop offset="1" stop-color="#050505"/></linearGradient></defs>
    <rect width="400" height="240" fill="url(#t-infra)"/>
    <g stroke="rgba(255,255,255,0.06)"><line x1="0" y1="180" x2="400" y2="180"/><line x1="0" y1="140" x2="400" y2="140"/><line x1="0" y1="100" x2="400" y2="100"/></g>
    <g fill="rgba(255,255,255,0.85)">
      <rect x="60" y="150" width="22" height="30"/><rect x="90" y="120" width="22" height="60"/><rect x="120" y="90" width="22" height="90"/>
      <rect x="160" y="70" width="22" height="110"/><rect x="190" y="100" width="22" height="80"/><rect x="220" y="60" width="22" height="120"/>
      <rect x="260" y="40" width="22" height="140"/><rect x="290" y="80" width="22" height="100"/><rect x="320" y="50" width="22" height="130"/>
    </g>
  </svg>`,

  'Developer Experience': `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="240" fill="#0a0a0a"/>
    <g stroke="rgba(255,255,255,0.4)" fill="none" stroke-width="1">
      <path d="M50 120 L120 120 L170 80 L250 80 L300 120 L360 120"/>
      <path d="M170 80 L220 160 L300 160"/>
    </g>
    <g fill="#fff"><circle cx="50" cy="120" r="6"/><circle cx="120" cy="120" r="5"/><circle cx="170" cy="80" r="5"/><circle cx="220" cy="160" r="5"/><circle cx="250" cy="80" r="5"/><circle cx="300" cy="120" r="5"/><circle cx="300" cy="160" r="5"/><circle cx="360" cy="120" r="6"/></g>
  </svg>`,

  Reliability: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="240" fill="#0a0a0a"/>
    <g stroke="rgba(255,255,255,0.08)"><line x1="0" y1="60" x2="400" y2="60"/><line x1="0" y1="120" x2="400" y2="120"/><line x1="0" y1="180" x2="400" y2="180"/></g>
    <path d="M20 150 Q 80 140 130 145 T 230 140 T 330 60 L 380 60" stroke="#fff" stroke-width="2" fill="none"/>
    <path d="M20 150 Q 80 140 130 145 T 230 140 T 330 60 L 380 60 L 380 220 L 20 220 Z" fill="rgba(255,255,255,0.08)"/>
    <circle cx="330" cy="60" r="4" fill="#fff"/>
    <g stroke="rgba(255,255,255,0.35)" stroke-dasharray="2 3"><line x1="330" y1="60" x2="330" y2="220"/></g>
  </svg>`,

  'Programming Languages': `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="240" fill="#0a0a0a"/>
    <g stroke="rgba(255,255,255,0.4)" fill="none" stroke-width="1">
      <path d="M200 50 L110 110 M200 50 L290 110 M110 110 L60 180 M110 110 L160 180 M290 110 L240 180 M290 110 L340 180"/>
    </g>
    <g fill="#fff"><rect x="180" y="38" width="40" height="24" rx="4"/><rect x="90" y="98" width="40" height="24" rx="4"/><rect x="270" y="98" width="40" height="24" rx="4"/></g>
    <g fill="rgba(255,255,255,0.7)"><rect x="40" y="168" width="40" height="24" rx="4"/><rect x="140" y="168" width="40" height="24" rx="4"/><rect x="220" y="168" width="40" height="24" rx="4"/><rect x="320" y="168" width="40" height="24" rx="4"/></g>
  </svg>`,

  Performance: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="240" fill="#0a0a0a"/>
    <g fill="#fff"><rect x="30" y="180" width="340" height="18"/></g>
    <g fill="rgba(255,255,255,0.85)">
      <rect x="30" y="158" width="110" height="18"/><rect x="150" y="158" width="60" height="18"/><rect x="220" y="158" width="150" height="18"/>
    </g>
    <g fill="rgba(255,255,255,0.65)">
      <rect x="30" y="136" width="70" height="18"/><rect x="110" y="136" width="30" height="18"/><rect x="220" y="136" width="90" height="18"/><rect x="320" y="136" width="50" height="18"/>
    </g>
    <g fill="rgba(255,255,255,0.45)">
      <rect x="30" y="114" width="40" height="18"/><rect x="220" y="114" width="50" height="18"/>
    </g>
    <g fill="rgba(255,255,255,0.3)"><rect x="30" y="92" width="30" height="18"/></g>
  </svg>`,

  'Machine Learning': `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="240" fill="#0a0a0a"/>
    <g fill="rgba(255,255,255,0.9)">
      <circle cx="80" cy="70" r="3"/><circle cx="130" cy="110" r="3"/><circle cx="180" cy="80" r="3"/><circle cx="90" cy="150" r="3"/><circle cx="160" cy="170" r="3"/>
    </g>
    <g fill="rgba(255,255,255,0.55)">
      <circle cx="240" cy="60" r="3"/><circle cx="290" cy="100" r="3"/><circle cx="330" cy="140" r="3"/><circle cx="260" cy="150" r="3"/><circle cx="220" cy="180" r="3"/><circle cx="310" cy="70" r="3"/><circle cx="50" cy="110" r="3"/><circle cx="220" cy="120" r="3"/><circle cx="360" cy="90" r="3"/>
    </g>
    <g stroke="rgba(255,255,255,0.25)" fill="none"><circle cx="140" cy="120" r="70"/></g>
    <g stroke="rgba(255,255,255,0.5)" fill="none"><circle cx="140" cy="120" r="30"/></g>
  </svg>`,

  Security: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="240" fill="#0a0a0a"/>
    <g stroke="rgba(255,255,255,0.3)" fill="none">
      <path d="M180 95 V80 a20 20 0 0 1 40 0 V95" stroke-width="2"/>
    </g>
    <rect x="170" y="95" width="60" height="60" rx="6" fill="#fff"/>
    <circle cx="200" cy="125" r="5" fill="#0a0a0a"/>
    <g stroke="rgba(255,255,255,0.4)" fill="none" stroke-dasharray="3 4">
      <line x1="50" y1="120" x2="165" y2="120"/><line x1="235" y1="120" x2="350" y2="120"/><line x1="200" y1="40" x2="200" y2="90"/><line x1="200" y1="160" x2="200" y2="210"/>
    </g>
    <g fill="rgba(255,255,255,0.6)"><circle cx="50" cy="120" r="4"/><circle cx="350" cy="120" r="4"/><circle cx="200" cy="40" r="4"/><circle cx="200" cy="210" r="4"/></g>
  </svg>`,

  'Distributed Systems': `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="240" fill="#0a0a0a"/>
    <g stroke="rgba(255,255,255,0.5)" fill="none"><circle cx="200" cy="120" r="80"/></g>
    <g stroke="rgba(255,255,255,0.25)" fill="none"><circle cx="200" cy="120" r="50"/><circle cx="200" cy="120" r="110"/></g>
    <g fill="#fff">
      <circle cx="200" cy="40" r="6"/><circle cx="280" cy="120" r="6"/><circle cx="200" cy="200" r="6"/><circle cx="120" cy="120" r="6"/>
      <circle cx="257" cy="63" r="5" opacity="0.7"/><circle cx="257" cy="177" r="5" opacity="0.7"/><circle cx="143" cy="177" r="5" opacity="0.7"/><circle cx="143" cy="63" r="5" opacity="0.7"/>
    </g>
  </svg>`,

  Tooling: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="240" fill="#0a0a0a"/>
    <rect x="50" y="40" width="300" height="160" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)"/>
    <g fill="rgba(255,255,255,0.35)"><circle cx="66" cy="56" r="3"/><circle cx="78" cy="56" r="3"/><circle cx="90" cy="56" r="3"/></g>
    <g fill="#fff" font-family="ui-monospace, monospace" font-size="10">
      <text x="66" y="90" opacity="0.55">$ b3 deploy --dry-run</text>
      <text x="66" y="110" opacity="0.9">→ planning 14 resources</text>
      <text x="66" y="130" opacity="0.9">✓ ok. 0.4s</text>
      <text x="66" y="160" opacity="0.55">$ _</text>
    </g>
    <rect x="79" y="153" width="7" height="12" fill="#fff" opacity="0.7"/>
  </svg>`,

  Systems: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="240" fill="#0a0a0a"/>
    <g stroke="rgba(255,255,255,0.4)" fill="none" stroke-width="1">
      <path d="M50 120 L120 120 L170 80 L250 80 L300 120 L360 120"/>
      <path d="M170 80 L220 160 L300 160"/>
    </g>
    <g fill="#fff"><circle cx="50" cy="120" r="6"/><circle cx="120" cy="120" r="5"/><circle cx="170" cy="80" r="5"/><circle cx="220" cy="160" r="5"/><circle cx="250" cy="80" r="5"/><circle cx="300" cy="120" r="5"/><circle cx="300" cy="160" r="5"/><circle cx="360" cy="120" r="6"/></g>
  </svg>`,
};

const FALLBACK_THUMBS = Object.values(THUMBS);

export function getThumb(topic: string): string {
  return THUMBS[topic] ?? FALLBACK_THUMBS[Math.floor(Math.random() * FALLBACK_THUMBS.length)];
}
