const cheerio = require("cheerio");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: {
    description: "Gives stream for the anime",
  },
  run: async function (id, episode) {
    let data = {
      url : "/error"
    };

    let response = await fetch(
      "https://gogoanime.tel/" +
        id +
        "-episode-" +
        episode
    )
    let body = await response.text();

    let $ = cheerio.load(body);
    let urll = $("#load_anime > div > div > iframe").attr("src")
    if (urll) {
      data.url = urll;
    }
    return data;
  },
};
