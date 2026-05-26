import axios from "axios";
import { THEME, escapeXml, svgResponse, cardBackground } from "../../../lib/svg-theme.js";

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

    const w = 495;
    const h = 195;

    const metricCards = metrics
      .map((m, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 24 + col * 238;
        const y = 72 + row * 58;
        return `
          <rect x="${x}" y="${y}" width="218" height="46" rx="10" fill="${THEME.grid}" stroke="${THEME.border}" stroke-width="1"/>
          <text x="${x + 14}" y="${y + 20}" fill="${THEME.muted}" font-size="11" font-family="Segoe UI, system-ui, sans-serif">${escapeXml(m.label)}</text>
          <text x="${x + 14}" y="${y + 38}" fill="${THEME.text}" font-size="20" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">${m.value}</text>
        `;
      })
      .join("");

    const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      ${cardBackground(w, h)}
      <text x="24" y="38" fill="${THEME.title}" font-size="20" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">GitHub Overview</text>
      <text x="24" y="56" fill="${THEME.muted}" font-size="12" font-family="Segoe UI, system-ui, sans-serif">@${escapeXml(username)}</text>
      ${metricCards}
    </svg>
    `;

    return svgResponse(svg);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
