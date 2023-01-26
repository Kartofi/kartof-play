const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const getidformname = require("../getidfromname")
module.exports = {
  data: {
    description: "Gives details from gogo anime",
  },
  run: async function (id) {
    
    let data = {};
    let response = await fetch(
      "https://gogoanime.tel/category/" + id
    );

    const body = await response.text();

    let $ = cheerio.load(body);
    
    let img = $("#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > img").attr("src")
    let title = $("#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > h1").html()
    //let type = $("#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > p:nth-child(3) > a").attr("title")
    let synopsis = $("#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(5)").text().replace("Plot Summary: ", "")
    //let status = $("#wrapper_bg > section > section.content_left > div.main_body > div.anime_info_body > div.anime_info_body_bg > p:nth-child(7)").text().replace("Status: ", "")
    let other_names = $("#wrapper_bg > section > section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > p:nth-child(9)").text().replace("Other name: ", "").split("; ")
   
    
    
    let episodes = [];
    
    const ep_end = parseInt($('#episode_page > li').last().text().trim().split("-")[1]);
    
    for (let i =1; i< ep_end + 1; i++) {
      episodes.push({
        watchUrl: "/watch/" + getidformname.run(title) + "/" + i,
        episodeNum: i
      })
    }
data = {
  animeTitle : title,
  otherNames:other_names,
  synopsis: synopsis,
  animeImg: img,
  totalEpisodes: ep_end,
  episodesList: episodes,
  watch_id: getidformname.run(title)
}


return data;
  },
};
