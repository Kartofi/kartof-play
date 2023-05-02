const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const getidfromname = require("../getidfromname");

module.exports = {
  data: {
    description: "Returns stream for anime",
  },
  run: async function (name, episode) {
    let data = {};
    let response;
    try {
      response = await fetch(rush_base_url + name + "-episode-" + episode);
    } catch (e) {
      return { url: "/error" };
    }
    const body = await response.text();

    let $ = cheerio.load(body);

    let source = $("div.player-area");
    let url = source.children().find("iframe").attr("src");
    if (url == undefined) {
      data = {
        url: "/error",
      };
    } else {
      data = {
        url: url,
      };
    }

    return data;
  },
};
