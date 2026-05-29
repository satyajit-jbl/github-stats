import axios from "axios";
import {
  THEME,
  CARD_WIDTH,
  CARD_HEIGHT,
  TITLE_SIZE,
  SUBTITLE_SIZE,
  TITLE_Y,
  SUBTITLE_Y,
  langColor,
  escapeXml,
  svgResponse,
  cardBackground,
} from "../../../lib/svg-theme.js";

/** Show friendly name for languages that confuse readers */
function displayLangName(lang) {
  if (lang === "TeX") return "LaTeX";
  return lang;
}

export async function GET(request) {
  try {
    const username = process.env.GITHUB_USERNAME;
    const { searchParams } = new URL(request.url);
    const count = Math.min(parseInt(searchParams.get("langs_count") || "6", 10), 6);

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

    const w = CARD_WIDTH;
    const h = CARD_HEIGHT;
    const barMaxWidth = 248;
    const startY = 72;
    const rowHeight = Math.floor((h - startY - 16) / Math.max(count, 1));
    const langFontSize = 15;
    const pctFontSize = 14;
    const barH = Math.min(16, rowHeight - 8);

    const bars = sorted
      .map(([lang, bytes], i) => {
        const pct = (bytes / total) * 100;
        const barWidth = Math.max((pct / 100) * barMaxWidth, 4);
        const y = startY + i * rowHeight;
        const color = langColor(lang);
        const textY = y + rowHeight / 2 + 5;
        const label = displayLangName(lang);

        return `
          <text x="24" y="${textY}" fill="${THEME.text}" font-size="${langFontSize}" font-weight="600" font-family="Segoe UI, system-ui, sans-serif">${escapeXml(label)}</text>
          <rect x="128" y="${y + 5}" width="${barMaxWidth}" height="${barH}" rx="7" fill="${THEME.grid}"/>
          <rect x="128" y="${y + 5}" width="${barWidth}" height="${barH}" rx="7" fill="${color}"/>
          <text x="${128 + barMaxWidth + 10}" y="${textY}" fill="${THEME.muted}" font-size="${pctFontSize}" font-weight="600" font-family="Segoe UI, system-ui, sans-serif">${pct.toFixed(1)}%</text>
        `;
      })
      .join("");

    const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      ${cardBackground(w, h)}
      <text x="24" y="${TITLE_Y}" fill="${THEME.title}" font-size="${TITLE_SIZE}" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">Most Used Languages</text>
      <text x="24" y="${SUBTITLE_Y}" fill="${THEME.muted}" font-size="${SUBTITLE_SIZE}" font-family="Segoe UI, system-ui, sans-serif">By bytes across public repos</text>
      ${bars}
    </svg>
    `;

    return svgResponse(svg);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
