const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const getidfromname = require("../getidfromname");
const cheerio = require("cheerio");

module.exports = {
  data: {
    description: "Searches in gogo anime",
  },
  run: async function (name) {
    let data = [];
    let response = await fetch(
      gogo_base_url + "search.html?keyword=" + name
    );

    const body = await response.text();

    let $ = cheerio.load(body);
    let results = $("ul.items");
    
    results.children().each(function (index, element) {
      
      let title = $(element).find("a").attr("title");
      if (title == undefined) {
        return;
      }
      let image = $(element).find("img").attr("src");
      let id = $(element).find("a").attr("href").split("/")[2];
      let watch_url = "/watch/" + $(element).find("a").attr("href").split("/")[2] + "/1"
      
      data.push({
        animeId: id,
        animeTitle: title,
        animeImg: image,
        watch_url: watch_url,
        rating: "",
        source: "(GoGoAnime)"
      })
    });
   
    return data;
  },
};
