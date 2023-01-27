const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const cheerio = require("cheerio");
module.exports = {
  data: {
    description: "Gives popular animes",
  },
  run: async function (page) {
    let data = [];
    let response = await fetch("https://gogoanime.tel/popular.html?page=" + page);
    let body = await response.text();

    let $ = cheerio.load(body);
    
    
    $('div.last_episodes > ul > li').each((i, el) => {
      
      let image = $(el).find('div > a > img').attr('src');
      let title = $(el).find('p.name > a').attr('title')
      let id = $(el).find('p.name > a').attr('href').split("/category/")[1];
      let release = $(el).find("p.released").text().trim().replace("Released: ", "");
      let watch_url = "/watch/" + id + "/1"
      data.push({
        animeId: id,
        animeTitle: title,
        animeImg: image,
        releasedDate: release,
        watch_url: watch_url
      })
    })
    
    return data;
  },
};
