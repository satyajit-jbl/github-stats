import axios from "axios";
import {
  THEME,
  CARD_WIDTH,
  CARD_HEIGHT,
  TITLE_SIZE,
  SUBTITLE_SIZE,
  TITLE_Y,
  SUBTITLE_Y,
  escapeXml,
  svgResponse,
  cardBackground,
} from "../../../lib/svg-theme.js";

export async function GET() {
  try {
    const username = process.env.GITHUB_USERNAME;

    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    };

    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers }),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers,
      }),
    ]);

    const user = userRes.data;
    const repos = reposRes.data;
    const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);

    const metrics = [
      { label: "Repositories", value: user.public_repos },
      { label: "Stars", value: totalStars },
      { label: "Followers", value: user.followers },
      { label: "Forks", value: totalForks },
    ];

    const w = CARD_WIDTH;
    const h = CARD_HEIGHT;

    const boxW = 218;
    const boxH = 46;
    const colGap = 238;
    const rowGap = 58;
    const gridStartY = 72;

    const metricCards = metrics
      .map((m, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 24 + col * colGap;
        const y = gridStartY + row * rowGap;
        return `
          <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="10" fill="${THEME.grid}" stroke="${THEME.border}" stroke-width="1"/>
          <text x="${x + 14}" y="${y + 20}" fill="${THEME.muted}" font-size="11" font-family="Segoe UI, system-ui, sans-serif">${escapeXml(m.label)}</text>
          <text x="${x + 14}" y="${y + 38}" fill="${THEME.text}" font-size="20" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">${m.value}</text>
        `;
      })
      .join("");

    const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      ${cardBackground(w, h)}
      <text x="24" y="${TITLE_Y}" fill="${THEME.title}" font-size="${TITLE_SIZE}" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">GitHub Overview</text>
      <text x="24" y="${SUBTITLE_Y}" fill="${THEME.muted}" font-size="${SUBTITLE_SIZE}" font-family="Segoe UI, system-ui, sans-serif">@${escapeXml(username)}</text>
      ${metricCards}
    </svg>
    `;

    return svgResponse(svg);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
