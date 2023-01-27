const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
module.exports = {
  data: {
    description: "Gives recent animes",
  },
  run: async function (page) {
    let data = [];
    let response = await fetch("https://ajax.gogo-load.com/ajax/page-recent-release.html?page=" + page)
    let body = await response.text();
    let $ = cheerio.load(body);
    let container = $("body > div.last_episodes.loaddub > ul")
    
    container.children().each(function(index, element) {
  
    
      let id = $(element).find("p.name > a").attr("href").replace("/", "").split("-episode-")[0]
      let episodeNum = $(element).find("p.name > a").attr("href").replace("/", "").split("-episode-")[1]
     
      data.push({
        animeId: id,
        animeTitle: $(element).find("p.name > a").text(),
        episodeNum:episodeNum,
        subOrDub: $(element).find("div.img > a > div").attr("class").replace("type ic-", ""),
        animeImg: $(element).find("div.img > a > img").attr("src"),
        watch_url: "/watch/" + id + "/" + episodeNum,
      })
     
    })
    return data;
  },
};
