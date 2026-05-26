import axios from "axios";

export async function GET() {
  try {
    const username = process.env.GITHUB_USERNAME;

    const reposRes = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    const repos = reposRes.data;

    const totalRepos = repos.length;

    const totalStars = repos.reduce(
      (acc, repo) => acc + repo.stargazers_count,
      0
    );

    const svg = `
    <svg width="450" height="220" xmlns="http://www.w3.org/2000/svg">
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

      <text x="20" y="40" class="title">GitHub Stats</text>

      <text x="20" y="90" class="text">
        Total Repositories: ${totalRepos}
      </text>

      <text x="20" y="140" class="text">
        Total Stars: ${totalStars}
      </text>
    </svg>
    `;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  } catch (err) {
    return Response.json({ error: err.message });
  }
}