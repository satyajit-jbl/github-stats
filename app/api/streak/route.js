import axios from "axios";
import { THEME, svgResponse, cardBackground } from "../../../lib/svg-theme.js";

function contributionLevel(count) {
  if (count === 0) return THEME.grid;
  if (count <= 2) return "#F9E27A";
  if (count <= 5) return "#F4B400";
  if (count <= 9) return "#E09B00";
  return "#C47F00";
}

function computeStreaks(days) {
  let longestStreak = 0;
  let temp = 0;
  let currentStreak = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      temp++;
      longestStreak = Math.max(longestStreak, temp);
    } else {
      temp = 0;
    }
  }

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

export async function GET() {
  try {
    const username = process.env.GITHUB_USERNAME;

    const query = {
      query: `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `,
      variables: { username },
    };

    const response = await axios.post("https://api.github.com/graphql", query, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });

    const calendar =
      response.data.data.user.contributionsCollection.contributionCalendar;
    const weeks = calendar.weeks;
    const days = weeks.flatMap((w) => w.contributionDays);
    const { currentStreak, longestStreak } = computeStreaks(days);
    const totalContributions = calendar.totalContributions;

    const cell = 11;
    const gap = 3;
    const heatmapWidth = weeks.length * (cell + gap);
    const heatmapHeight = 7 * (cell + gap);
    const w = Math.max(720, heatmapWidth + 48);
    const h = 280;

    const heatmapCells = weeks
      .map((week, wi) =>
        week.contributionDays
          .map((day, di) => {
            const x = 24 + wi * (cell + gap);
            const y = 168 + di * (cell + gap);
            return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${contributionLevel(day.contributionCount)}"/>`;
          })
          .join("")
      )
      .join("");

    const statBox = (x, label, value, sub) => `
      <rect x="${x}" y="58" width="200" height="88" rx="12" fill="${THEME.grid}" stroke="${THEME.border}" stroke-width="1"/>
      <text x="${x + 16}" y="${82}" fill="${THEME.muted}" font-size="11" font-family="Segoe UI, system-ui, sans-serif">${label}</text>
      <text x="${x + 16}" y="${112}" fill="${THEME.title}" font-size="28" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">${value}</text>
      <text x="${x + 16}" y="${132}" fill="${THEME.text}" font-size="12" font-family="Segoe UI, system-ui, sans-serif">${sub}</text>
    `;

    const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      ${cardBackground(w, h, 16)}
      <text x="24" y="38" fill="${THEME.title}" font-size="20" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">Contributions &amp; Streak</text>
      ${statBox(24, "Current Streak", currentStreak, "days in a row")}
      ${statBox(248, "Total", totalContributions, "contributions (last year)")}
      ${statBox(472, "Longest Streak", longestStreak, "days best run")}
      <text x="24" y="158" fill="${THEME.muted}" font-size="11" font-family="Segoe UI, system-ui, sans-serif">Contribution graph</text>
      ${heatmapCells}
    </svg>
    `;

    return svgResponse(svg, 1800);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
