const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const getidfromname = require("../getidfromname");

module.exports = {
  data: {
    description: "Search inside of animerush",
  },
  run: async function (keyword) {
    let data = [];
    let response;
    try {
      response = await fetch(
        animegg_base_url + "search/?q=" + keyword,
        fetchArgs
      );
    } catch (e) {
      return [];
    }
    const body = await response.text();

    let $ = cheerio.load(body);

    let source = $("div[class='moose page']");
    let children = source.children();
    children.each(async function (index, element) {
      if (element.name == "a") {
        if (element.attribs.class == "mse") {
          let element_data = $(element);
          let id = element_data.attr("href").split("/")[2];
          let image = element_data.find("img.media-object").attr("src");
          let title = element_data.find("h2").first().text();

          let divs = element_data.find("div");

          let episodes = divs.last().prev().prev().text().split(" ")[1];
          data.push({
            animeId: id,
            animeTitle: title,
            animeImg: image,
            episodes: episodes,
            watch_url: "/watch/" + id + "/1",
          });
        }
      }
    });

    return data;
  },
};
