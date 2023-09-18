const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const getidfromname = require("../getidfromname");

module.exports = {
  data: {
    description: "Returns stream for anime",
  },
  run: async function (id, episode) {
    let data = {};
    let response;
    try {
      response = await fetch(
        animegg_base_url + id + "-episode-" + episode,
        fetchArgs
      );
    } catch (e) {
      return { url: "/error" };
    }
    const body = await response.text();

    let $ = cheerio.load(body);

    let source = $("iframe.video");
    let url = source.attr("src");

    if (url == undefined) {
      data = {
        url: "/error",
      };
    } else {
      data = {
        url: animegg_base_url.substring(0, animegg_base_url.length - 1) + url,
      };
    }

    return data;
  },
};
