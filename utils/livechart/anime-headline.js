let Parser = require("rss-parser");
let parser = new Parser();

module.exports = {
  data: {
    description: "Gives headline animes",
  },
  run: async function () {
    let data = [];

    let feed = await parser.parseURL(
      "https://www.livechart.me/feeds/headlines"
    );

    feed.items.forEach((item) => {
      data.push({
        title: item.title,
        img: item.enclosure.url,
        pubDate: item.pubDate,
      });
    });
  },
};
