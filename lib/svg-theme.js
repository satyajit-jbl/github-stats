export const THEME = {
  bg: "#FFF9DB",
  title: "#F4B400",
  text: "#5A3E00",
  muted: "#8B6914",
  accent: "#FFD700",
  border: "#E8D48B",
  grid: "#F5E6A8",
};

/** Shared card size — keep stats + top-langs identical for profile layout */
export const CARD_WIDTH = 495;
export const CARD_HEIGHT = 195;

export const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Shell: "#89e051",
  Vue: "#41b883",
  React: "#61dafb",
};

export function langColor(name) {
  return LANG_COLORS[name] || "#9CA3AF";
}

export function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function svgResponse(svg, maxAge = 3600) {
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}

export function cardDefs() {
  return `
    <defs>
      <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${THEME.accent};stop-opacity:0.25" />
        <stop offset="100%" style="stop-color:${THEME.title};stop-opacity:0.05" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#5A3E00" flood-opacity="0.12"/>
      </filter>
    </defs>
  `;
}

export function cardBackground(width, height, rx = 16) {
  return `
    ${cardDefs()}
    <rect width="${width}" height="${height}" rx="${rx}" fill="${THEME.bg}" stroke="${THEME.border}" stroke-width="1.5" filter="url(#shadow)"/>
    <rect width="${width}" height="${height}" rx="${rx}" fill="url(#cardGlow)"/>
  `;
}
