import axios from "axios";
import { THEME, svgResponse, cardBackground } from "../../../lib/svg-theme.js";

function formatNum(n) {
  return Number(n).toLocaleString("en-US");
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

async function fetchYearContributions(username, year, headers) {
  const now = new Date();
  const from = `${year}-01-01T00:00:00Z`;
  const to =
    year === now.getUTCFullYear()
      ? now.toISOString()
      : `${year}-12-31T23:59:59Z`;

  const response = await axios.post(
    "https://api.github.com/graphql",
    {
      query: `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
      `,
      variables: { username, from, to },
    },
    { headers }
  );

  return (
    response.data.data.user.contributionsCollection.contributionCalendar
      .totalContributions ?? 0
  );
}

async function fetchAllTimeContributions(username, years, headers) {
  const counts = await Promise.all(
    years.map((year) => fetchYearContributions(username, year, headers))
  );
  return counts.reduce((sum, n) => sum + n, 0);
}

export async function GET() {
  try {
    const username = process.env.GITHUB_USERNAME;
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    };

    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query: `
          query($username: String!) {
            user(login: $username) {
              contributionsCollection {
                contributionYears
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
      },
      { headers }
    );

    const collection = response.data.data.user.contributionsCollection;
    const calendar = collection.contributionCalendar;
    const days = calendar.weeks.flatMap((w) => w.contributionDays);
    const { currentStreak, longestStreak } = computeStreaks(days);
    const pastYearContributions = calendar.totalContributions;

    const allTimeContributions = await fetchAllTimeContributions(
      username,
      collection.contributionYears,
      headers
    );

    const boxW = 210;
    const boxH = 92;
    const gap = 18;
    const startX = 24;
    const w = startX * 2 + boxW * 4 + gap * 3;
    const h = 175;

    const statBox = (x, label, value, sub) => `
      <rect x="${x}" y="58" width="${boxW}" height="${boxH}" rx="12" fill="${THEME.grid}" stroke="${THEME.border}" stroke-width="1"/>
      <text x="${x + 14}" y="82" fill="${THEME.muted}" font-size="11" font-family="Segoe UI, system-ui, sans-serif">${label}</text>
      <text x="${x + 14}" y="${value.length > 6 ? 108 : 112}" fill="${THEME.title}" font-size="${value.length > 6 ? 22 : 28}" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">${value}</text>
      <text x="${x + 14}" y="136" fill="${THEME.text}" font-size="11" font-family="Segoe UI, system-ui, sans-serif">${sub}</text>
    `;

    const boxes = [
      [startX + (boxW + gap) * 0, "Current Streak", String(currentStreak), "days in a row"],
      [startX + (boxW + gap) * 1, "Longest Streak", String(longestStreak), "days best run"],
      [
        startX + (boxW + gap) * 2,
        "Past Year",
        formatNum(pastYearContributions),
        "contributions (last 12 months)",
      ],
      [
        startX + (boxW + gap) * 3,
        "All-Time Total",
        formatNum(allTimeContributions),
        "contributions since joining",
      ],
    ];

    const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      ${cardBackground(w, h, 16)}
      <text x="24" y="38" fill="${THEME.title}" font-size="20" font-weight="700" font-family="Segoe UI, system-ui, sans-serif">Contributions &amp; Streak</text>
      ${boxes.map(([x, label, value, sub]) => statBox(x, label, value, sub)).join("")}
    </svg>
    `;

    return svgResponse(svg, 3600);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
