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

    const languageStats = {};

    // for (const repo of reposRes.data) {
    //   if (repo.fork) continue;

    //   const langRes = await axios.get(repo.languages_url, {
    //     headers: {
    //       Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    //     },
    //   });

    //   for (const [lang, bytes] of Object.entries(langRes.data)) {
    //     languageStats[lang] =
    //       (languageStats[lang] || 0) + bytes;
    //   }
    // }

    const filteredRepos = reposRes.data.filter(
  (repo) => !repo.fork
);

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
    languageStats[lang] =
      (languageStats[lang] || 0) + bytes;
  }
});

    const sorted = Object.entries(languageStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const total = sorted.reduce((acc, [, val]) => acc + val, 0);

    const svg = `
    <svg width="450" height="300" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title {
          fill: #F4B400;
          font-size: 24px;
          font-weight: bold;
        }

        .text {
          fill: #5A3E00;
          font-size: 16px;
        }
      </style>

      <rect width="100%" height="100%" rx="20" fill="#FFF9DB" />

      <text x="20" y="40" class="title">Most Used Languages</text>

      ${sorted
        .map(([lang, bytes], i) => {
          const percentage = ((bytes / total) * 100).toFixed(1);

          return `
          <text x="20" y="${80 + i * 35}" class="text">
            ${lang}: ${percentage}%
          </text>
          `;
        })
        .join("")}
    </svg>
    `;

    // return new Response(svg, {
    //   headers: {
    //     "Content-Type": "image/svg+xml",
    //   },
    // });
    return new Response(svg, {
  headers: {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=3600",
  },
});
  } catch (err) {
    return Response.json({ error: err.message });
  }
}

