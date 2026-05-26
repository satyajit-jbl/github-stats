import axios from "axios";

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
                    date
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        username,
      },
    };

    const response = await axios.post(
      "https://api.github.com/graphql",
      query,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    const weeks =
      response.data.data.user.contributionsCollection
        .contributionCalendar.weeks;

    const days = weeks.flatMap((w) => w.contributionDays);

    let currentStreak = 0;
    let longestStreak = 0;
    let temp = 0;

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

    const totalContributions =
      response.data.data.user.contributionsCollection
        .contributionCalendar.totalContributions;

    const svg = `
    <svg width="450" height="280" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title {
          fill: #F4B400;
          font-size: 24px;
          font-weight: bold;
        }

        .text {
          fill: #5A3E00;
          font-size: 18px;
        }
      </style>

      <rect width="100%" height="100%" rx="20" fill="#FFF9DB" />

      <text x="20" y="40" class="title">
        Contribution Stats
      </text>

      <text x="20" y="90" class="text">
        Total Contributions: ${totalContributions}
      </text>

      <text x="20" y="140" class="text">
        Current Streak: ${currentStreak} days
      </text>

      <text x="20" y="190" class="text">
        Longest Streak: ${longestStreak} days
      </text>
    </svg>
    `;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });

  } catch (err) {
    return Response.json({
      error: err.message,
    });
  }
}