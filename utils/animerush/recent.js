const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const getidfromname = require("../getidfromname");

module.exports = {
  data: {
    description: "Gets recent episodes",
  },
  run: async function () {
    let data = [];
    let response;
    try {
      response = await fetch(rush_base_url + "latest-anime-episodes/");
    } catch (e) {
      return [];
    }
    const body = await response.text();

    let $ = cheerio.load(body);

    let source = $(
      "#left-column > div > div > div.noraml-page_in_box_mid > ol"
    );
    let children = source.find("div");

    children.each(function (index, element) {
      let id = $(element)
        .find("a")[0]
        .attribs.href.split("/")[1]
        .split("-episode-");
      let img = rush_base_url + $(element).find("img")[0].attribs.src;

      data.push({
        animeId: id[0].toLowerCase(),
        animeTitle: $(element)
          .find("a")[1]
          .children[0].data.replace("\n", "")
          .split(" Episode ")[0],
        episodeNum: id[1],
        subOrDub: NaN,
        animeImg: img,
        watch_url: "/watch/" + id[0].toLowerCase() + "/" + id[1],
      });
    });

    return data;
  },
};
