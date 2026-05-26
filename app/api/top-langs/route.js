import axios from "axios";
import {
  THEME,
  langColor,
  escapeXml,
  svgResponse,
  cardBackground,
} from "../../../lib/svg-theme.js";

export async function GET(request) {
  try {
    const username = process.env.GITHUB_USERNAME;
    const { searchParams } = new URL(request.url);
    const count = Math.min(parseInt(searchParams.get("langs_count") || "6", 10), 8);

    const reposRes = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    const filteredRepos = reposRes.data.filter((repo) => !repo.fork);
    const languageStats = {};

    const languageResponses = await Promise.all(
      filteredRepos.map((repo) =>
        axios.get(repo.languages_url, {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        })
      )
    );

    languageResponses.forEach((langRes) => {
      for (const [lang, bytes] of Object.entries(langRes.data)) {
        languageStats[lang] = (languageStats[lang] || 0) + bytes;
      }
    });

    const sorted = Object.entries(languageStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count);

    const total = sorted.reduce((acc, [, val]) => acc + val, 0) || 1;

    const barMaxWidth = 260;
    const rowHeight = 28;
    const startY = 68;

    const bars = sorted
      .map(([lang, bytes], i) => {
        const pct = (bytes / total) * 100;
        const barWidth = Math.max((pct / 100) * barMaxWidth, 4);
        const y = startY + i * rowHeight;
        const color = langColor(lang);

        return `
          <text x="24" y="${y + 14}" fill="${THEME.text}" font-size="13" font-weight="600" font-family="Segoe UI, system-ui, sans-serif">${escapeXml(lang)}</text>
          <rect x="130" y="${y + 2}" width="${barMaxWidth}" height="14" rx="7" fill="${THEME.grid}"/>
          <rect x="130" y="${y + 2}" width="${barWidth}" height="14" rx="7" fill="${color}"/>
          <text x="${130 + barMaxWidth + 10}" y="${y + 14}" fill="${THEME.muted}" font-size="12" font-family="Segoe UI, system-ui, sans-serif">${pct.toFixed(1)}%</text>
        `;
      })
      .join("");

    const w = 495;
    const h = Math.max(195, startY + sorted.length * rowHeight + 24);

    const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      ${cardBackground(w, h)}
      <text x="24" y="38" fill="${THEME.title}" font-size="20" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">Most Used Languages</text>
      <text x="24" y="56" fill="${THEME.muted}" font-size="12" font-family="Segoe UI, system-ui, sans-serif">By bytes across public repos</text>
      ${bars}
    </svg>
    `;

    return svgResponse(svg);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
