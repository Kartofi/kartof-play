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
      response = await fetch(animegg_base_url + "releases/", fetchArgs);
    } catch (e) {
      return [];
    }
    const body = await response.text();

    let $ = cheerio.load(body);

    let source = $("ul[class='popanime cats']");
    let children = source.find("li");

    children.each(function (index, element) {
      let id = $(element).find("a.releaseLink");
      if (id.html() == null) {
        return;
      }

      let img = $(element).find("div.releaseImg").find("img");
      let episode_num = $(element).find("strong").text();
      data.push({
        animeId: id[0].attribs.href.split("/")[2],
        animeTitle: id.html(),
        episodeNum: episode_num.split(" Episode ")[1],
        subOrDub: NaN,
        animeImg: img[0].attribs.src,
        watch_url:
          "/watch/" +
          id[0].attribs.href.split("/")[2] +
          "/" +
          episode_num.split(" Episode ")[1],
      });
    });

    return data;
  },
};
