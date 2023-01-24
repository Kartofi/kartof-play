const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const getidfromname = require("../getidfromname");

module.exports = {
  data: {
    description: "Searches in MAL",
  },
  run: async function (keyword) {
    let data = [];
    let response = await fetch(
      "https://myanimelist.net/anime.php?q=" + keyword + "&cat=anime"
    );
    const body = await response.text();

    let $ = cheerio.load(body);

    let table = $(
      "#content > div.js-categories-seasonal.js-block-list.list > table > tbody"
    ).children();
    table.each((index, element) => {
      let sel = $(element);
      let image = sel.find("a.hoverinfo_trigger").children().first();
      let desc = sel.find("div.pt4").text();
      let score = sel.find("td").last().text();
      let type = sel.find("td").get(2).children[0].data;
      let eps = sel.find("td").get(3).children[0].data;

      if (image.length >= 1) {
        data.push({
          animeImg: image[0].attribs["data-srcset"].split(" ")[2].replace(".jpg", "l.jpg").replace("/r/100x140", ""),
          animeTitle: image[0].attribs["alt"],
          desc: desc,
          rating: score,
          type: type,
          episodes: eps,
          watch_url: "/watch/" + getidfromname.run(image[0].attribs["alt"]) + "/1"
        });
      }
    });

    return data;
  },
};
